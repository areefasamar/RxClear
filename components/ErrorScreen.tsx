'use client';

const RATE_LIMIT_MESSAGE =
  'Our AI service is temporarily busy — please wait about a minute and try again.';

interface ErrorScreenProps {
  reason: string;
  onRetry: () => void;
  isRateLimited?: boolean;
}

export default function ErrorScreen({ reason, onRetry, isRateLimited = false }: ErrorScreenProps) {
  const displayReason = isRateLimited ? RATE_LIMIT_MESSAGE : reason;
  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in duration-500 flex justify-center">
      <div className="w-full max-w-[500px] tonal-card rounded-[20px] p-12 flex flex-col items-center justify-center gap-stack-md text-center border border-error/20">
        <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-error">
          Couldn't Read Prescription
        </h2>
        <p className="font-body-md text-on-surface-variant">
          {displayReason}
        </p>
        <button 
          onClick={onRetry}
          className="mt-4 outline-button px-8 py-3 font-label-md text-label-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Try Again
        </button>
      </div>
    </div>
  );
}
