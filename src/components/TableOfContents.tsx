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
        className={`hidden lg:block fixed top-24 z-40 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800`}
      >
        <div className="pl-4">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Menu size={14} />
              本页内容
            </h3>
          </div>

          {/* Navigation items */}
          <nav className="relative">
            {/* Track Line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col">
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
                    className={`group relative py-1.5 pr-4 text-sm transition-all duration-200 leading-snug ${heading.level === 1 ? 'pl-4' :
                      heading.level === 2 ? 'pl-4' :
                        heading.level === 3 ? 'pl-8' :
                          'pl-12'
                      } ${isActive
                        ? 'text-docs-accent dark:text-dark-accent font-medium'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    title={heading.text}
                  >
                    {/* Active/Hover Indicator Line */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-full w-[2px] transition-all duration-200 rounded-r-full ${isActive
                        ? 'bg-docs-accent dark:bg-dark-accent opacity-100'
                        : 'bg-slate-400 dark:bg-slate-500 opacity-0 group-hover:opacity-50 scale-y-50 group-hover:scale-y-100'
                        }`}
                    />

                    <span className={`block truncate ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                      {heading.text}
                    </span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default TableOfContents;

