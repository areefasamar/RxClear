'use client';
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { DecodedResult } from "./ResultsScreen";

interface HistoryScreenProps {
  onViewResult: (result: DecodedResult) => void;
}

export default function HistoryScreen({ onViewResult }: HistoryScreenProps) {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<DecodedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function fetchHistory() {
      if (!db) {
        setLoading(false);
        setError("Database not configured. History is unavailable.");
        return;
      }
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "prescriptions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DecodedResult));
        setHistory(results);
      } catch (err: any) {
        console.error("Error fetching history:", err);
        // Firebase indices might be missing for composite query, or rules denying access
        if (err.message?.includes('index')) {
          setError("Database index building. History temporarily unavailable.");
        } else {
          setError("Failed to load history.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 flex justify-center mt-12">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in duration-500">
      <h2 className="font-headline-lg text-headline-lg text-on-background mb-stack-lg">Your History</h2>
      
      {error && (
        <div className="surface-1-card p-6 border-l-4 border-l-error mb-stack-lg">
          <p className="text-error">{error}</p>
        </div>
      )}
      
      {!user && !error && (
        <div className="text-on-surface-variant">Authentication failed or not configured.</div>
      )}

      {user && history.length === 0 && !error && (
        <div className="surface-1-card p-12 text-center flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-4xl text-outline-variant">history</span>
          <p className="text-on-surface-variant font-body-md">You haven't decoded any prescriptions yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-gutter">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onViewResult(item)}
            className="surface-1-card p-stack-lg cursor-pointer hover:border-primary border border-transparent transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface line-clamp-1">
                  {item.medicines?.map(m => m.name).join(', ') || 'Unknown Medicine'}
                </h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{item.summary}</p>
            </div>
            <div className="flex items-center gap-2 text-label-sm text-outline mt-auto border-t border-surface-container-highest pt-4">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
