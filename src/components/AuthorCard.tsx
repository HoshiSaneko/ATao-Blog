import { useState, useEffect } from 'react';
import { AUTHOR_PROFILE, LICENSE_CONFIG } from '../config';
import { Copyright, Github, Mail, MapPin, Globe, Link as LinkIcon, User, Cake, Check, Briefcase, Twitter, Linkedin, Code2, Terminal, Cpu } from 'lucide-react';
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
        <div className={`relative w-full flex flex-col md:flex-row items-stretch gap-0 rounded-xl overflow-hidden shadow-xl
            bg-gradient-to-r from-white to-slate-50 dark:from-[#1c1f2e] dark:to-[#2a2d3e]
            border border-[#d3bc8e]/40 dark:border-[#d3bc8e]/30 group ${className}`}>

            {/* Left Decor / Avatar Section */}
            <div className="relative md:w-64 shrink-0 bg-[#f9fafb]/80 dark:bg-[#15171e]/50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#d3bc8e]/20 dark:border-[#d3bc8e]/10">
                {/* Constellation BG */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <svg className="absolute -top-10 -left-10 w-48 h-48 text-[#d3bc8e]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="2" fill="currentColor" />
                    </svg>
                </div>

                <div className="relative group z-10">
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

                <div className="mt-4 text-center z-10">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-[#f0f0f0] font-sans tracking-wider">
                        {AUTHOR_PROFILE.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5 font-mono text-[10px] text-[#8c7b60] dark:text-[#d3bc8e]/60 uppercase">
                        {AUTHOR_PROFILE.location && (
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#d3bc8e]/5 px-2 py-0.5 rounded text-slate-600 dark:text-inherit">
                                <MapPin size={10} /> {AUTHOR_PROFILE.location}
                            </span>
                        )}
                        {AUTHOR_PROFILE.mbti && (
                            <span className="bg-slate-100 dark:bg-[#d3bc8e]/5 px-2 py-0.5 rounded text-slate-600 dark:text-inherit">
                                {AUTHOR_PROFILE.mbti}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Content Section */}
            <div className="flex-1 p-6 md:p-8 relative">
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
                        <div
                            className="text-sm text-slate-600 dark:text-[#e0e0e0]/80 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: AUTHOR_PROFILE.blogContent }}
                        />
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
                <div className="relative z-10 flex flex-wrap gap-2">
                    {AUTHOR_PROFILE.socialLinks?.map((social, index) => {
                        const isDouyin = social.name === '抖音' || (social as any).douyinId;
                        const isEmail = social.name === 'Email';
                        const isWeChat = social.name === 'WeChat';

                        // Custom Genshin Button Style
                        const btnClass = "flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white dark:bg-[#1e2026] border border-slate-200 dark:border-[#d3bc8e]/20 text-slate-600 dark:text-[#d3bc8e] text-xs hover:border-[#d3bc8e] hover:text-[#a38753] dark:hover:text-[#d3bc8e] hover:bg-[#fffbf0] dark:hover:bg-[#d3bc8e]/10 transition-all cursor-pointer group/btn shadow-sm relative";

                        // Handle WeChat - Hover to show QR
                        if (isWeChat) {
                            const wechatQR = (social as any).wechatQR;
                            return (
                                <div key={index} className="relative group/wechat">
                                    <button className={btnClass}>
                                        {renderIcon(social.icon, 14)}
                                        <span>{social.name}</span>
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
                                    {renderIcon(social.icon, 14)}
                                    <span>{copiedDouyinId ? '已复制' : social.name}</span>
                                </button>
                            )
                        }

                        // Handle Email, GitHub, Bilibili - Normal Links
                        if (isEmail || (!isDouyin && !isWeChat)) {
                            return (
                                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={btnClass}>
                                    {renderIcon(social.icon, 14)}
                                    <span>{social.name}</span>
                                </a>
                            )
                        }

                        return null;
                    })}
                </div>

            </div>
        </div>
    );
}
