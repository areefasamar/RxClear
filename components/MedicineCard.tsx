'use client';

export interface MedicineData {
  name: string;
  confidence: "high" | "medium" | "low";
  purpose: string | null;
  dosage: string | null;
  duration: string | null;
  side_effects: string[];
  note: string | null;
}

export default function MedicineCard({ medicine }: { medicine: MedicineData }) {
  const isHigh = medicine.confidence === 'high';
  const isMedium = medicine.confidence === 'medium';
  
  const badgeClasses = isHigh 
    ? "bg-[#dcfce7] text-[#15803d]" // green-100 and green-700
    : isMedium 
      ? "bg-tertiary-container/30 text-tertiary"
      : "bg-error-container text-on-error-container";
      
  const badgeIcon = isHigh ? "check_circle" : isMedium ? "warning" : "error";
  const badgeText = isHigh ? "High Confidence" : isMedium ? "Needs Confirmation" : "Unclear — Action Required";
  
  const borderClass = (!isHigh) ? "border-2 border-tertiary-container/50" : "";

  return (
    <div className={`surface-1-card p-stack-lg flex flex-col gap-4 relative overflow-hidden ${borderClass}`}>
      <div className={`flex justify-between items-start ${medicine.confidence === 'low' ? 'mt-2' : ''}`}>
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{medicine.name}</h3>
        <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 ${badgeClasses}`}>
          <span className="material-symbols-outlined text-[14px]">{badgeIcon}</span> {badgeText}
        </span>
      </div>
      
      {!isHigh && medicine.note && (
        <p className="text-sm text-tertiary mb-1 italic">
          {medicine.note}
        </p>
      )}
      
      <div className="space-y-3">
        {medicine.purpose && (
          <div className="flex items-start gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary mt-0.5">medical_services</span>
            <span className="font-label-md text-label-md">Purpose: {medicine.purpose}</span>
          </div>
        )}
        {medicine.dosage && (
          <div className="flex items-start gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary mt-0.5">medication</span>
            <span className="font-label-md text-label-md">Dosage: {medicine.dosage}</span>
          </div>
        )}
        {medicine.duration && (
          <div className="flex items-start gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary mt-0.5">event_repeat</span>
            <span className="font-label-md text-label-md">Duration: {medicine.duration}</span>
          </div>
        )}
        {medicine.side_effects && medicine.side_effects.length > 0 && (
          <div className="flex items-start gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary mt-0.5">warning</span>
            <span className="font-label-md text-label-md">Side effects: {medicine.side_effects.join(', ')}</span>
          </div>
        )}
      </div>
      
      {medicine.confidence === 'low' && (
        <button className="mt-2 w-full py-2 bg-error-container text-on-error-container rounded-[16px] font-label-md hover:opacity-90 transition-opacity pointer-events-none">
          Confirm Medicine Name
        </button>
      )}
    </div>
  );
}
