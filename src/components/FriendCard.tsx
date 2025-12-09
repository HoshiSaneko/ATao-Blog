import React, { useState, useRef, useEffect } from 'react';
import type { FriendLink } from '../friends';
import { FRIEND_LEVELS } from '../consts/friendLevels';
import { ThumbsUp } from 'lucide-react';

interface FriendCardProps {
    link: FriendLink;
}

const FriendCard: React.FC<FriendCardProps> = ({ link }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    // 计算已添加天数
    const getDaysAdded = () => {
        if (!link.addDate) return 0;
        const addDate = new Date(link.addDate);
        const today = new Date();
        const diffTime = today.getTime() - addDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const days = getDaysAdded();

    // 计算等级
    const getLevelInfo = () => {
        if (days < 0) return null;
        // 找到满足天数要求的最高等级
        // 如果天数超过最高级，直接返回最高级
        return [...FRIEND_LEVELS].reverse().find(l => days >= l.days) || FRIEND_LEVELS[0];
    };

    const levelInfo = getLevelInfo();

    useEffect(() => {
        if (!imgRef.current || shouldLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [shouldLoad]);

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 
                bg-white dark:bg-white/5 
                hover:-translate-y-1 hover:shadow-lg
                ${levelInfo ? levelInfo.border.replace('border-', 'border-opacity-50 hover:border-opacity-100 ') : 'border-gray-200 dark:border-white/10'}
                overflow-hidden h-[90px]
            `}
        >
            {/* Background Decoration Pattern (Optional) */}
            <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${levelInfo?.theme}`}>
                {levelInfo && <levelInfo.Icon size={120} />}
            </div>

            {/* Avatar Section */}
            <div ref={imgRef} className="relative w-14 h-14 flex-shrink-0">
                <div className={`absolute inset-0 rounded-full border-2 ${levelInfo ? `${levelInfo.border} opacity-20` : 'border-gray-200'} scale-110`} />

                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}

                {(!imageError && shouldLoad) ? (
                    <img
                        src={link.avatar}
                        alt={link.name}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                        className={`w-14 h-14 rounded-full object-cover relative z-10 transition-transform duration-500 group-hover:rotate-12 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ) : imageError && (
                    <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 z-10 relative">
                        {link.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-grow min-w-0 z-10 h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {link.name}
                    </h3>
                    {link.recommended && (
                        <div className="relative group/rec" title="推荐">
                            <ThumbsUp size={14} className="text-[#d3bc8e]" strokeWidth={3} fill="#d3bc8e" fillOpacity={0.2} />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal truncate">
                    {link.description}
                </p>
            </div>

            {/* Genshin Style Stamp (Bottom Right) */}
            {levelInfo && (
                <div className="absolute bottom-[-5px] right-[-5px] opacity-25 group-hover:opacity-40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-12deg] pointer-events-none">
                    <div className={`relative w-24 h-24 flex items-center justify-center ${levelInfo.color}`}>
                        <div className="absolute top-5 font-black tracking-widest uppercase text-[10px] opacity-100 font-serif">
                            {levelInfo.title}
                        </div>
                        <levelInfo.Icon size={40} strokeWidth={1.5} className="currentColor opacity-60" />
                        <div className="absolute bottom-5 font-mono text-[9px] opacity-100 font-bold">
                            {days} DAYS
                        </div>
                    </div>
                </div>
            )}
        </a>
    );
};

export default FriendCard;
