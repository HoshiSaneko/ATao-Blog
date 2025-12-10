import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [leftPosition, setLeftPosition] = useState<number>(0);

  useEffect(() => {
    // Calculate position based on article content right edge
    const updatePosition = () => {
      const article = document.querySelector('article');
      if (article) {
        const rect = article.getBoundingClientRect();
        const articleRight = rect.right;
        const gap = 32; // 32px gap between article and TOC
        setLeftPosition(articleRight + gap);
      }
    };

    // Extract headings from the DOM
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6');
      const extracted: Heading[] = [];
      const seenIds = new Set<string>();

      headingElements.forEach((element) => {
        let id = element.id;
        const tagName = element.tagName.toLowerCase();
        const level = parseInt(tagName.charAt(1)) || 1;
        let text = element.textContent?.trim() || '';
        // Remove # symbol if present (from anchor links)
        text = text.replace(/#\s*$/, '').trim();

        // Skip if heading is inside a tab panel
        if (element.closest('[data-tab-panel="true"]')) {
          return;
        }

        // Skip headings that are inside sections with border-t class (AuthorCard, navigation, comments)
        // These sections are typically wrapped in divs with "border-t" class
        const borderTParent = element.closest('.border-t');
        if (borderTParent) {
          return;
        }

        // Skip headings inside link-card components
        if (element.closest('[data-link-card="true"]')) {
          return;
        }

        // Skip headings inside specific components
        if (
          element.closest('.twikoo') || // Comment section
          element.closest('#twikoo') || // Comment section by ID
          text === '评论' // Comment heading text
        ) {
          return;
        }

        // 跳过 h1 级别的标题
        if (level === 1) {
          return;
        }

        // 跳过特定文本的标题
        if (text === 'ATao' || text === 'atao') {
          return;
        }

        // 如果没有ID，尝试生成一个
        if (!id) {
          const text = element.textContent?.trim() || '';
          if (text) {
            // 简单的slugify
            id = text
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w\-]+/g, '')
              .replace(/\-\-+/g, '-');
          }
        }

        // 确保ID唯一性
        let uniqueId = id;
        let counter = 1;
        while (seenIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        seenIds.add(uniqueId);

        // 如果ID和文本都存在，添加到列表
        if (uniqueId && text) {
          // 如果ID改变了，更新DOM元素的ID
          if (element.id !== uniqueId) {
            element.id = uniqueId;
          }
          extracted.push({ id: uniqueId, text, level });
        }
      });

      setHeadings(extracted);
    };

    // Wait for content to be rendered
    const timer = setTimeout(() => {
      extractHeadings();
      updatePosition();
    }, 500);

    // Also try when DOM updates
    const observer = new MutationObserver(() => {
      extractHeadings();
      updatePosition();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Update position on window resize
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollOffset = 150; // Offset for navbar and padding

      // Find the current active heading
      let current = '';
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= scrollOffset) {
            current = headings[i].id;
            break;
          }
        }
      }

      // If no heading found and we're at the top, highlight first heading
      if (!current && headings.length > 0) {
        const firstElement = document.getElementById(headings[0].id);
        if (firstElement) {
          const rect = firstElement.getBoundingClientRect();
          if (rect.top > scrollOffset) {
            current = headings[0].id;
          }
        }
      }

      if (current) {
        setActiveId(current);
      }
    };

    // Use requestAnimationFrame with throttling for smoother scrolling
    let ticking = false;
    let lastScrollTop = 0;
    const throttleDelay = 100; // Throttle to 100ms

    const onScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Only update if scroll position changed significantly or enough time passed
      if (!ticking && (Math.abs(currentScrollTop - lastScrollTop) > 10)) {
        window.requestAnimationFrame(() => {
          handleScroll();
          lastScrollTop = currentScrollTop;
          ticking = false;
        });
        ticking = true;

        // Reset ticking after throttle delay
        setTimeout(() => {
          ticking = false;
        }, throttleDelay);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Table of Contents - Fixed position, hidden on small screens */}
      <aside
        style={{ left: `${leftPosition}px` }}
        className={`hidden lg:block fixed top-24 z-40 w-64 max-h-[calc(100vh-8rem)] transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
      >
        <div className="relative rounded-lg bg-white/80 dark:bg-[#1a1c23]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Decorative Watermark */}
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rotate-12 scale-125">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" />
            </svg>
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="mb-4 pb-2 border-b border-docs-accent/20 dark:border-dark-accent/20 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Menu size={14} className="text-docs-accent" />
                CATALOG
              </h3>
            </div>

            {/* Navigation items */}
            <nav className="relative max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar pr-2 -mr-3 pl-1">
              <div className="flex flex-col gap-0.5">
                {headings.map((heading, index) => {
                  const isActive = activeId === heading.id;
                  return (
                    <a
                      key={`${heading.id}-${index}`}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(heading.id);
                      }}
                      className={`group relative py-1.5 pr-2 text-sm transition-all duration-300 rounded-[4px] leading-snug flex items-center ${heading.level === 1 ? 'pl-2' :
                          heading.level === 2 ? 'pl-2' :
                            heading.level === 3 ? 'pl-5' :
                              'pl-8'
                        } ${isActive
                          ? 'text-docs-accent dark:text-dark-accent font-bold bg-docs-accent/5 dark:bg-dark-accent/10'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
                        }`}
                      title={heading.text}
                    >
                      {/* Active Indicator */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full transition-all duration-300 ${isActive
                            ? 'bg-docs-accent dark:bg-dark-accent opacity-100 shadow-sm shadow-docs-accent/50'
                            : 'bg-transparent opacity-0'
                          }`}
                      />

                      <span className={`block truncate transition-transform duration-300 ${isActive ? 'translate-x-1.5' : 'translate-x-0 group-hover:translate-x-1'}`}>
                        {heading.text}
                      </span>
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TableOfContents;

