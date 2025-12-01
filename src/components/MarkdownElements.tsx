import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Info, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Icon } from '@iconify/react';
import { extractText, slugify } from '../utils/markdown';
import { CodeBlock } from './CodeBlock';

// --- Link Component ---
export const MarkdownLink = memo(function MarkdownLink({ href, title, children, node, ...props }: any) {
  const isAnchor = href?.startsWith('#');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; position?: 'top' | 'bottom' }>({ top: 0, left: 0 });
  const [IconComponent, setIconComponent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Ensure we're in the browser before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get title from multiple sources (memoized for performance)
  const linkTitle = useMemo(() => {
    const nodeProps = node?.properties || {};
    const nodeTitle = nodeProps.title;
    const dataLinkTitle = nodeProps['data-link-title'] || (props as any)?.['data-link-title'];

    // Priority order:
    // 1. Direct title prop (highest priority)
    if (title) {
      return String(title);
    }
    // 2. data-link-title from preprocessing
    if (dataLinkTitle) {
      return typeof dataLinkTitle === 'string' ? dataLinkTitle : String(dataLinkTitle);
    }
    // 3. node.properties.title from react-markdown
    if (nodeTitle) {
      if (typeof nodeTitle === 'string') {
        return nodeTitle;
      } else if (typeof nodeTitle === 'object' && nodeTitle.value) {
        return String(nodeTitle.value);
      } else {
        return String(nodeTitle);
      }
    }
    // 4. props.title as fallback
    if ((props as any)?.title) {
      return String((props as any).title);
    }
    return '';
  }, [title, node, props]);


  // Get icon name from data attribute
  const iconName = node?.properties?.['data-icon'] || (props as any)?.['data-icon'];

  // Load icon (either Lucide or Iconify)
  useEffect(() => {
    if (iconName && typeof window !== 'undefined') {
      // If it contains a colon, treat as Iconify icon (e.g. mdi:home)
      if (iconName.includes(':')) {
        setIconComponent(() => ({ size, className }: any) => (
          <Icon icon={iconName} width={size} height={size} className={className} />
        ));
      } else {
        // Otherwise try Lucide dynamic import
        const loadLucideIcon = async () => {
          try {
            // Dynamically import the icon from lucide-react
            const lucideIcons = await import('lucide-react');

            // Convert icon name to PascalCase
            const iconNamePascal = iconName
              .split(/[-_\s]+/)
              .map((word: string) => {
                if (word.length > 0 && word[0] === word[0].toUpperCase()) {
                  return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
              })
              .join('');

            // Try to get the icon component
            const LucideIcon = (lucideIcons as any)[iconNamePascal];
            if (LucideIcon) {
              setIconComponent(() => LucideIcon);
            } else {
              // Fallback to Iconify if not found in Lucide (assuming user meant simple iconify name like 'mdi-light:home' but forgot prefix, or just try standard sets?)
              // But strict separation is better. Let's just fallback to standard PascalCase check.
              const altName = iconNamePascal.charAt(0).toUpperCase() + iconNamePascal.slice(1);
              const AltIcon = (lucideIcons as any)[altName];
              if (AltIcon) {
                setIconComponent(() => AltIcon);
              }
            }
          } catch (error) {
            console.error('Failed to load icon:', error);
          }
        };
        loadLucideIcon();
      }
    }
  }, [iconName]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAnchor && href) {
      e.preventDefault();
      const id = href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      }
    }
  };

  // Use requestAnimationFrame to throttle tooltip position updates
  const tooltipTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!linkTitle || !linkRef.current) return;

    // Clear any pending timeout
    if (tooltipTimeoutRef.current) {
      cancelAnimationFrame(tooltipTimeoutRef.current);
    }

    // Use requestAnimationFrame to batch DOM reads
    tooltipTimeoutRef.current = requestAnimationFrame(() => {
      if (!linkRef.current) return;

      const rect = linkRef.current.getBoundingClientRect();

      // Calculate tooltip position
      let left = rect.left + rect.width / 2;
      let top = rect.top - 8;
      let position: 'top' | 'bottom' = 'top';

      // If tooltip would go off top of screen, show below instead
      if (top - 30 < 10) {
        top = rect.bottom + 8;
        position = 'bottom';
      }

      setTooltipPosition({ top, left, position });
      setShowTooltip(true);
    });
  }, [linkTitle]);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      cancelAnimationFrame(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        cancelAnimationFrame(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <a
        ref={linkRef}
        href={href}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target={isAnchor ? undefined : "_blank"}
        rel={isAnchor ? undefined : "noopener noreferrer"}
        className="text-docs-accent dark:text-dark-accent font-semibold hover:underline cursor-pointer transition-colors duration-200 decoration-2 decoration-blue-200 dark:decoration-blue-900 underline-offset-2 inline-flex items-baseline gap-1.5"
      >
        {IconComponent && (
          <span className="flex-shrink-0 inline-flex items-center translate-y-[3px]" style={{ lineHeight: 1 }}>
            <IconComponent size={16} />
          </span>
        )}
        {children}
      </a>
      {mounted && linkTitle && showTooltip && tooltipPosition.top > 0 && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-[99999] px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-md shadow-xl pointer-events-none whitespace-nowrap ${tooltipPosition.position === 'bottom' ? 'tooltip-arrow-bottom' : 'tooltip-arrow-top'
            }`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: tooltipPosition.position === 'bottom'
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          {linkTitle}
        </div>,
        document.body
      )}
    </span>
  );
});

// --- Image Component ---
// 替换图片列表（从 public/404 目录中）
const REPLACEMENT_IMAGES = [
  '/404/replace-unavailable-duckyo_1.jpg',
  '/404/replace-unavailable-duckyo_2.jpg',
  '/404/replace-unavailable-duckyo_3.jpg',
  '/404/replace-unavailable-duckyo_4.jpg',
  '/404/replace-unavailable-duckyo_5.jpg',
  '/404/replace-unavailable-duckyo_6.jpg',
  '/404/replace-unavailable-duckyo_7.jpg',
  '/404/replace-unavailable-duckyo_8.jpg',
  '/404/replace-unavailable-duckyo_9.jpg',
];

// 随机选择一张替换图片
const getRandomReplacementImage = (): string => {
  const randomIndex = Math.floor(Math.random() * REPLACEMENT_IMAGES.length);
  return REPLACEMENT_IMAGES[randomIndex];
};

export const MarkdownImage = ({ node, src, alt, ...props }: any) => {
  if (!src) {
    return null;
  }

  const nodeProps = node?.properties || {};
  const align = (nodeProps['data-image-align'] as string) ||
    (props as any)?.['data-image-align'] ||
    'center';
  const width = (nodeProps['data-image-width'] as string) ||
    (props as any)?.['data-image-width'] ||
    '';
  const caption = (nodeProps['data-image-caption'] as string) ||
    (props as any)?.['data-image-caption'] ||
    '';

  const ImageWithScale = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [calculatedWidth, setCalculatedWidth] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [hasError, setHasError] = useState<boolean>(false);
    const [retryCount, setRetryCount] = useState<number>(0);

    // 根据当前 imageSrc 计算对齐方式（替换图片始终居中）
    const isReplacementImage = imageSrc.startsWith('/404/');
    let alignClass = 'mx-auto';
    if (isReplacementImage) {
      alignClass = 'mx-auto'; // 替换图片始终居中
    } else if (align === 'left') {
      alignClass = 'ml-0 mr-auto';
    } else if (align === 'right') {
      alignClass = 'ml-auto mr-0';
    }

    // 当 src 改变时，重置状态
    useEffect(() => {
      setImageSrc(src);
      setHasError(false);
      setRetryCount(0);
    }, [src]);

    useEffect(() => {
      // 如果是替换图片，不计算宽度，使用 100%
      if (imageSrc.startsWith('/404/')) {
        setCalculatedWidth(null);
        return;
      }

      if (!width || !imgRef.current) return;

      const img = imgRef.current;

      const handleLoad = () => {
        if (!img.naturalWidth) return;

        if (width.includes('%')) {
          const percentValue = parseFloat(width);
          if (!isNaN(percentValue) && img.naturalWidth) {
            const scaledWidth = (img.naturalWidth * percentValue) / 100;
            setCalculatedWidth(`${scaledWidth}px`);
          }
        } else if (width.includes('px')) {
          setCalculatedWidth(width);
        } else if (!isNaN(Number(width))) {
          const percentValue = parseFloat(width);
          if (img.naturalWidth) {
            const scaledWidth = (img.naturalWidth * percentValue) / 100;
            setCalculatedWidth(`${scaledWidth}px`);
          }
        } else {
          setCalculatedWidth(width);
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        handleLoad();
      } else {
        img.onload = handleLoad;
      }
    }, [width, imageSrc]);

    let widthStyle: React.CSSProperties = {
      height: 'auto',
    };

    // 如果是替换图片，使用 50% 宽度
    if (isReplacementImage) {
      widthStyle.width = '50%';
      widthStyle.maxWidth = '50%';
    } else if (calculatedWidth) {
      widthStyle.width = calculatedWidth;
      widthStyle.maxWidth = '100%';
    } else {
      widthStyle.maxWidth = '100%';
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;

      // 防止事件冒泡
      e.stopPropagation();

      // 如果当前图片已经是替换图片，隐藏它
      if (imageSrc.startsWith('/404/')) {
        target.style.display = 'none';
        return;
      }

      // 如果原始图片加载失败，尝试替换
      if (retryCount === 0) {
        setRetryCount(1);
        const replacementImage = getRandomReplacementImage();
        // 强制更新 src
        setImageSrc(replacementImage);
        // 重置 ref 以确保新图片能正确加载
        if (imgRef.current) {
          imgRef.current.src = replacementImage;
        }
      } else {
        // 如果替换也失败，隐藏图片
        target.style.display = 'none';
      }
    };

    const imageElement = (
      <img
        key={imageSrc} // 添加 key 确保 src 改变时重新渲染
        ref={imgRef}
        src={imageSrc}
        alt={alt || ''}
        className={`block my-8 rounded-lg shadow-lg ${alignClass}`}
        style={widthStyle}
        loading="lazy"
        onError={handleError}
        onLoad={() => {
          // 图片加载成功时重置 retryCount（如果之前有错误）
          if (retryCount > 0 && imageSrc.startsWith('/404/')) {
            // 替换图片加载成功，保持当前状态
          }
        }}
      />
    );

    // 如果是替换图片，figure 也需要 50% 宽度
    const figureStyle: React.CSSProperties = isReplacementImage
      ? { width: '50%', maxWidth: '50%' }
      : calculatedWidth
        ? { width: calculatedWidth, maxWidth: '100%' }
        : {};

    if (caption) {
      return (
        <figure className={`my-8 ${alignClass}`} style={figureStyle}>
          {imageElement}
          <figcaption className="mt-1 text-sm text-center text-slate-600 dark:text-slate-400 italic font-serif">
            {caption}
          </figcaption>
        </figure>
      );
    }

    return imageElement;
  };

  return <ImageWithScale />;
};

// --- Code Component ---
// Language alias mapping for Prism syntax highlighter
const languageAliasMap: Record<string, string> = {
  'c#': 'csharp',
  'cs': 'csharp',
  'csharp': 'csharp',
  'bash': 'bash',
  'sh': 'bash',
  'shell': 'bash',
  'zsh': 'bash',
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'rb': 'ruby',
  'md': 'markdown',
  'yml': 'yaml',
  'yaml': 'yaml',
  'json': 'json',
  'xml': 'xml',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'sass',
  'less': 'less',
  'sql': 'sql',
  'go': 'go',
  'java': 'java',
  'php': 'php',
  'cpp': 'cpp',
  'c++': 'cpp',
  'c': 'c',
  'rust': 'rust',
  'rs': 'rust',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'dart': 'dart',
  'dockerfile': 'docker',
  'docker': 'docker',
};

const normalizeLanguage = (lang: string): string => {
  if (!lang) return 'text';
  const normalized = lang.toLowerCase().trim();
  return languageAliasMap[normalized] || normalized;
};

export const MarkdownCode = ({ node, inline, className, children, ...props }: any) => {
  // Extract language from className, supporting special characters like #
  // Match language-xxx where xxx can contain letters, numbers, #, +, -, etc.
  const match = /language-([\w#+]+)/.exec(className || '');
  let language = match ? match[1] : '';

  // Normalize language identifier
  language = normalizeLanguage(language);

  const isInPre = node?.parent?.tagName === 'pre' ||
    (node?.parent as any)?.type === 'element' &&
    (node?.parent as any)?.tagName === 'pre';

  const isCodeBlock = isInPre || match || inline === false;

  if (isCodeBlock) {
    // If the children contains our placeholder for code blocks, we need to render it properly
    // However, CodeBlock expects string children.
    // If rehype-raw or something converted it to HTML, we might have issues.

    // Check if children is a string that looks like HTML for our custom blocks
    if (typeof children === 'string') {
      // Decode entities if needed, though React usually handles it.
      // If the string contains <div data-alert...>, we want to display it literally.
      // CodeBlock does this.
    }

    return <CodeBlock language={language || 'text'}>{children}</CodeBlock>;
  }

  return (
    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-docs-accent dark:text-dark-accent text-sm border border-slate-200 dark:border-white/5" style={{ fontFamily: '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }} {...props}>
      {children}
    </code>
  );
};

// --- Headings ---
// 用于确保ID唯一性的Map（在组件外部，跨组件实例共享）
export const headingIdMap = new Map<string, number>();

export const MarkdownHeading = memo(function MarkdownHeading({ level, children }: { level: 1 | 2 | 3 | 4 | 5 | 6, children: React.ReactNode }) {
  const baseId = slugify(extractText(children));
  
  // 使用 useMemo 确保 ID 生成的一致性
  // 为了 SSR 兼容性，我们使用一个简单的计数器
  // 注意：这个逻辑必须在服务器端和客户端完全一致
  const id = useMemo(() => {
    // 处理空 baseId 的情况
    const normalizedBaseId = baseId || 'heading';
    
    // 确保ID唯一性
    let finalId = normalizedBaseId;
    if (headingIdMap.has(normalizedBaseId)) {
      const count = (headingIdMap.get(normalizedBaseId) || 0) + 1;
      headingIdMap.set(normalizedBaseId, count);
      finalId = `${normalizedBaseId}-${count}`;
    } else {
      headingIdMap.set(normalizedBaseId, 0);
      // 如果这是第一次出现，直接使用 normalizedBaseId，不需要后缀
      finalId = normalizedBaseId;
    }
    
    return finalId;
  }, [baseId]);
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  let className = "scroll-mt-24 font-bold text-slate-900 dark:text-white font-sans tracking-tight group relative";

  if (level === 1) className += " text-4xl mt-12 mb-8";
  else if (level === 2) className += " text-3xl mt-12 mb-6";
  else if (level === 3) className += " text-2xl font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-100";
  else if (level === 4) className += " text-xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100";
  else if (level === 5) className += " text-lg font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-100";
  else className += " text-base font-semibold mt-6 mb-3 text-slate-700 dark:text-slate-200";

  return (
    <Tag id={id} className={className}>
      {children}
      <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-docs-accent transition-opacity duration-200 no-underline absolute">#</a>
    </Tag>
  );
});

// --- List Items ---
export const MarkdownListItem = ({ node, children }: any) => {
  const childrenText = extractText(children);
  // Check if this is a task list item - either via regex (for raw text) or remark-gfm class
  const isTaskListItem =
    node?.properties?.className?.includes('task-list-item') ||
    /^\s*\[([ x])\]/.test(childrenText);

  const taskMatch = childrenText.match(/^\[([ x])\]\s*(.+)$/);

  if (isTaskListItem) {
    // If we have a regex match, we can render a cleaner custom checkbox
    if (taskMatch) {
      const isChecked = taskMatch[1] === 'x';
      const taskText = taskMatch[2];

      return (
        <li className="task-list-item flex items-center gap-2 dark:text-slate-300 leading-snug list-none my-0 font-sans [&>ul]:my-0 [&>ol]:my-0 [&_p]:my-0" style={{ color: '#374151', fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            onClick={(e) => e.preventDefault()} // Prevent user interaction
            className="w-4 h-4 rounded border-2 border-docs-accent dark:border-dark-accent bg-white dark:bg-slate-800 text-docs-accent dark:text-dark-accent focus:ring-2 focus:ring-docs-accent dark:focus:ring-dark-accent cursor-default flex-shrink-0 accent-docs-accent"
            style={{ accentColor: '#4285F4' }}
          />
          <span className="flex-1">{taskText}</span>
        </li>
      );
    }

    // If it's a gfm task item but regex failed (likely because input is already in children),
    // render it as a task item but let children handle the content.
    // We still add task-list-item class to prevent the dot.
    // remove flex to allow nested lists (which are block elements) to render below the task text
    // Use align-middle to center checkbox with text vertically
    return (
      <li className="task-list-item flex items-center gap-2 dark:text-slate-300 leading-snug list-none my-0 font-sans [&>ul]:my-0 [&>ol]:my-0 [&_p]:my-0" style={{ color: '#374151', fontWeight: 400 }}>
        {children}
      </li>
    );
  }

  // Simplified list item structure - styling is handled by parent ul/ol
  return (
    <li className="standard-list-item dark:text-slate-300 leading-snug font-sans [&>ul]:my-0 [&>ol]:my-0 [&_p]:my-0" style={{ color: '#374151', fontWeight: 400 }}>
      {children}
    </li>
  );
};

// --- Blockquote ---
export const MarkdownBlockquote = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 px-4 pt-3 pb-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-200 dark:border-blue-800 rounded-r-lg not-italic">
    <div className="text-sm text-blue-900 dark:text-blue-200 font-serif [&>p]:mb-0 [&>p:last-child]:mb-0 [&>p]:leading-relaxed [&>blockquote]:mt-4 [&>blockquote]:mb-4 [&>blockquote]:ml-4">
      {children}
    </div>
  </div>
);

// --- Table Components ---
export const MarkdownTable = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 overflow-x-auto">
    <table
      className="w-full border-collapse border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
    >
      {children}
    </table>
  </div>
);

export const MarkdownTh = ({ children }: { children: React.ReactNode }) => (
  <th
    className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 whitespace-nowrap"
  >
    {children}
  </th>
);

export const MarkdownTd = ({ children }: { children: React.ReactNode }) => (
  <td
    className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 break-words"
  >
    {children}
  </td>
);

// --- Custom Input Component for Checkboxes ---
export const MarkdownInput = (props: any) => {
  if (props.type === 'checkbox') {
    return (
      <input
        {...props}
        disabled={false} // Remove disabled to allow styling to look active
        readOnly // Semantically read-only
        onClick={(e) => e.preventDefault()} // Prevent user interaction
        className="mt-1 w-4 h-4 rounded border-2 border-docs-accent dark:border-dark-accent bg-white dark:bg-slate-800 text-docs-accent dark:text-dark-accent focus:ring-2 focus:ring-docs-accent dark:focus:ring-dark-accent cursor-default flex-shrink-0 accent-docs-accent align-middle translate-y-[-1px]"
        style={{ accentColor: '#4285F4' }}
      />
    );
  }
  return <input {...props} />;
};

// --- Base Components Object (without recursive/complex ones like Div) ---
export const baseMarkdownComponents = {
  input: MarkdownInput,

  a: MarkdownLink,
  p: ({ children }: any) => <p className="mb-4 dark:text-slate-300 leading-relaxed font-sans" style={{ color: '#374151', fontWeight: 400 }}>{children}</p>,
  h1: (props: any) => <MarkdownHeading level={1} {...props} />,
  h2: (props: any) => <MarkdownHeading level={2} {...props} />,
  h3: (props: any) => <MarkdownHeading level={3} {...props} />,
  h4: (props: any) => <MarkdownHeading level={4} {...props} />,
  h5: (props: any) => <MarkdownHeading level={5} {...props} />,
  h6: (props: any) => <MarkdownHeading level={6} {...props} />,
  blockquote: MarkdownBlockquote,
  pre: ({ children }: any) => <div className="not-prose">{children}</div>,
  code: MarkdownCode,
  ul: ({ children }: any) => <ul className="my-2 space-y-2 list-none ml-4 [&_>.standard-list-item]:relative [&_>.standard-list-item]:pl-5 [&_>.standard-list-item]:before:content-[''] [&_>.standard-list-item]:before:absolute [&_>.standard-list-item]:before:left-1 [&_>.standard-list-item]:before:top-[0.5em] [&_>.standard-list-item]:before:w-1.5 [&_>.standard-list-item]:before:h-1.5 [&_>.standard-list-item]:before:bg-docs-accent [&_>.standard-list-item]:before:dark:bg-dark-accent [&_>.standard-list-item]:before:rounded-full [&_>.standard-list-item]:before:translate-y-0 [&_>.task-list-item]:list-none [&_>.task-list-item]:before:hidden [&_>.task-list-item]:my-0">{children}</ul>,
  ol: ({ children }: any) => <ol className="my-2 space-y-2 list-none ml-4 dark:text-slate-300 leading-snug font-sans" style={{ color: '#374151', fontWeight: 400, counterReset: 'none' }}>{children}</ol>,
  li: MarkdownListItem,
  strong: ({ children }: any) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
  del: ({ children }: any) => <del className="line-through text-slate-500 dark:text-slate-400">{children}</del>,
  s: ({ children }: any) => <s className="line-through text-slate-500 dark:text-slate-400">{children}</s>,
  mark: ({ children }: any) => <mark className="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-yellow-100 px-1 rounded">{children}</mark>,
  sup: ({ children }: any) => <sup className="text-xs leading-none align-baseline font-normal">{children}</sup>,
  sub: ({ children }: any) => <sub className="text-xs leading-none align-baseline font-normal">{children}</sub>,
  kbd: ({ children }: any) => <kbd className="px-2 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm">{children}</kbd>,
  img: MarkdownImage,
  table: MarkdownTable,
  thead: ({ children }: any) => <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">{children}</tr>,
  th: MarkdownTh,
  td: MarkdownTd,
};

