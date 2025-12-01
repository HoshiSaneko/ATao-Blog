import { useState, useEffect } from 'react';
import { AUTHOR_PROFILE, LICENSE_CONFIG } from '../config';
import { Copyright, Github, Mail, MapPin, Globe, Link as LinkIcon, User, Cake, Check, Briefcase, Twitter, Linkedin } from 'lucide-react';
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
    // 如果图标名称包含冒号，使用 Iconify
    if (iconName.includes(':')) {
        return <Icon icon={iconName} width={size} height={size} className={className} />;
    }
    // 否则使用 Lucide React 图标
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

    const handleCopyDouyinId = (douyinId: string) => {
        navigator.clipboard.writeText(douyinId);
        setCopiedDouyinId(true);
        setTimeout(() => setCopiedDouyinId(false), 2000);
    };

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    // 版权卡片使用不同的样式
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

    // 关于页面的信息卡片保持原有样式
    return (
        <div className={`relative w-full flex flex-col sm:flex-row items-start gap-6 p-6 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm dark:shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transition-all duration-500 hover:shadow-lg dark:hover:shadow-2xl hover:scale-[1.01] animate-zoom-in ${className}`}>
            {/* 头像区域 */}
            <div className="flex-shrink-0 relative z-10 flex flex-col items-center sm:items-start">
                <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                    <img
                        src={AUTHOR_PROFILE.avatar}
                        alt={AUTHOR_PROFILE.name}
                        className="w-20 h-20 rounded-full object-cover mb-3 ring-2 ring-slate-200 dark:ring-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:ring-blue-400 dark:group-hover:ring-blue-500"
                    />
                </div>
                
                {/* 生日、地区、MBTI 显示在头像下方 */}
                <div className="flex flex-col items-center sm:items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400 animate-zoom-in w-full">
                    {/* 地区 */}
                    {AUTHOR_PROFILE.location && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-default">
                            <MapPin size={12} />
                            {AUTHOR_PROFILE.location}
                        </span>
                    )}
                    {/* 出生年月 */}
                    {AUTHOR_PROFILE.birthDate && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-default">
                            <Cake size={12} />
                            {AUTHOR_PROFILE.birthDate}
                        </span>
                    )}
                    {/* MBTI */}
                    {AUTHOR_PROFILE.mbti && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-default uppercase">
                            <User size={12} />
                            {AUTHOR_PROFILE.mbti.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* 微信二维码 - 左下角显示 */}
            {!showLicense && showWechatQR && AUTHOR_PROFILE.wechatQR && (
                <div className="absolute bottom-6 left-6 z-20 animate-zoom-in">
                    <div className="w-20 h-20 rounded-lg bg-white dark:bg-slate-700 p-1.5 shadow-lg border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:scale-110 hover:shadow-xl">
                        <img
                            src={AUTHOR_PROFILE.wechatQR}
                            alt="微信二维码"
                            className="w-full h-full object-cover rounded"
                        />
                    </div>
                </div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 w-full relative z-10 min-w-0">
                {/* 头部信息 */}
                <div className="mb-4 animate-zoom-in">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-default">
                        {AUTHOR_PROFILE.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        {/* 职业 - 个人信息卡片中显示 */}
                        {AUTHOR_PROFILE.role && (
                            <span className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 hover:scale-[1.08] hover:-translate-y-0.5 hover:rotate-1 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 cursor-default animate-role-badge-enter">
                                <Briefcase size={15} className="text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                                {AUTHOR_PROFILE.role}
                            </span>
                        )}
                    </div>
                </div>

                {/* 个人信息卡片额外内容 */}
                {
                    <div className="space-y-4 animate-zoom-in">
                        {/* 博客内容 */}
                        {AUTHOR_PROFILE.blogContent && (
                            <p 
                                className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100 cursor-default"
                                dangerouslySetInnerHTML={{ __html: AUTHOR_PROFILE.blogContent }}
                            />
                        )}

                        {/* 技能标签分类显示 */}
                        {AUTHOR_PROFILE.skills && typeof AUTHOR_PROFILE.skills === 'object' && !Array.isArray(AUTHOR_PROFILE.skills) && (
                            <div className="space-y-3">
                                {/* 编程语言 */}
                                {AUTHOR_PROFILE.skills.programmingLanguages && AUTHOR_PROFILE.skills.programmingLanguages.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">编程语言</div>
                                        <div className="flex flex-wrap gap-2">
                                            {AUTHOR_PROFILE.skills.programmingLanguages.map((lang, index) => (
                                                <span
                                                    key={`lang-${index}`}
                                                    className="px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 hover:shadow-sm cursor-default"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* 开发框架 */}
                                {AUTHOR_PROFILE.skills.frameworks && AUTHOR_PROFILE.skills.frameworks.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">开发框架</div>
                                        <div className="flex flex-wrap gap-2">
                                            {AUTHOR_PROFILE.skills.frameworks.map((framework, index) => (
                                                <span
                                                    key={`framework-${index}`}
                                                    className="px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 hover:shadow-sm cursor-default"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    {framework}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* 开发工具 */}
                                {AUTHOR_PROFILE.skills.tools && AUTHOR_PROFILE.skills.tools.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">开发工具</div>
                                        <div className="flex flex-wrap gap-2">
                                            {AUTHOR_PROFILE.skills.tools.map((tool, index) => (
                                                <span
                                                    key={`tool-${index}`}
                                                    className="px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105 hover:shadow-sm cursor-default"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* 兼容旧格式：如果 skills 是数组 */}
                        {AUTHOR_PROFILE.skills && Array.isArray(AUTHOR_PROFILE.skills) && (
                            <div className="flex flex-wrap gap-2">
                                {AUTHOR_PROFILE.skills.map((skill, index) => (
                                    <span
                                        key={`skill-${index}`}
                                        className="px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-105 hover:shadow-sm cursor-default"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* 社交链接 - 更简洁的样式 */}
                        {AUTHOR_PROFILE.socialLinks && AUTHOR_PROFILE.socialLinks.length > 0 && (
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                {AUTHOR_PROFILE.socialLinks.map((social, index) => {
                                    const isEmail = social.icon === 'Mail';
                                    const isDouyin = (social as any).douyinId;
                                    return (
                                        <div key={index} className="flex items-center gap-3">
                                            {isDouyin ? (
                                                <button
                                                    onClick={() => handleCopyDouyinId((social as any).douyinId)}
                                                    className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer ${social.color || 'hover:text-docs-accent dark:hover:text-dark-accent'}`}
                                                    aria-label={social.name}
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    {copiedDouyinId ? (
                                                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        renderIcon(social.icon, 16, "transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3")
                                                    )}
                                                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                                        {copiedDouyinId ? '已复制' : social.name}
                                                    </span>
                                                </button>
                                            ) : (
                                                <a
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer ${social.color || 'hover:text-docs-accent dark:hover:text-dark-accent'}`}
                                                    aria-label={social.name}
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    {renderIcon(social.icon, 16, "transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3")}
                                                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">{social.name}</span>
                                                </a>
                                            )}
                                            {/* 在 Email 右侧添加微信按钮 */}
                                            {isEmail && (
                                                <button
                                                    onClick={() => setShowWechatQR(!showWechatQR)}
                                                    className="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer hover:text-green-600 dark:hover:text-green-400"
                                                    aria-label="微信"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    {renderIcon("simple-icons:wechat", 16, "transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3")}
                                                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">WeChat</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                }
            </div>

        </div>
    );
}
