import React, { useState, useRef, useEffect } from 'react';
import type { FriendLink } from '../friends';

interface FriendCardProps {
    link: FriendLink;
}

const FriendCard: React.FC<FriendCardProps> = ({ link }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [loadTime, setLoadTime] = useState<number | null>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imgRef.current || shouldLoad) return;

        // 检查元素是否已经在视口内
        const checkVisibility = () => {
            if (!imgRef.current) return false;
            const rect = imgRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            return (
                rect.top < windowHeight + 200 && // 提前200px
                rect.bottom > -200 &&
                rect.left < windowWidth + 200 &&
                rect.right > -200
            );
        };

        // 如果已经在视口内，立即加载
        if (checkVisibility()) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '200px', // 提前200px开始加载
                threshold: 0.01,
            }
        );

        observer.observe(imgRef.current);

        // 备用机制：1秒后如果还没加载，强制加载（减少等待时间）
        const fallbackTimer = setTimeout(() => {
            setShouldLoad(true);
            observer.disconnect();
        }, 1000);

        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimer);
        };
    }, [shouldLoad]);

    // 使用独立的 Image 对象预加载并测量头像加载时间
    useEffect(() => {
        if (!shouldLoad || loadTime !== null) return;

        const testImg = new Image();
        const startTime = performance.now();
        let isCompleted = false;
        
        const complete = (success: boolean) => {
            if (isCompleted) return;
            isCompleted = true;
            
            if (success) {
                const endTime = performance.now();
                const time = Math.round(endTime - startTime);
                setLoadTime(time);
            } else {
                // 加载失败时不显示速度
                setLoadTime(null);
            }
        };
        
        testImg.onload = () => complete(true);
        testImg.onerror = () => complete(false);
        
        // 开始加载测试图片
        testImg.src = link.avatar;
        
        // 超时处理（5秒，减少等待时间）
        const timeout = setTimeout(() => {
            complete(false);
        }, 5000);

        return () => {
            clearTimeout(timeout);
            testImg.onload = null;
            testImg.onerror = null;
        };
    }, [shouldLoad, link.avatar, loadTime]);


    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
        >
            {/* Recommended Badge */}
            {link.recommended && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                        {/* Badge */}
                        <div className="relative px-2.5 py-1 bg-docs-accent dark:bg-dark-accent rounded shadow-md ring-1 ring-slate-900/10 dark:ring-white/10 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white tracking-wider uppercase leading-none">
                                推荐
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={imgRef} className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative w-12 h-12">
                {/* 占位符 - 作为背景层 */}
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse z-0" />
                )}
                {/* 图片 - 始终在文档流中 */}
                {!imageError && shouldLoad && (
                    <img
                        src={link.avatar}
                        alt={link.name}
                        onLoad={() => {
                            setImageLoaded(true);
                        }}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                        className={`w-12 h-12 rounded-full object-cover transition-opacity duration-300 relative z-10 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                )}
                {/* 加载失败占位符 */}
                {imageError && (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs relative z-10">
                        {link.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-grow min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-0.5">
                    {link.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {link.description}
                </p>
            </div>

            {/* 加载速度显示 - 右下角 */}
            {loadTime !== null && (
                <div className="absolute bottom-2 right-2 z-10">
                    <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-slate-600 dark:text-slate-400">
                        {loadTime < 300 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{loadTime}ms</span>
                        ) : loadTime < 800 ? (
                            <span className="text-yellow-600 dark:text-yellow-400">{loadTime}ms</span>
                        ) : (
                            <span className="text-red-600 dark:text-red-400">{loadTime}ms</span>
                        )}
                    </div>
                </div>
            )}
        </a>
    );
};

export default FriendCard;
