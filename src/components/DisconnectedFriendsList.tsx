import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DisconnectedFriendCard from './DisconnectedFriendCard';
import type { FriendLink } from '../friends';

interface DisconnectedFriendsListProps {
    links: FriendLink[];
}

const DisconnectedFriendsList: React.FC<DisconnectedFriendsListProps> = ({ links }) => {
    const PAGE_SIZE = 12;
    const [currentPage, setCurrentPage] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    // 筛选出失联的友链
    const disconnectedLinks = links.filter(link => link.disconnected === true);

    if (disconnectedLinks.length === 0) {
        return null;
    }

    const totalPages = Math.ceil(disconnectedLinks.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const currentLinks = isExpanded ? disconnectedLinks.slice(startIndex, endIndex) : [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="mb-12">
            {/* 标题和展开按钮 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        已失联友链 ({disconnectedLinks.length})
                    </h2>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                    aria-label={isExpanded ? '收起失联友链列表' : '展开失联友链列表'}
                >
                    <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <span>{isExpanded ? '收起' : '展开'}</span>
                </button>
            </div>

            {/* 失联友链列表 */}
            {isExpanded && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {currentLinks.map((link) => (
                            <DisconnectedFriendCard key={link.url} link={link} />
                        ))}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-2 px-4">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === page
                                                    ? 'bg-gray-400 dark:bg-gray-600 text-white shadow-md scale-110'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DisconnectedFriendsList;

