'use client';
import MedicineCard, { MedicineData } from "./MedicineCard";
import ScheduleTable, { ScheduleData } from "./ScheduleTable";

export interface DecodedResult {
  readable: boolean;
  reason?: string;
  summary?: string;
  medicines?: MedicineData[];
  schedule?: ScheduleData;
  createdAt?: any;
  id?: string;
}

interface ResultsScreenProps {
  result: DecodedResult;
  onStartOver: () => void;
}

export default function ResultsScreen({ result, onStartOver }: ResultsScreenProps) {
  if (!result.readable) {
    return null;
  }

  const allMedicines = result.medicines?.map(m => m.name) || [];

  const handleSavePdf = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const textToShare = `Prescription Summary:\n${result.summary}\n\nMedicines:\n` + 
          (result.medicines?.map(m => `- ${m.name} (${m.dosage || 'No dosage specified'})`).join('\n') || 'None');
          
        await navigator.share({
          title: 'My Prescription Details',
          text: textToShare,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="mb-stack-lg print:mb-4">
        <div className="bg-primary-container/10 border border-primary-container/20 rounded-[20px] p-stack-md flex items-center gap-stack-md">
          <div className="bg-primary-container p-3 rounded-full text-on-primary-container flex items-center justify-center print:hidden">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">Decoded Results</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{result.summary}</p>
          </div>
        </div>
      </section>

      {result.medicines && result.medicines.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-grid-gutter mb-stack-lg print:grid-cols-1 print:gap-4">
          {result.medicines.map((med, idx) => (
            <MedicineCard key={idx} medicine={med} />
          ))}
          <div className="surface-1-card overflow-hidden h-full flex flex-col justify-center items-center p-stack-lg bg-surface-container border border-surface-container-highest print:hidden">
            <div className="w-24 h-24 mb-4 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <p className="font-label-md text-label-md text-center max-w-[200px] text-on-surface-variant">Your health data is encrypted and secure.</p>
          </div>
        </section>
      )}

      {result.schedule && (
        <ScheduleTable schedule={result.schedule} allMedicines={allMedicines} />
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-stack-md py-stack-lg print:hidden">
        <button 
          onClick={handleSavePdf}
          className="primary-button px-stack-lg py-4 w-full md:w-auto font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="material-symbols-outlined">file_download</span> Save Result as PDF
        </button>
        <button 
          onClick={handleShare}
          className="outline-button px-stack-lg py-4 w-full md:w-auto font-label-md text-label-md text-on-surface-variant flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">share</span> Share Results
        </button>
        <button 
          onClick={onStartOver}
          className="outline-button px-stack-lg py-4 w-full md:w-auto font-label-md text-label-md text-on-surface-variant flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">restart_alt</span> Start Over
        </button>
      </div>
    </div>
  );
}
