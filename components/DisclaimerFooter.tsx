export default function DisclaimerFooter() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-error-container text-on-error-container py-stack-md px-container-padding text-center shadow-lg">
      <div className="max-w-[1000px] mx-auto flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm">info</span>
        <p className="font-label-md text-label-md leading-tight">
          This tool assists reading — always confirm with your pharmacist or doctor.
        </p>
      </div>
    </footer>
  );
}
