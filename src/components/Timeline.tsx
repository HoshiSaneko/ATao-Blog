import React, { Children, isValidElement, useMemo, memo } from 'react';
import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { baseMarkdownComponents } from './MarkdownElements';
import Alert from './Alert';
import EChartsRenderer from './EChartsRenderer';

interface TimelineProps {
  children: ReactNode;
}

interface TimelineItem {
  date?: string;
  title?: string;
  content: string;
}

// Memoized timeline item content component
const TimelineItemContent = memo(({ content, markdownComponents }: { content: any, markdownComponents: any }) => {
  if (typeof content === 'string') {
    return (
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    );
  } else if (Array.isArray(content)) {
    const isAllStrings = content.every(item => typeof item === 'string');
    if (isAllStrings) {
      return (
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {content.join('')}
        </Markdown>
      );
    } else {
      return <div>{content}</div>;
    }
  } else {
    return <div>{content}</div>;
  }
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.markdownComponents === nextProps.markdownComponents;
});

const Timeline: React.FC<TimelineProps> = ({ children }) => {
  // Parse timeline items from children
  const items = useMemo(() => {
    return Children.toArray(children).filter((child) => {
      return isValidElement(child);
    }).map((child: any) => {
      const date = child.props?.['data-timeline-date'] || '';
      const title = child.props?.['data-timeline-title'] || '';
      let content = child.props?.children || '';
      
      // Try to get content from data attribute if available (encoded content)
      const dataContent = child.props?.['data-timeline-content'];
      if (dataContent) {
        try {
          content = decodeURIComponent(dataContent);
        } catch (e) {
          console.error('Failed to decode timeline content', e);
        }
      }
      
      return {
        date,
        title,
        content
      };
    });
  }, [children]);

  if (items.length === 0) return null;

  // Memoize markdown components configuration
  const markdownComponents = useMemo(() => ({
    ...baseMarkdownComponents,
    div: ({ node, children, className, ...props }: any) => {
      const nodeProps = node?.properties || {};
      
      // Check for Chart block
      const chartType = nodeProps['data-chart-type'] || (props as any)?.['data-chart-type'];
      if (chartType) {
        const dataStr = nodeProps['data-chart-data'] || (props as any)?.['data-chart-data'];
        try {
          if (!dataStr) return null;
          const decodedData = decodeURIComponent(dataStr);
          let data;
          try {
            data = JSON.parse(decodedData);
          } catch (e) {
            return (
              <div className="p-4 my-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                Chart data must be valid JSON
              </div>
            );
          }
          if (chartType === 'echarts') {
            return <EChartsRenderer option={data} />;
          }
        } catch (e) {
          return null;
        }
      }

      const alertType = nodeProps['data-alert-type'] || (props as any)?.['data-alert-type'];
      if (alertType) {
        const validTypes = ['info', 'success', 'warning', 'error'];
        const type = validTypes.includes(alertType) ? alertType : 'info';
        const title = nodeProps['data-alert-title'] || (props as any)?.['data-alert-title'];
        return <Alert type={type as any} title={title}>{children}</Alert>;
      }
      
      return <div className={className} {...props}>{children}</div>;
    },
  }), []);

  return (
    <div className="my-8 relative pl-8">
      {/* Timeline line with gradient effect */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 dark:from-slate-600 dark:via-slate-700 dark:to-slate-600"></div>
      
      <div className="relative space-y-8">
        {items.map((item, index) => (
          <div key={index} className="relative flex items-start">
            {/* Timeline marker - small square, aligned with first line center */}
            <div 
              className="absolute z-10"
              style={{ 
                left: '0.5rem', // 8px
                transform: 'translateX(-50%)',
                // Align with center of first line: text-xs with leading-tight has ~0.75rem line-height, center is ~0.375rem
                // But we want it closer to the text, so use smaller value
                top: item.date ? '0.25rem' : (item.title ? '0.375rem' : '0')
              }}
            >
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-sm rotate-45 shadow-sm"></div>
            </div>
            
            {/* Timeline content - positioned to the right of the line */}
            <div className="flex-1 min-w-0 pl-4">
              {/* Date and Title */}
              {(item.date || item.title) && (
                <div className="mb-2">
                  {item.date && (
                    <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mb-1.5 tracking-wide leading-tight">
                      {item.date}
                    </div>
                  )}
                  {item.title && (
                    <div className="text-base font-normal text-slate-900 dark:text-slate-100 leading-tight">
                      {item.title}
                    </div>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed [&>*:last-child]:mb-0">
                <TimelineItemContent 
                  content={item.content} 
                  markdownComponents={markdownComponents as any}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

