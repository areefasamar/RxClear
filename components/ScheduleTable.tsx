'use client';

export interface ScheduleData {
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
}

export default function ScheduleTable({ schedule, allMedicines }: { schedule: ScheduleData, allMedicines: string[] }) {
  if (allMedicines.length === 0) return null;
  
  return (
    <section className="mb-stack-lg">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
        <span className="material-symbols-outlined">calendar_today</span> Daily Schedule
      </h2>
      <div className="surface-1-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-container/30 text-on-secondary-container">
                <th className="p-stack-md font-label-md text-label-md border-b border-outline-variant">Medicine</th>
                <th className="p-stack-md font-label-md text-label-md border-b border-outline-variant flex-shrink-0">Morning</th>
                <th className="p-stack-md font-label-md text-label-md border-b border-outline-variant flex-shrink-0">Afternoon</th>
                <th className="p-stack-md font-label-md text-label-md border-b border-outline-variant flex-shrink-0">Evening</th>
                <th className="p-stack-md font-label-md text-label-md border-b border-outline-variant flex-shrink-0">Night</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant font-body-md text-body-md">
              {allMedicines.map((med) => {
                // simple substring check to match API returned names with schedule
                const m = med.toLowerCase();
                const inMorning = schedule.morning?.some(s => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()));
                const inAfternoon = schedule.afternoon?.some(s => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()));
                const inEvening = schedule.evening?.some(s => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()));
                const inNight = schedule.night?.some(s => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()));
                
                return (
                  <tr key={med} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-stack-md border-b border-surface-container font-medium">{med}</td>
                    <td className="p-stack-md border-b border-surface-container">
                      {inMorning ? <span className="material-symbols-outlined text-primary text-sm">circle</span> : "—"}
                    </td>
                    <td className="p-stack-md border-b border-surface-container">
                      {inAfternoon ? <span className="material-symbols-outlined text-primary text-sm">circle</span> : "—"}
                    </td>
                    <td className="p-stack-md border-b border-surface-container">
                      {inEvening ? <span className="material-symbols-outlined text-primary text-sm">circle</span> : "—"}
                    </td>
                    <td className="p-stack-md border-b border-surface-container">
                      {inNight ? <span className="material-symbols-outlined text-primary text-sm">circle</span> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
