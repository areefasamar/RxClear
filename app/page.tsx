'use client';
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import DisclaimerFooter from "@/components/DisclaimerFooter";
import UploadScreen from "@/components/UploadScreen";
import PreviewScreen from "@/components/PreviewScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsScreen, { DecodedResult } from "@/components/ResultsScreen";
import ErrorScreen from "@/components/ErrorScreen";
import HistoryScreen from "@/components/HistoryScreen";
import { useAuth } from "@/lib/auth"; 
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type AppState = 'upload' | 'preview' | 'loading' | 'results' | 'error';
type TabState = 'home' | 'history';

// Map raw API reason codes → friendly, user-facing sentences.
const REASON_MESSAGES: Record<string, string> = {
  rate_limited:      'Our AI service is temporarily busy — please wait a moment and try again.',
  too_many_requests: 'You have made too many requests. Please wait an hour and try again.',
  quota_exhausted:   'The AI quota has been reached for today. Please try again later.',
  model_unavailable: 'The AI model is temporarily unavailable. Please try again shortly.',
  api_key:           'The server is not configured correctly. Please contact support.',
  service_error:     'The AI service encountered an unexpected error. Please try again.',
};

function humanizeReason(reason: string): string {
  return REASON_MESSAGES[reason] ?? reason;
}

// ---------------------------------------------------------------------------
// Client-side image compression
// Max longest side: 1280px, JPEG quality: 70%
// Returns { base64: string (no prefix), previewDataUrl: string (data URI) }
// ---------------------------------------------------------------------------
const compressImage = (
  file: File
): Promise<{ base64: string; previewDataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const MAX_DIM = 1280;

      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));

      ctx.drawImage(img, 0, 0, width, height);

      // 70% JPEG quality
      const previewDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const base64 = previewDataUrl.split(',')[1];

      resolve({ base64, previewDataUrl });
    };

    img.onerror = (err) => reject(err);
  });
};

export default function Home() {
  const { user } = useAuth(); // Triggers silent anonymous sign-in on mount
  
  const [tab, setTab] = useState<TabState>('home');
  const [appState, setAppState] = useState<AppState>('upload');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Compressed preview data URI — shown in PreviewScreen instead of the raw File
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [errorReason, setErrorReason] = useState<string>('');
  const [errorRateLimited, setErrorRateLimited] = useState(false);
  
  const [isDecoding, setIsDecoding] = useState(false);
  const isDecodingRef = useRef(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownRef = useRef(false);

  // AbortController ref — cancel in-flight requests on navigate-away or resubmit
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleImageSelected = async (file: File) => {
    setImageFile(file);
    // Compress immediately so the preview shows the compressed version
    try {
      const { previewDataUrl } = await compressImage(file);
      setCompressedPreviewUrl(previewDataUrl);
    } catch {
      // Fall back to a temporary object URL if compression fails
      setCompressedPreviewUrl(URL.createObjectURL(file));
    }
    setAppState('preview');
  };

  const handleRetake = () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setImageFile(null);
    setCompressedPreviewUrl('');
    setAppState('upload');
  };

  // Decode is triggered ONLY by the button's onClick — never from a useEffect
  const handleDecode = async () => {
    if (!imageFile || isDecodingRef.current || cooldownRef.current) return;

    // Cancel any previously in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    isDecodingRef.current = true;
    setIsDecoding(true);
    setAppState('loading');

    try {
      // Re-compress to get the base64 payload (or reuse the already-compressed data)
      const { base64 } = await compressImage(imageFile);
      
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64,
          mimeType: 'image/jpeg' 
        }),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        // Surface 429 rate-limit from the server-side rate limiter
        if (response.status === 429) {
          setErrorRateLimited(true);
          setErrorReason('');
          setAppState('error');
          return;
        }
        throw new Error('Failed to decode prescription');
      }
      
      const data = await response.json();

      if (data.readable === false) {
        const rateLimited =
          data.reason === 'rate_limited' || data.reason === 'too_many_requests';
        setErrorRateLimited(rateLimited);
        setErrorReason(
          rateLimited
            ? ''
            : humanizeReason(data.reason || 'Image is too blurry or does not appear to be a prescription.')
        );
        setAppState('error');
        return;
      }

      if (db && user) {
        try {
          const docRef = await addDoc(collection(db, "prescriptions"), {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp(),
          });
          data.id = docRef.id;
        } catch (fsErr) {
          console.error("Failed to save history to Firestore:", fsErr);
        }
      }

      setResult(data);
      setAppState('results');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was intentionally cancelled — stay on current screen
        console.log('Decode request cancelled');
        return;
      }
      console.error(err);
      setErrorRateLimited(false);
      setErrorReason('An unexpected error occurred. Please try again.');
      setAppState('error');
    } finally {
      isDecodingRef.current = false;
      setIsDecoding(false);
      // Only start cooldown if the request wasn't aborted
      if (!controller.signal.aborted) {
        cooldownRef.current = true;
        setCooldown(true);
        setTimeout(() => {
          cooldownRef.current = false;
          setCooldown(false);
        }, 10000); // 10-second cooldown
      }
    }
  };

  const handleStartOver = () => {
    setImageFile(null);
    setCompressedPreviewUrl('');
    setResult(null);
    setAppState('upload');
    setTab('home');
  };

  const handleViewHistoryResult = (historyResult: DecodedResult) => {
    setResult(historyResult);
    setAppState('results');
    setTab('home');
  };

  return (
    <>
      <Navbar currentTab={tab} onTabChange={setTab} />
      
      <main className="flex-grow">
        {tab === 'history' ? (
          <HistoryScreen onViewResult={handleViewHistoryResult} />
        ) : (
          <>
            {appState === 'upload' && <UploadScreen onImageSelected={handleImageSelected} />}
            {appState === 'preview' && imageFile && (
              <PreviewScreen 
                compressedPreviewUrl={compressedPreviewUrl}
                onRetake={handleRetake} 
                onDecode={handleDecode} 
                isDecoding={isDecoding}
                cooldown={cooldown}
              />
            )}
            {appState === 'loading' && <LoadingScreen />}
            {appState === 'results' && result && (
              <ResultsScreen result={result} onStartOver={handleStartOver} />
            )}
            {appState === 'error' && (
              <ErrorScreen
                reason={errorReason}
                isRateLimited={errorRateLimited}
                onRetry={handleRetake}
              />
            )}
          </>
        )}
      </main>

      <DisclaimerFooter />
    </>
  );
}
