'use client';

interface NavbarProps {
  currentTab: 'home' | 'history';
  onTabChange: (tab: 'home' | 'history') => void;
}

export default function Navbar({ currentTab, onTabChange }: NavbarProps) {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center h-16 px-container-padding max-w-[1000px] mx-auto w-full">
        <div className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOBeCDXR8PpXWU9HDmSq-02tJOG3BJvQi4zw49X7IvDdo11FSed6TSrPCEMfXHj90wOg3fk7bdW0FtrtCM8gIRoIgTgfmis0I2doZN6au7ls3Pm2BLgYbH4OyhM1k9LTAYohYJ13QhvsdInkJoaYJlzZ-TfKyhzXk3wDSRfIfwS_ps5ruZ63D-22i85bXTi5GFK7cqvXn6LrZGOWJ7Cwq214sjT5UIygqiIVpwYs5QrNzpoRHNt1Q08U5I5ICbw5BiVhZzpVs7ZWM" 
            alt="RxClear Logo" 
            className="h-10 w-auto" 
          />
          <span>RxClear</span>
        </div>
        <nav className="hidden md:flex gap-stack-lg items-center font-label-md text-label-md">
          <button 
            onClick={() => onTabChange('home')}
            className={`${currentTab === 'home' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors`}
          >
            Home
          </button>
          <button 
            onClick={() => onTabChange('history')}
            className={`${currentTab === 'history' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors`}
          >
            History
          </button>
        </nav>
        <button className="md:hidden p-2 text-on-surface-variant">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
