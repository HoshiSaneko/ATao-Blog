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
      className={`hidden lg:block fixed top-64 z-40 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="bg-transparent pr-4">
        {/* 筛选图标按钮 - 默认显示 */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 flex items-center justify-center rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:shadow-docs-accent/20 hover:border-docs-accent hover:text-docs-accent transition-all duration-300 group"
            aria-label="展开标签筛选"
          >
            <Filter size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* 展开的标签筛选区域 - Genshin Inspired Panel */}
        <div
          className={`w-56 max-h-[calc(100vh-16rem)] overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-top-left ${isExpanded
              ? 'opacity-100 max-h-[calc(100vh-16rem)] scale-100 translate-y-0 translate-x-0'
              : 'opacity-0 max-h-0 scale-90 -translate-y-4 -translate-x-4 pointer-events-none'
            }`}
        >
          {/* Glass Effect Container */}
          <div className="relative rounded-lg bg-white/90 dark:bg-[#1a1c23]/95 backdrop-blur-md border border-slate-200 dark:border-[#2c2f3b] shadow-xl overflow-hidden">

            {/* Top Decorative Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-docs-accent/50 to-transparent opacity-50"></div>

            {/* Bottom Background Watermark */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" />
              </svg>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-16rem)] p-4 relative z-10 custom-scrollbar">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <h3
                  onClick={() => setIsExpanded(false)}
                  className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer hover:text-docs-accent transition-colors"
                >
                  <Filter size={14} className="text-docs-accent" />
                  TAGS
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="收起标签筛选"
                >
                  <ChevronUp size={16} />
                </button>
              </div>

              {/* Tag buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleTagSelect(null)}
                  className={`px-3 py-2 rounded-[4px] text-sm font-medium transition-all duration-300 border text-left flex items-center justify-between group ${selectedTag === null
                      ? 'bg-docs-accent text-white border-docs-accent shadow-md shadow-docs-accent/20'
                      : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-docs-accent/5 hover:text-docs-accent dark:hover:text-docs-accent'
                    } ${isExpanded ? 'animate-tag-slide-in' : 'opacity-0 -translate-x-2'
                    }`}
                  style={{
                    animationDelay: isExpanded ? '0ms' : '0ms',
                  }}
                >
                  <span>全部</span>
                  {selectedTag === null && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </button>
                {tags.map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-2 rounded-[4px] text-sm font-medium transition-all duration-300 border text-left flex items-center justify-between group ${selectedTag === tag
                        ? 'bg-docs-accent text-white border-docs-accent shadow-md shadow-docs-accent/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-docs-accent/5 hover:text-docs-accent dark:hover:text-docs-accent'
                      } ${isExpanded ? 'animate-tag-slide-in' : 'opacity-0 -translate-x-2'
                      }`}
                    style={{
                      animationDelay: isExpanded ? `${(index + 1) * 30}ms` : '0ms',
                    }}
                  >
                    <span>{tag}</span>
                    <span className={`w-1 h-3 rounded-full bg-docs-accent/30 opacity-0 group-hover:opacity-100 transition-opacity ${selectedTag === tag ? 'bg-white opacity-100' : ''}`}></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TagFilters;

