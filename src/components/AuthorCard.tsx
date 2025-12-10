import { useState, useEffect } from 'react';
import { AUTHOR_PROFILE, LICENSE_CONFIG } from '../config';
import { Copyright, Github, Mail, MapPin, Globe, Link as LinkIcon, User, Cake, Check, Briefcase, Twitter, Linkedin, Code2, Terminal, Cpu, Compass } from 'lucide-react';
import { Icon } from '@iconify/react';

interface AuthorCardProps {
    className?: string;
    title?: string;
    showLicense?: boolean; // 是否显示版权信息，默认为 true（文章底部显示）
    summary?: string; // 文章摘要，用于分享
}

// Lucide React 图标映射
const lucideIconMap: Record<string, any> = {
    Github,
    Mail,
};

// 渲染图标组件
const renderIcon = (iconName: string, size: number = 16, className: string = '') => {
    // 如果图标名称包含冒号，使用 Iconify (包括 yesicon)
    if (iconName.includes(':')) {
        return <Icon icon={iconName} width={size} height={size} className={className} />;
    }

    // 使用 Lucide React 图标
    const LucideIcon = lucideIconMap[iconName] || LinkIcon;
    return <LucideIcon size={size} className={className} />;
};

export default function AuthorCard({ className = '', title, showLicense = true, summary = '' }: AuthorCardProps) {
    const [showWechatQR, setShowWechatQR] = useState(false);
    const [copiedDouyinId, setCopiedDouyinId] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // Set share URL on client side only to avoid hydration mismatch
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(window.location.href);
        }
    }, []);

    // 计算年龄（用于Lv等级）
    const calculateAge = () => {
        if (!AUTHOR_PROFILE.birthYear) return 0;
        const currentYear = new Date().getFullYear();
        return currentYear - AUTHOR_PROFILE.birthYear;
    };

    const age = calculateAge();

    const handleCopyDouyinId = async (douyinId: string | undefined) => {
        if (!douyinId) {
            console.error('无法获取抖音号 ID');
            return;
        }

        let success = false;

        // 1. Try Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(douyinId);
                success = true;
            } catch (err) {
                console.warn('Clipboard API failed', err);
            }
        }

        // 2. Try Legacy execCommand
        if (!success) {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = douyinId;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                // For iOS
                if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                    const range = document.createRange();
                    range.selectNodeContents(textArea);
                    const selection = window.getSelection();
                    if (selection) {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    textArea.setSelectionRange(0, 999999);
                }
                
                success = document.execCommand('copy');
                document.body.removeChild(textArea);
            } catch (err) {
                console.warn('execCommand failed', err);
            }
        }

        // 3. Feedback
        if (success) {
            setCopiedDouyinId(true);
            setTimeout(() => setCopiedDouyinId(false), 2000);
        } else {
            // Fallback: Show prompt for manual copy
            const shouldCopy = window.confirm(`复制失败，是否手动复制？\n抖音号：${douyinId}`);
            if (shouldCopy) {
                window.prompt("请复制以下抖音号：", douyinId);
            }
        }
    };

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    // 版权卡片使用简洁的样式
    if (showLicense) {
        return (
            <div className={`relative w-full p-5 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden ${className}`}>
                {/* 右上角版权装饰 - 简洁的大写 C */}
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full bg-slate-300/60 dark:bg-slate-600/60 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-slate-500 dark:text-slate-400 text-5xl" style={{ fontWeight: 900, WebkitTextStroke: '0.5px currentColor' }}>C</span>
                </div>
                
                {/* 简洁的顶部信息 */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <img
                        src={AUTHOR_PROFILE.avatar}
                        alt={AUTHOR_PROFILE.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {AUTHOR_PROFILE.name}
                            </h3>
                            {LICENSE_CONFIG.showOriginalBadge && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-docs-accent text-white flex-shrink-0">
                                    原创
                                </span>
                            )}
                        </div>

                        {title && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                                {title}
                            </p>
                        )}
                    </div>
                </div>

                {/* 分享功能 */}
                {title && (
                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">分享</span>
                            <div className="flex items-center gap-2">
                                {shareUrl && (
                                    <>
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Read "${title}"`)}&url=${encodeURIComponent(shareUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 dark:hover:bg-[#1DA1F2]/20 transition-all duration-200"
                                            aria-label="Share on Twitter"
                                        >
                                            <Twitter size={16} />
                                        </a>
                                        <a
                                            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 dark:hover:bg-[#0A66C2]/20 transition-all duration-200"
                                            aria-label="Share on LinkedIn"
                                        >
                                            <Linkedin size={16} />
                                        </a>
                                        <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                        <button
                                            onClick={handleCopyLink}
                                            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-docs-accent dark:hover:text-dark-accent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                                            aria-label="Copy Link"
                                        >
                                            {copiedLink ? <Check size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 版权信息 */}
                {LICENSE_CONFIG.enable && (
                    <div className="pt-0">
                        <div className="flex items-start gap-2">
                            <Copyright size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {LICENSE_CONFIG.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 关于页面的信息卡片 - Genshin Namecard Style
    return (
        <div className={`relative w-full flex flex-col md:flex-row items-stretch gap-0 shadow-xl
            group ${className}`}
            style={{
                background: 'linear-gradient(135deg, #d3bc8e 0%, #a38753 50%, #d3bc8e 100%)',
                padding: '2px',
            }}>
            {/* 内容容器 */}
            <div className="relative w-full flex flex-col md:flex-row items-stretch gap-0 bg-gradient-to-r from-white to-slate-50 dark:from-[#1c1f2e] dark:to-[#2a2d3e]">
                {/* 边框装饰层 */}
                <div className="absolute inset-0 pointer-events-none z-[1]">
                    {/* 四角装饰 - 更大的装饰角 */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#d3bc8e] dark:border-[#d3bc8e]/70"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#d3bc8e] dark:border-[#d3bc8e]/70"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#d3bc8e] dark:border-[#d3bc8e]/70"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#d3bc8e] dark:border-[#d3bc8e]/70"></div>
                    
                    {/* 边框装饰线条 - 渐变效果 */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                    <div className="absolute left-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                    <div className="absolute right-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                    
                    {/* 内部装饰图案 - 小方块 */}
                    <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-[#d3bc8e]/30 dark:bg-[#d3bc8e]/20"></div>
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#d3bc8e]/30 dark:bg-[#d3bc8e]/20"></div>
                    <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-[#d3bc8e]/30 dark:bg-[#d3bc8e]/20"></div>
                    <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-[#d3bc8e]/30 dark:bg-[#d3bc8e]/20"></div>
                </div>

            {/* Left Decor / Avatar Section */}
            <div className="relative md:w-64 shrink-0 bg-[#f9fafb]/80 dark:bg-[#15171e]/50 flex flex-col items-center justify-between pt-8 px-8 pb-4 border-b md:border-b-0 md:border-r border-[#d3bc8e]/20 dark:border-[#d3bc8e]/10 z-10 group/pisces">
                {/* Constellation BG */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <svg className="absolute -top-10 -left-10 w-48 h-48 text-[#d3bc8e]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="2" fill="currentColor" />
                    </svg>
                </div>

                {/* Pisces Constellation Pattern as Background - Genshin Style */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-[280px] max-h-[280px] opacity-25 dark:opacity-15">
                        {/* 光晕效果 - 使用径向渐变 */}
                        <div 
                            className="absolute inset-0 blur-2xl rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(211, 188, 142, 0.15) 0%, rgba(211, 188, 142, 0.05) 50%, transparent 100%)'
                            }}
                        ></div>
                        
                        <svg 
                            className="w-full h-full relative z-10 animate-pulse-slow" 
                            viewBox="0 0 1024 1024" 
                            fill="none"
                            preserveAspectRatio="xMidYMid meet"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* 定义金色渐变（用于填充） */}
                            <defs>
                                <linearGradient id="pisces-gold-light" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f4e4bc" stopOpacity="0.9" />
                                    <stop offset="50%" stopColor="#d3bc8e" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#a38753" stopOpacity="0.8" />
                                </linearGradient>
                                <linearGradient id="pisces-gold-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#d3bc8e" stopOpacity="0.6" />
                                    <stop offset="50%" stopColor="#a38753" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="#8c7b60" stopOpacity="0.5" />
                                </linearGradient>
                                {/* 光晕滤镜 */}
                                <filter id="pisces-glow">
                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* 双鱼座图案 - 使用提供的SVG路径 */}
                            <path 
                                d="M422.5024 263.9872c9.6768-6.4 18.7904-12.3904 26.8288-15.6672 17.664-7.168 52.8896-10.4448 64.9728-11.1104 8.0896-0.4608 15.1552-5.632 18.0224-13.2096s1.024-16.128-4.7616-21.8112c-27.1872-26.7776-102.9632-64.3584-195.4304-14.7456-0.3072 0.1536-0.6144 0.3584-0.9216 0.512-87.3984 52.8896-105.6256 129.3824-106.3424 132.608a20.51072 20.51072 0 0 0 19.968 25.0368c4.0448 0 8.0896-1.2288 11.6224-3.584 24.8832-17.1008 72.96-45.1584 95.8976-47.4624 28.2624-2.8672 50.5344-17.5616 70.144-30.5664z m-126.0032 7.168c12.9536-15.9232 30.8736-32.9216 55.5008-47.872 37.9392-20.224 69.9904-21.9136 94.4128-17.1008-4.4032 1.2288-8.6016 2.6112-12.4416 4.1984-11.8272 4.8128-23.0912 12.2368-33.9968 19.456-16.4352 10.8544-33.4336 22.1184-51.6608 23.9104-15.2064 1.536-33.8944 8.704-51.8144 17.408z" 
                                fill="url(#pisces-gold-light)" 
                                className="dark:fill-[url(#pisces-gold-dark)]"
                                filter="url(#pisces-glow)"
                                opacity="0.85"
                            />
                            <path 
                                d="M334.336 411.648c17.3568-5.2736 32.4096-9.5232 45.6704-13.0048-20.0704 13.4144-35.6864 28.16-28.5184 47.5136 6.1952 16.7936 31.5392 30.1056 53.3504 34.56 6.5024 1.3312 12.9024 1.9968 19.1488 1.9968 23.7056 0 45.4144-9.4208 62.4128-27.4432 18.8928-20.0192 26.0608-45.6192 21.1456-72.8576 15.616-0.8192 40.96-3.7376 71.7312-9.8816 7.0144 3.072 15.2576 4.7616 24.1664 4.7616 4.5056 0 9.216-0.4096 14.0288-1.3312 18.5344-3.4304 33.024-12.7488 40.5504-24.6272 44.2368-15.5648 74.8544-34.4064 91.0336-56.0128 8.448-11.264 9.728-26.624 3.2256-39.168-9.5232-18.432-36.1472-63.3344-85.1456-100.4032-1.1776-17.7664-16.64-34.7136-40.3456-42.496-11.9296-3.8912-24.32-4.7616-34.9696-2.4064-2.3552 0.512-4.5568 1.2288-6.656 2.048-39.5264-12.8512-82.432-17.1008-128.1024-12.6464-7.68-33.536-28.9792-56.9344-60.6208-65.4848-30.208-8.1408-59.5968-0.6656-82.7904 20.992-16.2816 15.2064-30.8736 39.8336-27.392 57.3952 3.1744 15.9744 16.9472 22.0672 34.4576 24.3712-65.6896 31.1808-117.504 79.6672-154.5728 144.9472-53.0432 93.3888-62.0032 196.5056-59.904 268.0832L45.1072 706.4064c-4.9664 12.6976-0.3584 26.5216 11.264 33.6896 4.608 2.816 9.6768 4.1984 14.6432 4.1984 7.5776 0 15.0016-3.1744 20.48-9.3184l51.8144-57.8048c10.0352 6.144 23.7568 14.592 37.5296 23.552a27.392 27.392 0 0 0 31.8464-1.1776c9.4208-7.168 13.1584-19.0464 9.6256-30.3104-12.9024-40.9088-23.2448-114.1248-26.3168-136.9088 35.4304-58.368 81.92-98.9184 138.3424-120.6784z m-251.0848 309.7088c0-0.0512 0 0 0 0z m373.4016-294.1952c-9.5232 10.1376-20.48 14.7968-33.9456 14.5408-9.3184-0.2048-17.92-3.0208-24.2176-6.0416 6.5536-4.6592 14.8992-9.7792 19.968-12.9024 6.5024-3.9936 12.1344-7.4752 16.2304-10.5472 10.4448-7.8336 18.3808-17.6128 22.9888-27.8528 2.8672-0.256 5.632-0.4096 8.2944-0.5632 4.9152 17.0496 1.792 31.5904-9.3184 43.3664zM349.2352 79.7184c11.1616-7.2704 23.0912-9.0112 36.5056-5.376 15.7696 4.2496 26.0608 15.0016 30.72 32-3.328 0.6656-6.7072 1.3824-10.1888 2.2016-8.9088-5.3248-19.8656-8.8576-31.3856-9.9328-5.12-0.4608-11.7248-0.4608-19.3536-0.512-5.9392 0-15.7184 0-23.7568-0.5632 3.7888-5.888 9.6768-12.7488 17.4592-17.8176zM155.0336 636.416a27.776 27.776 0 0 0-34.8672 5.2224l-10.0352 11.1616 33.0752-84.224 15.3088-8.448c3.4816 23.7568 9.0624 57.9072 15.9232 88.1152-7.9872-4.9152-14.7456-9.0624-19.4048-11.8272z m4.9152-123.904l-12.8 7.0656c2.816-103.0656 36.6592-313.9072 259.4816-369.1008h0.1024c3.328-0.8192 6.5024-1.5872 9.6256-2.2528 2.2016-0.512 4.4544-0.9728 6.656-1.4336l2.816-0.6144c0.0512 0 0.1024 0 0.1536-0.0512 5.12-1.024 10.1376-1.8432 15.1552-2.6624 0.512-0.1024 0.9728-0.1536 1.4848-0.256 0.0512 0 0.1024-0.0512 0.1536-0.0512 16.6912-2.5088 32.9216-3.7888 48.7424-3.7888 24.576 0 48.0256 3.0208 70.1952 9.1136 0 0.1536 0.1024 0.3584 0.1024 0.512a30.80192 30.80192 0 0 0 1.536 6.4512c0.4096 1.1776 0.8192 2.3552 1.3312 3.5328 0.256 0.6144 0.5632 1.2288 0.8704 1.8432 0.5632 1.1776 1.28 2.3552 1.9968 3.4816 0.3072 0.512 0.6144 1.0752 0.9728 1.5872a46.75584 46.75584 0 0 0 6.6048 7.7824c7.0144 6.8096 16.384 12.3392 26.8288 15.7184 1.9456 0.6144 3.84 1.1776 5.7856 1.6384 5.7856 1.4336 11.4688 2.0992 16.8448 2.0992 0.3072 0 0.6656-0.0512 0.9728-0.0512 1.792-0.0512 3.5328-0.1536 5.2224-0.3072l2.4064-0.3072c1.28-0.2048 2.56-0.4096 3.7888-0.7168 0.768-0.1536 1.5872-0.3072 2.3552-0.512 1.6896-0.4608 3.3792-0.9728 4.9664-1.6384 39.3728 30.3616 61.5936 66.2528 70.5536 83.0464-10.5984 12.6464-31.7952 25.344-60.8768 36.5056-0.4608-0.4608-1.024-0.9216-1.536-1.3824-0.4608-0.4096-0.9216-0.8704-1.4336-1.28-0.768-0.6144-1.5872-1.1776-2.4064-1.792-0.512-0.3584-0.9728-0.7168-1.4848-1.024-0.9728-0.6144-1.9968-1.1776-3.0208-1.6896-0.4608-0.256-0.8704-0.512-1.3312-0.7168-1.536-0.768-3.1232-1.4336-4.8128-2.048-5.12-1.8432-10.8032-2.9696-16.7424-3.3792-2.9696-0.2048-5.9904-0.2048-9.0624 0-3.072 0.2048-6.144 0.5632-9.216 1.1264-12.288 2.304-23.6032 7.4752-31.8464 14.6432-1.2288 1.0752-2.3552 2.2016-3.4816 3.328-0.3072 0.3072-0.5632 0.6144-0.8192 0.9216-0.9216 1.024-1.792 2.048-2.56 3.1232-0.1024 0.1536-0.256 0.3072-0.4096 0.512-0.8704 1.2288-1.6896 2.4576-2.4064 3.7376l-0.4608 0.9216c-0.5632 1.0752-1.0752 2.1504-1.536 3.2256-0.1024 0.256-0.256 0.512-0.3584 0.8192-0.512 1.3312-0.9728 2.6624-1.28 3.9936-0.0512 0.256-0.1024 0.512-0.1536 0.7168l-0.4608 1.9968c-24.8832 4.4032-44.5952 6.3488-55.2448 6.6048l-8.9088 0.2048c-43.9296 1.024-75.6736 1.792-171.1616 30.7712-0.4608 0.1536-0.9216 0.3072-1.3312 0.4608-65.1264 25.0368-120.5248 73.1648-160.5632 139.5712zM957.8496 278.2208c-11.5712-7.1168-26.0608-5.0688-35.1232 5.0688L870.912 341.0944c-9.5744-5.8368-23.5008-14.4384-37.5296-23.552a27.3152 27.3152 0 0 0-31.7952 1.2288c-9.3696 7.168-13.1584 19.0464-9.6256 30.3104 12.9024 40.9088 23.2448 114.1248 26.3168 136.9088-35.4304 58.2656-81.92 98.8672-138.3936 120.6272-17.3568 5.2736-32.4096 9.5232-45.6704 13.0048 20.0704-13.4144 35.6864-28.16 28.5184-47.5136-6.1952-16.7936-31.5392-30.1056-53.3504-34.56-31.1296-6.3488-60.0576 2.7136-81.5616 25.4464-18.8928 20.0192-26.0608 45.6192-21.1456 72.8576-15.616 0.8192-41.0112 3.7376-71.8336 9.9328-10.5472-4.6592-23.808-6.144-38.0928-3.4816-18.5344 3.4304-33.024 12.7488-40.5504 24.6272-44.2368 15.5648-74.8544 34.4064-91.0336 56.0128-8.448 11.264-9.728 26.624-3.2256 39.168 9.5232 18.432 36.1472 63.3344 85.1456 100.4032 1.1776 17.7664 16.64 34.7136 40.3456 42.496 7.5264 2.4576 15.2576 3.6864 22.5792 3.6864 4.3008 0 8.448-0.4096 12.3904-1.28 2.3552-0.512 4.608-1.2288 6.7072-2.048 29.3888 9.5744 60.6208 14.3872 93.5424 14.3872 11.3152 0 22.8864-0.6144 34.56-1.7408 7.68 33.536 28.9792 56.9344 60.6208 65.4848 7.9872 2.1504 15.872 3.2256 23.6544 3.2256 21.6576 0 42.0864-8.2432 59.136-24.2176 16.2816-15.2064 30.8736-39.8336 27.392-57.3952-3.1744-15.9744-16.9472-22.0672-34.4576-24.3712 65.6896-31.1808 117.504-79.6672 154.5728-144.9472 53.0432-93.3888 62.0032-196.5056 59.904-268.0832l61.1328-155.8016c4.9152-12.6976 0.256-26.5216-11.3152-33.6896zM859.136 381.8496c11.3664 6.8608 26.0096 4.6592 34.9184-5.2224l10.0352-11.2128-33.0752 84.2752-7.8336 4.3008-7.5264 4.1472c-3.4816-23.7568-9.0624-57.9072-15.9232-88.1152 8.6016 5.3248 15.5648 9.5232 19.4048 11.8272z m-301.568 209.2544c9.216-9.7792 19.9168-14.5408 32.6656-14.5408h1.28c9.3184 0.256 17.92 3.0208 24.2176 6.0416-6.5536 4.6592-14.8992 9.7792-19.968 12.9024-6.5024 3.9936-12.1344 7.4752-16.2304 10.5472-10.4448 7.8336-18.3808 17.6128-22.9888 27.8528-2.816 0.2048-5.5296 0.4096-8.1408 0.5632h-0.1024c-4.9664-16.9984-1.8432-31.5904 9.2672-43.3664z m107.4176 347.4944c-11.1616 7.2192-23.0912 9.0112-36.5056 5.376-15.7696-4.2496-26.0608-15.0016-30.72-32 3.328-0.6656 6.656-1.3824 10.1888-2.2016 8.9088 5.3248 19.8656 8.8576 31.3856 9.9328 5.12 0.4608 11.7248 0.4608 19.3536 0.512 5.9392 0 15.7696 0 23.7568 0.5632-3.7888 5.8368-9.6768 12.6976-17.4592 17.8176z m-57.344-70.8096c-0.0512 0-0.1536 0-0.2048 0.0512-3.328 0.8192-6.5536 1.5872-9.6256 2.304-3.1232 0.7168-6.2464 1.3824-9.472 1.9968-49.1008 9.728-94.7712 8.9088-135.936-2.4064 0-0.1536-0.0512-0.3072-0.1024-0.4608-0.2048-1.5872-0.512-3.1744-0.9728-4.7616-0.1536-0.5632-0.3584-1.1264-0.5632-1.6896-0.4096-1.1776-0.8192-2.3552-1.3312-3.5328-0.256-0.6144-0.5632-1.2288-0.8704-1.8432a47.0016 47.0016 0 0 0-1.9968-3.4816c-0.3072-0.512-0.6144-1.0752-0.9728-1.5872-1.1264-1.6384-2.3552-3.2768-3.7376-4.8128-1.792-2.048-3.84-3.9936-5.9904-5.8368-6.5536-5.4784-14.7456-9.984-23.6544-12.9024-0.4096-0.1536-0.8192-0.256-1.28-0.3584-1.4336-0.4608-2.9184-0.8704-4.352-1.2288-0.5632-0.1536-1.0752-0.2048-1.6384-0.3584-1.3312-0.3072-2.6624-0.6144-3.9936-0.8192-0.5632-0.1024-1.0752-0.1536-1.5872-0.2048-1.28-0.2048-2.6112-0.3584-3.8912-0.4608-0.512-0.0512-1.0752-0.0512-1.5872-0.1024-1.28-0.1024-2.56-0.1536-3.7888-0.1536-0.512 0-1.024 0-1.536 0.0512-1.2288 0-2.5088 0.0512-3.6864 0.1536l-1.4336 0.1536c-1.2288 0.1024-2.4576 0.256-3.6352 0.4608-0.4096 0.0512-0.8192 0.1536-1.2288 0.256-1.2288 0.256-2.4576 0.512-3.6352 0.8192-0.3072 0.1024-0.6656 0.2048-0.9728 0.256-1.28 0.3584-2.5088 0.768-3.7376 1.2288-0.1024 0.0512-0.256 0.0512-0.3584 0.1024-39.3728-30.3616-61.5936-66.2528-70.5536-83.0464 10.5984-12.6464 31.7952-25.344 60.8256-36.5056 0.0512 0.0512 0.1536 0.1536 0.256 0.2048 1.1776 1.1776 2.5088 2.304 3.8912 3.328 0.3072 0.2048 0.5632 0.4096 0.8704 0.6144 1.4336 1.024 2.9696 1.9968 4.5568 2.8672 0.1024 0.0512 0.2048 0.1024 0.3584 0.1536 1.5872 0.8192 3.2256 1.5872 4.9152 2.2528 0.3072 0.1024 0.6144 0.256 0.9216 0.3584 1.7408 0.6656 3.584 1.2288 5.4784 1.6896 0.3584 0.1024 0.768 0.2048 1.1776 0.256 1.9456 0.4608 3.9936 0.8704 6.0416 1.1264 0.1024 0 0.2048 0 0.3072 0.0512 2.048 0.256 4.096 0.4096 6.2464 0.4608 0.4096 0 0.768 0.0512 1.1776 0.0512 0.3072 0 0.5632 0.0512 0.8704 0.0512 1.3312 0 2.7136-0.1024 4.096-0.2048 0.8192-0.0512 1.5872-0.0512 2.4064-0.1024 2.4576-0.2048 4.9664-0.5632 7.4752-1.024 1.7408-0.3072 3.4816-0.7168 5.12-1.1264 0.512-0.1536 1.024-0.256 1.4848-0.4096 1.1776-0.3072 2.304-0.6656 3.4304-1.024 0.5632-0.2048 1.0752-0.3584 1.6384-0.5632 1.0752-0.3584 2.0992-0.768 3.1232-1.1776l1.536-0.6144c1.0752-0.4608 2.1504-0.9728 3.2256-1.536 0.3584-0.2048 0.768-0.3584 1.1264-0.5632 1.4336-0.7168 2.7648-1.536 4.096-2.3552 0.0512 0 0.0512-0.0512 0.1024-0.0512 1.28-0.768 2.4576-1.6384 3.6352-2.4576 0.3584-0.256 0.6656-0.512 0.9728-0.768l2.4576-1.9968c0.3584-0.3072 0.7168-0.6144 1.024-0.9216 0.7168-0.6656 1.4336-1.3824 2.0992-2.0992 0.3072-0.3072 0.6144-0.6144 0.9216-0.9728 0.7168-0.8192 1.4336-1.6384 2.0992-2.4576 0.2048-0.256 0.3584-0.4608 0.5632-0.6656 0.8192-1.1264 1.5872-2.2528 2.304-3.3792 0.0512-0.1024 0.1024-0.256 0.2048-0.3584 0.6144-1.024 1.1776-2.048 1.6384-3.072l0.4608-1.0752c0.3584-0.8192 0.7168-1.6896 1.024-2.5088 0.1536-0.4096 0.256-0.8192 0.4096-1.2288 0.256-0.8192 0.4608-1.6896 0.6656-2.56 0.1024-0.4096 0.2048-0.8192 0.256-1.2288l0.1536-0.6144c24.8832-4.4032 44.5952-6.3488 55.2448-6.6048l8.9088-0.2048c43.9296-1.024 75.6736-1.792 171.1616-30.7712 0.4608-0.1536 0.9216-0.3072 1.3312-0.4608 65.024-24.832 120.3712-72.96 160.4096-139.3664l3.6864-2.048 9.1136-5.0176c-2.56 102.8096-36.4032 313.6-259.1744 368.8448z" 
                                fill="url(#pisces-gold-light)" 
                                className="dark:fill-[url(#pisces-gold-dark)]"
                                filter="url(#pisces-glow)"
                                opacity="0.85"
                            />
                            <path 
                                d="M780.8512 676.1984a20.44928 20.44928 0 0 0-23.0912 0.1024c-24.8832 17.1008-72.96 45.1584-95.8976 47.4624-28.2624 2.816-50.5344 17.5616-70.1952 30.5152-9.6768 6.4-18.7904 12.3904-26.8288 15.6672-17.664 7.168-52.8896 10.4448-64.9728 11.1104-8.0896 0.4608-15.1552 5.632-18.0224 13.2096s-1.024 16.128 4.7616 21.8112c17.5104 17.2544 55.2448 39.0144 104.6016 39.0144 27.2384 0 58.0096-6.6048 90.88-24.2176 0.3072-0.1536 0.6144-0.3584 0.9216-0.512 87.4496-52.8896 105.6256-129.3312 106.3424-132.5568 1.8432-8.3456-1.4848-16.8448-8.4992-21.6064z m-118.6304 118.784c-37.9392 20.224-69.9904 21.9136-94.4128 17.1008 4.4032-1.2288 8.6016-2.6112 12.4416-4.1984 11.8272-4.7616 23.0912-12.2368 33.9968-19.456 16.4352-10.8544 33.4336-22.1184 51.6608-23.9104 15.1552-1.536 33.8432-8.704 51.7632-17.408-12.9024 15.9232-30.8224 32.9216-55.4496 47.872z" 
                                fill="url(#pisces-gold-light)" 
                                className="dark:fill-[url(#pisces-gold-dark)]"
                                filter="url(#pisces-glow)"
                                opacity="0.85"
                            />
                            
                            {/* 原神风格星形点缀 */}
                            <g opacity="0.8">
                                <circle cx="512" cy="512" r="3" fill="url(#pisces-gold-light)" className="dark:fill-[url(#pisces-gold-dark)]" opacity="0.9">
                                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="256" cy="256" r="2" fill="url(#pisces-gold-light)" className="dark:fill-[url(#pisces-gold-dark)]" opacity="0.7">
                                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="768" cy="768" r="2" fill="url(#pisces-gold-light)" className="dark:fill-[url(#pisces-gold-dark)]" opacity="0.7">
                                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.8s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="256" cy="768" r="1.5" fill="url(#pisces-gold-light)" className="dark:fill-[url(#pisces-gold-dark)]" opacity="0.6">
                                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.2s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="768" cy="256" r="1.5" fill="url(#pisces-gold-light)" className="dark:fill-[url(#pisces-gold-dark)]" opacity="0.6">
                                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.8s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Top Section: Avatar & Name */}
                <div className="flex flex-col items-center w-full z-10 pt-4">
                    <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-[#d3bc8e] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                    <div className="w-24 h-24 rounded-full border-2 border-[#d3bc8e] p-1 bg-white/50 dark:bg-[#d3bc8e]/10 relative">
                        <img
                            src={AUTHOR_PROFILE.avatar}
                            alt={AUTHOR_PROFILE.name}
                            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Level Badge */}
                        <div className="absolute -bottom-1 -right-1 bg-[#d3bc8e] text-[#2b2f3a] text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-[#2b2f3a]">
                            Lv.{age}
                        </div>
                    </div>
                </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-[#f0f0f0] font-sans tracking-wider mt-4">
                        {AUTHOR_PROFILE.name}
                    </h3>
                    
                    {/* MBTI Tag - Genshin Style */}
                        {AUTHOR_PROFILE.mbti && (
                        <div className="mt-3 relative group">
                            {/* 背景光效 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#d3bc8e]/20 via-[#a38753]/20 to-[#d3bc8e]/20 dark:from-[#d3bc8e]/10 dark:via-[#a38753]/10 dark:to-[#d3bc8e]/10 rounded-md blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            
                            {/* 主容器 */}
                            <div className="relative bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#1e2026]/90 dark:to-[#15171e]/90 
                                border border-[#d3bc8e]/40 dark:border-[#d3bc8e]/30 
                                px-4 py-1.5 rounded-md 
                                shadow-md shadow-[#d3bc8e]/10 dark:shadow-[#d3bc8e]/5
                                group-hover:shadow-lg group-hover:shadow-[#d3bc8e]/20 dark:group-hover:shadow-[#d3bc8e]/10
                                transition-all duration-300">
                                
                                {/* 装饰性边框 */}
                                <div className="absolute inset-0 rounded-md border border-[#d3bc8e]/20 dark:border-[#d3bc8e]/10 pointer-events-none"></div>
                                
                                {/* 顶部装饰线 */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/50 to-transparent"></div>
                                
                                {/* 文字 */}
                                <div className="relative flex items-center justify-center gap-1.5">
                                    {/* 左侧装饰点 */}
                                    <div className="w-1 h-1 rounded-full bg-[#d3bc8e]/60 dark:bg-[#d3bc8e]/40"></div>
                                    <span className="text-xs font-bold tracking-[0.2em] text-[#8c7b60] dark:text-[#d3bc8e]/80 uppercase font-serif">
                                {AUTHOR_PROFILE.mbti}
                            </span>
                                    {/* 右侧装饰点 */}
                                    <div className="w-1 h-1 rounded-full bg-[#d3bc8e]/60 dark:bg-[#d3bc8e]/40"></div>
                                </div>
                                
                                {/* 底部高光 */}
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent rounded-b-md"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Location Card */}
                {AUTHOR_PROFILE.location && (() => {
                    const locationParts = AUTHOR_PROFILE.location.split(',').map(s => s.trim());
                    const city = locationParts[0] || '';
                    const country = locationParts[1] || 'China';
                    
                    return (
                        <div className="w-full mt-8 z-10">
                            <div className="relative group cursor-default transition-all duration-300">
                                {/* Card Background with ornate border illusion */}
                                <div className="relative bg-white dark:bg-[#1e2026] border border-[#e3dacd] dark:border-[#d3bc8e]/30 rounded-lg p-1 shadow-sm overflow-hidden">
                                    {/* Inner styling */}
                                    <div className="bg-[#fdfbf7] dark:bg-[#15171e] rounded border border-[#d3bc8e]/40 dark:border-[#d3bc8e]/20 p-3 relative overflow-hidden">
                                        
                                        {/* Decorative corners */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d3bc8e] dark:border-[#d3bc8e]/60"></div>
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d3bc8e] dark:border-[#d3bc8e]/60"></div>
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d3bc8e] dark:border-[#d3bc8e]/60"></div>
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d3bc8e] dark:border-[#d3bc8e]/60"></div>
                                        
                                        {/* Pattern Textures at Bottom */}
                                        {AUTHOR_PROFILE.locationPatterns?.show && (
                                            <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none overflow-hidden" style={{ opacity: AUTHOR_PROFILE.locationPatterns?.opacity || 0.15 }}>
                                                {/* 纹理1：书籍图案 - 左侧 */}
                                                {AUTHOR_PROFILE.locationPatterns?.texture1 && (
                                                    <div className="absolute bottom-2 left-2">
                                                        {AUTHOR_PROFILE.locationPatterns.texture1.startsWith('http') ? (
                                                            <img 
                                                                src={AUTHOR_PROFILE.locationPatterns.texture1} 
                                                                alt="书籍" 
                                                                className="h-8 w-auto"
                                                            />
                                                        ) : (
                                                            <svg 
                                                                className="h-8 w-8 text-[#a38753] dark:text-[#d3bc8e]/40" 
                                                                fill="currentColor" 
                                                                viewBox="0 0 1024 1024"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d={AUTHOR_PROFILE.locationPatterns.texture1} />
                                                            </svg>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* 纹理2：港口图案 - 右侧 */}
                                                {AUTHOR_PROFILE.locationPatterns?.texture2 && (
                                                    <div className="absolute bottom-2 right-2">
                                                        {AUTHOR_PROFILE.locationPatterns.texture2.startsWith('http') ? (
                                                            <img 
                                                                src={AUTHOR_PROFILE.locationPatterns.texture2} 
                                                                alt="港口" 
                                                                className="h-8 w-auto"
                                                            />
                                                        ) : (
                                                            <svg 
                                                                className="h-8 w-8 text-[#a38753] dark:text-[#d3bc8e]/40" 
                                                                fill="currentColor" 
                                                                viewBox="0 0 1024 1024"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d={AUTHOR_PROFILE.locationPatterns.texture2} />
                                                            </svg>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="relative flex items-center justify-between z-10 px-2 py-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-[#a38753] dark:text-[#d3bc8e]/70 font-bold tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1">
                                                    <Compass size={10} /> Region
                                                </span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-slate-700 dark:text-[#f0f0f0] font-serif leading-none tracking-wide group-hover:text-[#a38753] dark:group-hover:text-[#d3bc8e] transition-colors duration-300">
                                                        {city.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{country}</span>
                                                </div>
                                                {AUTHOR_PROFILE.locationDescription && (
                                                    <div className="mt-2 pt-1.5 border-t border-[#d3bc8e]/40 dark:border-[#d3bc8e]/20">
                                                        <span className="text-[11px] text-slate-500/90 dark:text-slate-400/90 font-medium tracking-widest font-sans">
                                                            {AUTHOR_PROFILE.locationDescription}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Icon Decoration */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d3bc8e]/10 to-white dark:from-[#d3bc8e]/5 dark:to-[#1e2026] border border-[#d3bc8e]/30 dark:border-[#d3bc8e]/20 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500 ml-4">
                                                <MapPin className="text-[#a38753] dark:text-[#d3bc8e] drop-shadow-sm" size={20} fill="currentColor" fillOpacity={0.2} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Card Shadow/Glow effect */}
                                <div className="absolute -inset-0.5 bg-[#d3bc8e]/20 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Right Content Section */}
            <div className="flex-1 pt-6 px-6 pb-4 md:pt-8 md:px-8 md:pb-4 relative z-10">
                {/* Constellation Decor Top Right */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <svg className="w-40 h-40 text-[#d3bc8e]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <path d="M10,10 L90,90 M90,10 L10,90" strokeOpacity="0.5" />
                    </svg>
                </div>

                {/* Bio */}
                <div className="relative z-10 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        {AUTHOR_PROFILE.role && (
                            <span className="text-[10px] font-bold tracking-widest text-[#a38753] dark:text-[#d3bc8e] uppercase border border-[#d3bc8e]/40 dark:border-[#d3bc8e]/30 px-2 py-0.5 rounded-sm">
                                {AUTHOR_PROFILE.role}
                            </span>
                        )}
                        <div className="h-px flex-1 bg-gradient-to-r from-[#d3bc8e]/30 dark:from-[#d3bc8e]/20 to-transparent"></div>
                    </div>

                    {AUTHOR_PROFILE.blogContent && (
                        <div className="relative pr-32">
                        <div
                            className="text-sm text-slate-600 dark:text-[#e0e0e0]/80 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: AUTHOR_PROFILE.blogContent }}
                        />
                            {/* Code Pattern Texture at blogContent Right */}
                            <div className="absolute top-0 right-0 opacity-5 dark:opacity-[0.03] pointer-events-none" style={{ opacity: 0.08 }}>
                                <div className="relative w-32 h-32 -top-2 -right-4">
                                    <Code2 size={128} className="text-[#a38753] dark:text-[#d3bc8e]/30" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Skills Section - Genshin Talent Style */}
                {AUTHOR_PROFILE.skills && (
                    <div className="mb-6 relative z-10">
                        <div className="flex flex-col gap-4">
                            {/* Programming Languages */}
                            {AUTHOR_PROFILE.skills.programmingLanguages && AUTHOR_PROFILE.skills.programmingLanguages.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] dark:text-[#d3bc8e] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Code2 size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] dark:text-[#d3bc8e]/80 uppercase tracking-wider">Languages</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.programmingLanguages.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-[#d3bc8e]/5 border border-transparent hover:border-[#d3bc8e]/30 text-slate-600 dark:text-[#e0e0e0]/70 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Frameworks */}
                            {AUTHOR_PROFILE.skills.frameworks && AUTHOR_PROFILE.skills.frameworks.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] dark:text-[#d3bc8e] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Cpu size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] dark:text-[#d3bc8e]/80 uppercase tracking-wider">Frameworks</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.frameworks.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-[#d3bc8e]/5 border border-transparent hover:border-[#d3bc8e]/30 text-slate-600 dark:text-[#e0e0e0]/70 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tools */}
                            {AUTHOR_PROFILE.skills.tools && AUTHOR_PROFILE.skills.tools.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] dark:text-[#d3bc8e] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Terminal size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] dark:text-[#d3bc8e]/80 uppercase tracking-wider">Tools</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.tools.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-[#d3bc8e]/5 border border-transparent hover:border-[#d3bc8e]/30 text-slate-600 dark:text-[#e0e0e0]/70 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Social Links */}
                <div className="relative z-10 flex flex-wrap gap-1.5">
                    {AUTHOR_PROFILE.socialLinks?.map((social, index) => {
                        const isDouyin = social.name === '抖音' || (social as any).douyinId || social.name === 'tiktok';
                        const isEmail = social.name === 'email';
                        const isWeChat = social.name === 'wechat';
                        const isBilibili = social.name === 'bilibili';
                        const isGitHub = social.name === 'gitHub' || social.name === 'github';

                        // Compact Genshin Button Style
                        const btnClass = "relative group/btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm cursor-pointer transition-all duration-300 overflow-hidden";

                        // Handle WeChat - Hover to show QR
                        if (isWeChat) {
                            const wechatQR = (social as any).wechatQR;
                            return (
                                <div key={index} className="relative group/wechat">
                                    <button className={btnClass}>
                                        {/* 背景光效 */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 dark:from-[#d3bc8e]/5 dark:via-[#a38753]/3 dark:to-[#d3bc8e]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* 主容器 */}
                                        <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                            bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#1e2026]/90 dark:to-[#15171e]/90
                                            border border-[#d3bc8e]/30 dark:border-[#d3bc8e]/20
                                            shadow-sm shadow-[#d3bc8e]/5 dark:shadow-[#d3bc8e]/3
                                            group-hover/btn:border-[#d3bc8e] dark:group-hover/btn:border-[#d3bc8e]/60
                                            group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20 dark:group-hover/btn:shadow-[#d3bc8e]/10
                                            group-hover/btn:scale-105
                                            transition-all duration-300">
                                            
                                            {/* 装饰性边框 */}
                                            <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 dark:border-[#d3bc8e]/5 pointer-events-none"></div>
                                            
                                            {/* 图标和文字 */}
                                            <div className="relative z-10 flex items-center gap-1.5">
                                                <div className="text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors">
                                        {renderIcon(social.icon, 14)}
                                                </div>
                                                <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors whitespace-nowrap">
                                                    {social.name}
                                                </span>
                                            </div>
                                            
                                            {/* 顶部高光 */}
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                        </div>
                                    </button>

                                    {/* QR Code Popup */}
                                    {wechatQR && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover/wechat:opacity-100 group-hover/wechat:visible transition-all duration-300 z-50">
                                            <div className="w-32 h-32 p-2 bg-white rounded-lg shadow-xl border border-[#d3bc8e]">
                                                <img
                                                    src={wechatQR}
                                                    alt="WeChat QR"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#d3bc8e] rotate-45"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        // Handle TikTok (Douyin) - Click to Copy
                        if (isDouyin) {
                            return (
                                <button key={index} onClick={() => handleCopyDouyinId((social as any).douyinId)} className={btnClass}>
                                    {/* 背景光效 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 dark:from-[#d3bc8e]/5 dark:via-[#a38753]/3 dark:to-[#d3bc8e]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* 主容器 */}
                                    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                        bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#1e2026]/90 dark:to-[#15171e]/90
                                        border border-[#d3bc8e]/30 dark:border-[#d3bc8e]/20
                                        shadow-sm shadow-[#d3bc8e]/5 dark:shadow-[#d3bc8e]/3
                                        group-hover/btn:border-[#d3bc8e] dark:group-hover/btn:border-[#d3bc8e]/60
                                        group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20 dark:group-hover/btn:shadow-[#d3bc8e]/10
                                        group-hover/btn:scale-105
                                        transition-all duration-300">
                                        
                                        {/* 装饰性边框 */}
                                        <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 dark:border-[#d3bc8e]/5 pointer-events-none"></div>
                                        
                                        {/* 图标和文字 */}
                                        <div className="relative z-10 flex items-center gap-1.5">
                                            <div className="text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors">
                                    {renderIcon(social.icon, 14)}
                                            </div>
                                            <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors whitespace-nowrap">
                                                {copiedDouyinId ? '已复制' : social.name}
                                            </span>
                                        </div>
                                        
                                        {/* 顶部高光 */}
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                    </div>
                                </button>
                            )
                        }

                        // Handle Bilibili, Email, GitHub - Normal Links
                        if (isBilibili || isEmail || isGitHub) {
                            return (
                                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={btnClass}>
                                    {/* 背景光效 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 dark:from-[#d3bc8e]/5 dark:via-[#a38753]/3 dark:to-[#d3bc8e]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* 主容器 */}
                                    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                        bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#1e2026]/90 dark:to-[#15171e]/90
                                        border border-[#d3bc8e]/30 dark:border-[#d3bc8e]/20
                                        shadow-sm shadow-[#d3bc8e]/5 dark:shadow-[#d3bc8e]/3
                                        group-hover/btn:border-[#d3bc8e] dark:group-hover/btn:border-[#d3bc8e]/60
                                        group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20 dark:group-hover/btn:shadow-[#d3bc8e]/10
                                        group-hover/btn:scale-105
                                        transition-all duration-300">
                                        
                                        {/* 装饰性边框 */}
                                        <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 dark:border-[#d3bc8e]/5 pointer-events-none"></div>
                                        
                                        {/* 图标和文字 */}
                                        <div className="relative z-10 flex items-center gap-1.5">
                                            <div className="text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors">
                                    {renderIcon(social.icon, 14)}
                                            </div>
                                            <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] dark:text-[#d3bc8e]/70 group-hover/btn:text-[#a38753] dark:group-hover/btn:text-[#d3bc8e] transition-colors whitespace-nowrap">
                                                {social.name}
                                            </span>
                                        </div>
                                        
                                        {/* 顶部高光 */}
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                    </div>
                                </a>
                            )
                        }

                        return null;
                    })}
                </div>

            </div>
            </div>
        </div>
    );
}
