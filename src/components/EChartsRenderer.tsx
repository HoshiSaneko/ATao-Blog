import React, { useState, useEffect, useRef } from 'react';

interface ChartProps {
  option: any;
  height?: string | number;
}

const EChartsRenderer: React.FC<ChartProps> = ({ option, height = '400px' }) => {
  const [ReactECharts, setReactECharts] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer for better performance
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before it comes into view
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // Load echarts-for-react only when visible
  useEffect(() => {
    if (!isVisible) return;

    setMounted(true);
    
    // Dynamically import to avoid SSR issues
    import('echarts-for-react').then((module) => {
      setReactECharts(() => module.default);
    });
  }, [isVisible]);

  // Detect dark mode and listen for theme changes (only use event, no MutationObserver per instance)
  useEffect(() => {
    // Detect initial theme
    const detectTheme = () => {
      if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains('dark');
      }
      return false;
    };

    setIsDark(detectTheme());

    // Listen for theme changes via custom event (global MutationObserver handled elsewhere)
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail.isDark);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('theme-changed', handleThemeChange as EventListener);
      return () => {
        window.removeEventListener('theme-changed', handleThemeChange as EventListener);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full my-8 p-4 bg-white dark:bg-[#161B22] rounded-xl shadow-sm border border-slate-100 dark:border-white/5" 
      style={{ height: height }}
    >
      {!isVisible ? (
        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
          图表准备中...
        </div>
      ) : !ReactECharts ? (
        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
          加载图表中...
        </div>
      ) : (
        <>
          {(() => {
            const finalOption = {
              backgroundColor: 'transparent',
              ...option,
              // Inject default styles for better look in dark mode if not specified
              textStyle: {
                fontFamily: '"Inter", "Microsoft YaHei", sans-serif',
                ...option.textStyle
              }
            };
            
            return (
              <ReactECharts 
                option={finalOption} 
                style={{ height: height, width: '100%' }}
                theme={isDark ? 'dark' : undefined}
                opts={{ renderer: 'svg' }} // Use SVG for sharper rendering
              />
            );
          })()}
        </>
      )}
    </div>
  );
};

export default EChartsRenderer;

