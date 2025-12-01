import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FriendCard from './FriendCard';
import type { FriendLink } from '../friends';

interface FriendsListProps {
    links: FriendLink[];
}

const FriendsList: React.FC<FriendsListProps> = ({ links }) => {
    const PAGE_SIZE = 12;
    const [currentPage, setCurrentPage] = useState(1);

    // 过滤掉失联的友链
    const activeLinks = links.filter(link => !link.disconnected);

    const totalPages = Math.ceil(activeLinks.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const currentLinks = activeLinks.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {currentLinks.map((link) => (
                    <FriendCard key={link.url} link={link} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-20">
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
                                            ? 'bg-docs-accent dark:bg-dark-accent text-white shadow-md scale-110'
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
    );
};

export default FriendsList;
