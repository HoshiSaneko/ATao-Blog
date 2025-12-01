import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  summary: string;
}

export default function ShareButtons({ title, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // Set share URL on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const text = `Read "${title}"`;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` : '#',
      color: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 dark:hover:bg-[#1DA1F2]/20'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: shareUrl ? `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}` : '#',
      color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 dark:hover:bg-[#0A66C2]/20'
    }
  ];

  return (
    <div className="mt-12 flex items-center gap-4">
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">
        分享本文
      </span>
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-full text-slate-500 dark:text-slate-400 transition-all duration-200 ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon size={18} />
          </a>
        ))}
        
        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>

        <button
          onClick={handleCopyLink}
          className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-docs-accent dark:hover:text-dark-accent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 relative"
          aria-label="Copy Link"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <LinkIcon size={18} />}
        </button>
      </div>
    </div>
  );
}

