import React, { useState, useRef, useEffect } from 'react';
import type { FriendLink } from '../friends';
import { DISCONNECTED_LEVEL } from '../consts/friendLevels';

interface DisconnectedFriendCardProps {
    link: FriendLink;
}

const DisconnectedFriendCard: React.FC<DisconnectedFriendCardProps> = ({ link }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    const levelInfo = DISCONNECTED_LEVEL;

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
                ${levelInfo.border}
                overflow-hidden h-[90px] grayscale opacity-80 hover:grayscale-0 hover:opacity-100
            `}
        >
            {/* Background Decoration Pattern */}
            <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${levelInfo.theme}`}>
                <levelInfo.Icon size={120} />
            </div>

            {/* Avatar Section */}
            <div ref={imgRef} className="relative w-14 h-14 flex-shrink-0">
                <div className={`absolute inset-0 rounded-full border-2 ${levelInfo.border} opacity-20 scale-110`} />

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
                    <h3 className="font-bold text-gray-900 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {link.name}
                    </h3>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal line-clamp-2 overflow-hidden text-ellipsis group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                    {link.description}
                </p>
            </div>

            {/* Ghost Stamp (Bottom Right) */}
            <div className="absolute bottom-[-5px] right-[-5px] opacity-25 group-hover:opacity-40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-12deg] pointer-events-none">
                <div className={`relative w-24 h-24 flex items-center justify-center ${levelInfo.color}`}>
                    <div className="absolute top-5 font-black tracking-widest uppercase text-[10px] opacity-100 font-serif">
                        {levelInfo.title}
                    </div>
                    <levelInfo.Icon size={40} strokeWidth={1.5} className="currentColor opacity-60" />
                    <div className="absolute bottom-5 font-mono text-[9px] opacity-100 font-bold">
                        LOST
                    </div>
                </div>
            </div>
        </a>
    );
};

export default DisconnectedFriendCard;

