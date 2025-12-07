import React, { memo } from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
}

const LinkCard: React.FC<LinkCardProps> = ({ url, title, description, image, children }) => {
  // Extract domain from URL for fallback
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Get GitHub default image if URL is a GitHub repository
  const getGitHubImage = (url: string): string | null => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com') {
        // Extract owner and repo from path: /owner/repo
        const pathMatch = urlObj.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
        if (pathMatch) {
          const [, owner, repo] = pathMatch;
          // Use GitHub's Open Graph image service (multiple formats for reliability)
          // Format 1: opengraph.githubassets.com (most reliable)
          return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
        }
      }
    } catch {
      // Invalid URL, return null
    }
    return null;
  };

  // Get webpage screenshot/thumbnail if no image is provided
  const getWebpageScreenshot = (url: string): string | null => {
    if (image) return null; // If image is provided, don't use screenshot
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const encodedUrl = encodeURIComponent(urlObj.href);
      
      // Use higher quality screenshot service
      // Increase resolution for better quality (1920x1080 for better scaling and less aliasing)
      // Use fullpage option for better quality, and wait for page load
      return `https://image.thum.io/get/width/1920/crop/1080/fullpage/wait/2/noanimate/${encodedUrl}`;
    } catch {
      // Invalid URL, return null
    }
    return null;
  };

  const domain = getDomain(url);
  const displayTitle = title || children || domain;
  const displayDescription = description || '';
  
  // Determine image source with priority:
  // 1. Provided image
  // 2. GitHub Open Graph image (for GitHub repos)
  // 3. Webpage screenshot (for all other URLs, including GitHub as fallback)
  let displayImage: string | undefined = image;
  if (!displayImage) {
    displayImage = getGitHubImage(url) || undefined;
  }
  if (!displayImage) {
    // Always try screenshot as fallback, even for GitHub
    displayImage = getWebpageScreenshot(url) || undefined;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-link-card="true"
      className="group block my-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image section */}
        {displayImage && (
          <div className="w-full sm:w-40 h-32 sm:h-auto sm:flex-shrink-0 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
            <img
              src={displayImage}
              alt={displayTitle as string}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              style={{
                imageRendering: 'auto',
              } as React.CSSProperties}
              loading="lazy"
              onError={(e) => {
                // On error, try fallback screenshot service
                const img = e.target as HTMLImageElement;
                const currentSrc = img.src;
                
                // If current source is GitHub Open Graph, try screenshot service
                if (currentSrc.includes('opengraph.githubassets.com') || currentSrc.includes('github.com')) {
                  try {
                    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                    const encodedUrl = encodeURIComponent(urlObj.href);
                    // Try screenshot service as fallback with higher quality
                    img.src = `https://image.thum.io/get/width/1920/crop/1080/fullpage/wait/2/noanimate/${encodedUrl}`;
                    return; // Don't hide, try screenshot
                  } catch {}
                }
                
                // If screenshot also fails, try microlink
                if (currentSrc.includes('image.thum.io')) {
                  try {
                    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                    const encodedUrl = encodeURIComponent(urlObj.href);
                    img.src = `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false`;
                    return;
                  } catch {}
                }
                
                // Hide image container only if all fallbacks fail
                img.parentElement?.style.setProperty('display', 'none');
              }}
            />
          </div>
        )}

        {/* Content section */}
        <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col">
          {/* Title with external link icon */}
          <div className="flex items-start gap-2 mb-1.5">
            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1 leading-snug">
              {displayTitle}
            </h3>
            <ExternalLink 
              size={16} 
              className="flex-shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1" 
            />
          </div>

          {/* Description */}
          {displayDescription && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
              {displayDescription}
            </p>
          )}

          {/* Domain */}
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
              {domain}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default memo(LinkCard);

