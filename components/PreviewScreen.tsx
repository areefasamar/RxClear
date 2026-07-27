'use client';

interface PreviewScreenProps {
  compressedPreviewUrl: string;   // data URI from client-side compression
  onRetake: () => void;
  onDecode: () => void;
  isDecoding: boolean;
  cooldown: boolean;
}

export default function PreviewScreen({
  compressedPreviewUrl,
  onRetake,
  onDecode,
  isDecoding,
  cooldown,
}: PreviewScreenProps) {
  const decodeDisabled = isDecoding || cooldown;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in duration-500 flex justify-center">
      <div className="w-full max-w-[800px] tonal-card rounded-[20px] p-stack-lg flex flex-col items-center gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-on-background">Image Preview</h2>
        
        <div className="w-full max-w-[400px] aspect-auto rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 bg-surface-container-lowest">
          {compressedPreviewUrl && (
            <img
              src={compressedPreviewUrl}
              alt="Compressed prescription preview"
              className="w-full h-auto object-contain"
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          <button 
            onClick={onRetake}
            disabled={decodeDisabled}
            className={`outline-button px-8 py-3 font-label-md text-label-md text-on-surface-variant flex items-center justify-center gap-2 w-full sm:w-auto ${decodeDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Retake Photo
          </button>
          <button 
            type="button"
            id="decode-prescription-btn"
            onClick={onDecode}
            disabled={decodeDisabled}
            className={`primary-button px-8 py-3 font-label-md text-label-md flex items-center justify-center gap-2 shadow-md w-full sm:w-auto ${decodeDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-sm">
              {decodeDisabled ? 'hourglass_empty' : 'analytics'}
            </span>
            {isDecoding ? 'Processing...' : cooldown ? 'Please wait…' : 'Decode Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
}
