import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { POST_CARD } from '../config';

interface Post {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readingTime?: string;
  slug: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const MAX_TAGS = POST_CARD.maxVisibleTags;
  const visibleTags = post.tags.slice(0, MAX_TAGS);
  const remainingTags = post.tags.length - MAX_TAGS;

  return (
    <article
      className="group relative bg-white dark:bg-[#1a1c23] transition-all duration-300 ease-out 
        border hover:border-transparent dark:border-[#2c2f3b] 
        cursor-pointer overflow-hidden
        hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10
        before:absolute before:inset-0 before:border-[1.5px] before:border-transparent 
        hover:before:border-docs-accent dark:hover:before:border-dark-accent before:transition-all before:duration-300 before:z-10
        hover:-translate-y-[2px]"
      style={{
        borderRadius: '8px',
        padding: '1.25rem',
      }}
    >
      <a href={`/posts/${post.slug}`} className="absolute inset-0 z-20"></a>

      {/* Background Watermark/Pattern - Distinct mark */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none rotate-12 group-hover:rotate-0 group-hover:scale-110">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-slate-900 dark:text-white">
          <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" />
        </svg>
      </div>

      {/* Corner Accents - Theme Color */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-docs-accent dark:border-dark-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-docs-accent dark:border-dark-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-docs-accent dark:border-dark-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-docs-accent dark:border-dark-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>


      <div className="relative z-10 flex flex-col h-full">
        {/* Meta Header */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-2.5 font-medium tracking-wide">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors" />
            <span className="group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors">{post.date}</span>
          </div>
          {post.readingTime && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-300 dark:text-slate-600 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors" />
                <span className="group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors">{post.readingTime}</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[1.15rem] leading-snug font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors duration-200 line-clamp-1">
          {post.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2 h-[40px]">
          {post.summary}
        </p>

        {/* Footer: Tags & Action */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 group-hover:border-docs-accent/10 dark:group-hover:border-dark-accent/10 transition-colors duration-300">
          <div className="flex items-center gap-2">
            {visibleTags.map(tag => (
              <span key={tag} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-white/5 px-2 py-0.5 rounded-[4px] group-hover:text-docs-accent dark:group-hover:text-dark-accent group-hover:bg-docs-accent/5 dark:group-hover:bg-dark-accent/10 transition-colors">
                # {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="text-xs text-slate-400 px-1">+{remainingTags}</span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-all duration-300 group-hover:mr-1">
            <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">READ</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
}

