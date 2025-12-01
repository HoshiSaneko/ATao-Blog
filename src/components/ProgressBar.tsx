import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    let lastProgress = -1;
    
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const totalScroll = documentHeight - windowHeight;
      if (totalScroll <= 0) {
        setProgress(100);
        return;
      }
      
      const currentProgress = (scrollTop / totalScroll) * 100;
      const roundedProgress = Math.min(100, Math.max(0, Math.round(currentProgress)));
      
      // Only update if progress changed significantly (reduce re-renders)
      if (Math.abs(roundedProgress - lastProgress) > 0.5) {
        setProgress(roundedProgress);
        lastProgress = roundedProgress;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial check in case we load scrolled down
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Trigger 'near end' state when progress is > 85%
  const isNearEnd = progress > 85;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
      <div 
        className={`h-full transition-colors duration-500 ease-out relative ${
          isNearEnd 
            ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
            : 'bg-docs-accent dark:bg-dark-accent shadow-[0_0_10px_rgba(66,133,244,0.5)]'
        }`}
        style={{ width: `${progress}%`, transitionProperty: 'width, background-color, box-shadow' }}
      >
        {/* End Indicator Icon - Hangs below the bar, right-aligned to the tip */}
        <div 
          className={`absolute right-0 top-2 transition-all duration-500 transform ${
             isNearEnd ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
           <div className="bg-white dark:bg-slate-800 text-emerald-500 p-0.5 rounded-full shadow-md border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center backdrop-blur-sm">
              <Check size={10} strokeWidth={4} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

