'use client';
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlow(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in duration-500 flex justify-center">
      <div className="w-full max-w-[500px] tonal-card rounded-[20px] p-12 flex flex-col items-center justify-center gap-stack-md text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <h2 className="font-headline-md text-headline-md text-primary">
          {slow ? "Still working..." : "Reading prescription..."}
        </h2>
        <p className="font-body-md text-on-surface-variant">
          {slow 
            ? "Complex prescriptions take a moment. We're carefully analyzing the text."
            : "Our AI is analyzing the handwriting and matching it against medical databases."}
        </p>
      </div>
    </div>
  );
}
