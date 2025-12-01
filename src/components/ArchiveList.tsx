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
        <div className="space-y-2">
            {archiveData.map((yearData) => {
                const isYearExpanded = expandedYears.has(yearData.year);
                const totalPosts = yearData.months.reduce((sum, m) => sum + m.posts.length, 0);

                return (
                    <div key={yearData.year} className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                        {/* Year Header */}
                        <button
                            onClick={() => toggleYear(yearData.year)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex-shrink-0 transition-transform duration-200" style={{ transform: isYearExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                <ChevronRight size={20} className="text-slate-400 dark:text-slate-500" />
                            </div>

                            <div className="flex-shrink-0">
                                {isYearExpanded ? (
                                    <FolderOpen size={24} className="text-docs-accent dark:text-dark-accent" />
                                ) : (
                                    <Folder size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors" />
                                )}
                            </div>

                            <div className="flex-1 flex items-baseline gap-3 text-left">
                                <span className="text-xl font-bold text-slate-800 dark:text-slate-200 font-serif">
                                    {yearData.year}
                                </span>
                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                    {totalPosts} 篇文章
                                </span>
                            </div>
                        </button>

                        {/* Months */}
                        {isYearExpanded && (
                            <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
                                {yearData.months.map((monthData) => {
                                    const monthKey = `${yearData.year}-${monthData.month}`;
                                    const isMonthExpanded = expandedMonths.has(monthKey);
                                    const monthName = monthNames[parseInt(monthData.month) - 1];

                                    return (
                                        <div key={monthKey} className="border-b border-slate-100 dark:border-white/5 last:border-b-0">
                                            {/* Month Header */}
                                            <button
                                                onClick={() => toggleMonth(yearData.year, monthData.month)}
                                                className="w-full flex items-center gap-3 p-3 pl-12 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 transition-transform duration-200" style={{ transform: isMonthExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-500" />
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <Calendar size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors" />
                                                </div>

                                                <div className="flex-1 flex items-baseline gap-2 text-left">
                                                    <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                                                        {monthName}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {monthData.posts.length} 篇
                                                    </span>
                                                </div>
                                            </button>

                                            {/* Posts */}
                                            {isMonthExpanded && (
                                                <div className="bg-white dark:bg-white/5 divide-y divide-slate-100 dark:divide-white/5">
                                                    {monthData.posts.map((post) => (
                                                        <a
                                                            key={post.slug}
                                                            href={`/posts/${post.slug}`}
                                                            className="group flex items-start gap-3 p-3 pl-20 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200"
                                                        >
                                                            <div className="flex-shrink-0 mt-0.5">
                                                                <FileText size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline justify-between gap-3 mb-1">
                                                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-docs-accent dark:group-hover:text-dark-accent transition-colors truncate">
                                                                        {post.title}
                                                                    </h3>
                                                                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 flex-shrink-0">
                                                                        {post.date.substring(8, 10)}
                                                                    </span>
                                                                </div>

                                                                {post.tags.length > 0 && (
                                                                    <div className="flex gap-1.5 flex-wrap">
                                                                        {post.tags.map((tag) => (
                                                                            <span
                                                                                key={tag}
                                                                                className="text-[10px] uppercase tracking-wider font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded"
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
