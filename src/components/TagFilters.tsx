import { useState, useEffect } from 'react';
import { Filter, ChevronUp } from 'lucide-react';

interface TagFiltersProps {
  tags: string[];
}

const TagFilters: React.FC<TagFiltersProps> = ({ tags }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [leftPosition, setLeftPosition] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Calculate position based on main content right edge
    const updatePosition = () => {
      const main = document.querySelector('main');
      if (main) {
        const rect = main.getBoundingClientRect();
        const mainRight = rect.right;
        const gap = 32; // 32px gap between content and filters
        const newPosition = mainRight + gap;
        
        // Only update if position is valid (greater than 0)
        if (newPosition > 0) {
          setLeftPosition(newPosition);
          setIsVisible(true);
          return true;
        }
      }
      return false;
    };

    // Try to update position immediately
    if (updatePosition()) {
      // Position calculated successfully, set up listeners
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }

    // If immediate update failed, try with requestAnimationFrame
    let rafId: number;
    let attempts = 0;
    const maxAttempts = 10; // Try up to 10 times (about 160ms at 60fps)

    const tryUpdate = () => {
      attempts++;
      if (updatePosition() || attempts >= maxAttempts) {
        // Position calculated or max attempts reached
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { passive: true });
      } else {
        rafId = requestAnimationFrame(tryUpdate);
      }
    };

    rafId = requestAnimationFrame(tryUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Listen for tag filter changes from mobile filters
  useEffect(() => {
    const handleTagFilter = ((e: CustomEvent) => {
      const tag = e.detail.tag === '' ? null : e.detail.tag;
      setSelectedTag(tag);
    }) as EventListener;

    window.addEventListener('tag-filter-changed', handleTagFilter);
    return () => window.removeEventListener('tag-filter-changed', handleTagFilter);
  }, []);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    // Dispatch event to sync with mobile filters and update posts
    window.dispatchEvent(new CustomEvent('tag-filter-changed', { 
      detail: { tag: tag || '' } 
    }));
  };

  if (tags.length === 0) return null;

  return (
    <aside
      style={{ left: `${leftPosition}px` }}
      className={`hidden lg:block fixed top-64 z-40 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-transparent pr-4">
        {/* 筛选图标按钮 - 默认显示 */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-docs-accent dark:hover:text-dark-accent"
            aria-label="展开标签筛选"
          >
            <Filter size={18} />
          </button>
        )}

        {/* 展开的标签筛选区域 */}
        <div
          className={`w-56 max-h-[calc(100vh-16rem)] overflow-hidden transition-all duration-300 ease-out origin-top-left ${
            isExpanded
              ? 'opacity-100 max-h-[calc(100vh-16rem)] scale-100'
              : 'opacity-0 max-h-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="overflow-y-auto max-h-[calc(100vh-16rem)] pr-2">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 
                onClick={() => setIsExpanded(false)}
                className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer hover:text-docs-accent dark:hover:text-dark-accent transition-colors"
              >
                <Filter size={16} />
                标签筛选
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="收起标签筛选"
              >
                <ChevronUp size={16} />
              </button>
            </div>

            {/* Tag buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTagSelect(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border text-left ${
                  selectedTag === null
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                    : 'bg-transparent text-slate-600 border-slate-200 hover:border-docs-accent/50 hover:text-docs-accent dark:text-slate-400 dark:border-white/10 dark:hover:border-dark-accent/50 dark:hover:text-dark-accent hover:bg-slate-50 dark:hover:bg-white/5'
                } ${
                  isExpanded ? 'animate-tag-slide-in' : 'opacity-0 -translate-x-2.5'
                }`}
                style={{
                  animationDelay: isExpanded ? '0ms' : '0ms',
                }}
              >
                全部
              </button>
              {tags.map((tag, index) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border text-left ${
                    selectedTag === tag
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                      : 'bg-transparent text-slate-600 border-slate-200 hover:border-docs-accent/50 hover:text-docs-accent dark:text-slate-400 dark:border-white/10 dark:hover:border-dark-accent/50 dark:hover:text-dark-accent hover:bg-slate-50 dark:hover:bg-white/5'
                  } ${
                    isExpanded ? 'animate-tag-slide-in' : 'opacity-0 -translate-x-2.5'
                  }`}
                  style={{
                    animationDelay: isExpanded ? `${(index + 1) * 30}ms` : '0ms',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TagFilters;

