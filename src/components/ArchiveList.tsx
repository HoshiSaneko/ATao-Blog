import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Calendar, FileText } from 'lucide-react';

interface Post {
    slug: string;
    title: string;
    date: string;
    tags: string[];
}

interface Month {
    month: string;
    posts: Post[];
}

interface Year {
    year: string;
    months: Month[];
}

interface ArchiveListProps {
    archiveData: Year[];
}

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function ArchiveList({ archiveData }: ArchiveListProps) {
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

    const toggleYear = (year: string) => {
        const newExpanded = new Set(expandedYears);
        if (newExpanded.has(year)) {
            newExpanded.delete(year);
            // Also collapse all months in this year
            const newExpandedMonths = new Set(expandedMonths);
            archiveData.find(y => y.year === year)?.months.forEach(m => {
                newExpandedMonths.delete(`${year}-${m.month}`);
            });
            setExpandedMonths(newExpandedMonths);
        } else {
            newExpanded.add(year);
        }
        setExpandedYears(newExpanded);
    };

    const toggleMonth = (year: string, month: string) => {
        const key = `${year}-${month}`;
        const newExpanded = new Set(expandedMonths);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedMonths(newExpanded);
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto px-4 relative">
            {/* Main Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden md:block"></div>

            {archiveData.map((yearData, yearIndex) => {
                const isYearExpanded = expandedYears.has(yearData.year);
                const totalPosts = yearData.months.reduce((sum, m) => sum + m.posts.length, 0);

                return (
                    <div
                        key={yearData.year}
                        className="relative pl-0 md:pl-12 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                        style={{
                            animationDelay: `${yearIndex * 100}ms`,
                            animationFillMode: 'both'
                        }}
                    >
                        {/* Timeline Node (Year) */}
                        <div className="absolute left-[30px] top-6 w-3 h-3 bg-white dark:bg-[#1a1c23] border-2 border-docs-accent rounded-full z-10 hidden md:block group-hover:scale-125 transition-transform">
                            <div className="absolute inset-0 m-auto w-1 h-1 bg-docs-accent rounded-full"></div>
                        </div>

                        <div className="relative rounded-[2px] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1c23] shadow-sm hover:shadow-md hover:border-docs-accent/50 hover:shadow-docs-accent/5 transition-all duration-300 group">

                            {/* Decorative Corner Lines */}
                            <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-docs-accent to-transparent"></div>
                                <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-docs-accent to-transparent"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-docs-accent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-docs-accent to-transparent"></div>
                            </div>

                            {/* Decorative Watermark */}
                            <div className="absolute -bottom-4 -right-4 opacity-[0.02] dark:opacity-[0.04] pointer-events-none rotate-12 scale-150 group-hover:scale-[1.6] transition-transform duration-700">
                                <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" />
                                </svg>
                            </div>

                            {/* Year Header */}
                            <button
                                onClick={() => toggleYear(yearData.year)}
                                className="relative z-10 w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className={`transition-transform duration-300 ${isYearExpanded ? 'rotate-90' : 'rotate-0'}`}>
                                    <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-docs-accent" />
                                </div>

                                <div className="flex-1 flex items-baseline gap-4 text-left">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-serif tracking-wider group-hover:text-docs-accent transition-colors">
                                        {yearData.year}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 group-hover:bg-docs-accent/20 transition-colors"></div>
                                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                        {totalPosts} POSTS
                                    </span>
                                </div>
                            </button>

                            {/* Months */}
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isYearExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-black/20">
                                        {yearData.months.map((monthData, monthIndex) => {
                                            const monthKey = `${yearData.year}-${monthData.month}`;
                                            const isMonthExpanded = expandedMonths.has(monthKey);
                                            const monthName = monthNames[parseInt(monthData.month) - 1];

                                            return (
                                                <div key={monthKey} className="border-b border-slate-100 dark:border-white/5 last:border-b-0 relative">
                                                    {/* Month Header */}
                                                    <button
                                                        onClick={() => toggleMonth(yearData.year, monthData.month)}
                                                        className="w-full flex items-center p-3 hover:bg-white dark:hover:bg-white/5 transition-colors group/month pl-12 relative"
                                                    >
                                                        {/* Month Connector Line */}
                                                        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slate-200 dark:bg-white/5"></div>
                                                        <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full group-hover/month:bg-docs-accent transition-colors"></div>

                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className={`transition-transform duration-200 text-slate-300 dark:text-slate-600 group-hover/month:text-docs-accent ${isMonthExpanded ? 'rotate-90' : 'rotate-0'}`}>
                                                                <ChevronRight size={14} />
                                                            </div>
                                                            <span className={`text-sm font-bold uppercase tracking-wider transition-colors ${isMonthExpanded ? 'text-docs-accent' : 'text-slate-600 dark:text-slate-400 group-hover/month:text-docs-accent'}`}>
                                                                {monthName}
                                                            </span>
                                                            <span className="text-xs text-slate-300 dark:text-slate-600 group-hover/month:text-docs-accent/60">
                                                                / {monthData.posts.length}
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {/* Posts */}
                                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isMonthExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                        <div className="overflow-hidden bg-white/50 dark:bg-white/[0.02]">
                                                            {monthData.posts.map((post, postIndex) => (
                                                                <a
                                                                    key={post.slug}
                                                                    href={`/posts/${post.slug}`}
                                                                    className="group/post flex items-center gap-4 p-3 pl-20 hover:bg-docs-accent/5 dark:hover:bg-dark-accent/10 transition-all duration-200 border-l-[2px] border-transparent hover:border-docs-accent relative"
                                                                >
                                                                    {/* Post Connector */}
                                                                    <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slate-100 dark:bg-white/5"></div>

                                                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-16 flex-shrink-0 group-hover/post:text-docs-accent transition-colors">
                                                                            {post.date.substring(5)}
                                                                        </span>

                                                                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/post:text-docs-accent dark:group-hover/post:text-dark-accent transition-colors truncate">
                                                                            {post.title}
                                                                        </h3>
                                                                    </div>

                                                                    {/* Star Icon on Hover */}
                                                                    <div className="opacity-0 group-hover/post:opacity-100 transition-all duration-300 transform scale-50 group-hover/post:scale-100 text-docs-accent pr-4">
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                                                        </svg>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
