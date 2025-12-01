import { Calendar, ArrowRight, Tag } from 'lucide-react';
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

  const hoverScale = POST_CARD.enableHoverEffect ? POST_CARD.hoverScale : 1;
  const borderRadius = POST_CARD.borderRadius;
  const padding = POST_CARD.padding;
  
  return (
    <article 
      className={`group relative bg-white dark:bg-dark-paper transition-all duration-300 ease-out ${POST_CARD.enableHoverEffect ? 'hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-blue-100 dark:hover:border-white/10' : ''} border border-slate-100 dark:border-white/5 cursor-pointer overflow-hidden shadow-sm`}
      style={{
        borderRadius: borderRadius,
        padding: padding.mobile,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        if (POST_CARD.enableHoverEffect) {
          e.currentTarget.style.transform = `scale(${hoverScale})`;
        }
      }}
      onMouseLeave={(e) => {
        if (POST_CARD.enableHoverEffect) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <a href={`/posts/${post.slug}`} className="absolute inset-0 z-20"></a>
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 mb-3 font-medium uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {post.date}
          </div>
          {post.readingTime && (
            <>
              <span>•</span>
              <span>{post.readingTime}</span>
            </>
          )}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors duration-200 font-serif leading-tight">
          {post.title}
        </h3>

        <p 
          className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: POST_CARD.summaryMaxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.summary}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            {visibleTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                <Tag size={10} /> {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10">
                +{remainingTags}
              </span>
            )}
          </div>
          
          <span className="inline-flex items-center gap-1 text-docs-accent dark:text-dark-accent text-sm font-semibold group-hover:translate-x-1 transition-transform duration-200 shrink-0 ml-2">
            阅读全文 <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

