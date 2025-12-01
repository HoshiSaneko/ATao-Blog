import React, { useState, useRef, useEffect } from 'react';
import type { FriendLink } from '../friends';

interface DisconnectedFriendCardProps {
    link: FriendLink;
}

const DisconnectedFriendCard: React.FC<DisconnectedFriendCardProps> = ({ link }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
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

        // 备用机制：3秒后如果还没加载，强制加载
        const fallbackTimer = setTimeout(() => {
            setShouldLoad(true);
            observer.disconnect();
        }, 3000);

        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimer);
        };
    }, [shouldLoad]);

    return (
        <div className="group relative flex items-center gap-3 p-4 rounded-lg bg-gray-50/50 dark:bg-white/3 border border-gray-200/50 dark:border-white/5 opacity-60">
            {/* 已失联标签 */}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-400 dark:bg-gray-600 text-white text-xs rounded-full z-10">
                已失联
            </div>

            <div ref={imgRef} className="flex-shrink-0 relative w-12 h-12">
                {/* 占位符 - 作为背景层 */}
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse z-0" />
                )}
                {/* 图片 - 始终在文档流中 */}
                {!imageError && shouldLoad && (
                    <img
                        src={link.avatar}
                        alt={link.name}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                        className={`w-12 h-12 rounded-full object-cover grayscale transition-opacity duration-300 relative z-10 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                )}
                {/* 加载失败占位符 */}
                {imageError && (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs grayscale relative z-10">
                        {link.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-grow min-w-0">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-500 truncate mb-0.5">
                    {link.name}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-600 line-clamp-1">
                    {link.description}
                </p>
            </div>
        </div>
    );
};

export default DisconnectedFriendCard;

