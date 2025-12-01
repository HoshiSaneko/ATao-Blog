import { useState, useRef, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { NAVBAR } from '../config';

interface NavbarProps {
  currentPath: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ currentPath, searchQuery: initialSearchQuery, setSearchQuery }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setLocalSearchQuery] = useState(initialSearchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听 search-updated 事件，以便从 URL 参数恢复搜索状态
  useEffect(() => {
    const handleSearchUpdated = ((e: CustomEvent) => {
      const query = e.detail.query || '';
      setLocalSearchQuery(query);
      // 如果有搜索内容，自动打开搜索框
      if (query.trim().length > 0) {
        setIsSearchOpen(true);
      }
    }) as EventListener;

    window.addEventListener('search-updated', handleSearchUpdated);
    return () => window.removeEventListener('search-updated', handleSearchUpdated);
  }, []);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  const navLinks = NAVBAR.links;

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        e.preventDefault();
        handleCloseSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    // 移除跳转逻辑，允许在任何页面打开搜索框
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setLocalSearchQuery('');

    // Only call setSearchQuery if it's a valid function
    if (setSearchQuery && typeof setSearchQuery === 'function') {
      try {
        setSearchQuery('');
      } catch (error) {
        // Ignore errors from empty function implementations
      }
    }

    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('search-updated', {
        detail: { query: '' }
      }));
    }
  };

  const handleClearOrClose = () => {
    if (searchQuery.trim().length > 0) {
      setLocalSearchQuery('');

      // Only call setSearchQuery if it's a valid function
      if (setSearchQuery && typeof setSearchQuery === 'function') {
        try {
          setSearchQuery('');
        } catch (error) {
          // Ignore errors
        }
      }

      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('search-updated', {
          detail: { query: '' }
        }));
      }

      searchInputRef.current?.focus();
    } else {
      handleCloseSearch();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);

    // Only call setSearchQuery if it's a valid function (not an empty arrow function)
    if (setSearchQuery && typeof setSearchQuery === 'function') {
      try {
        setSearchQuery(value);
      } catch (error) {
        // Ignore errors from empty function implementations
      }
    }

    // 如果在首页，立即触发搜索
    if (currentPath === '/') {
      // Dispatch custom event for search
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('search-updated', {
          detail: { query: value }
        }));
      }
    } else {
      // 如果不在首页，使用防抖延迟跳转，让用户先输入完
      // 清除之前的定时器
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }

      // 如果用户输入了内容，设置防抖定时器
      if (value.trim().length > 0) {
        navigateTimeoutRef.current = setTimeout(() => {
          // 保存搜索内容到 sessionStorage
          try {
            sessionStorage.setItem('pendingSearchQuery', value.trim());
            // 跳转到首页
            window.location.href = '/';
          } catch (e) {
            // sessionStorage 可能不可用，使用 URL 参数作为后备
            const searchParams = new URLSearchParams();
            searchParams.set('q', value.trim());
            window.location.href = `/?${searchParams.toString()}`;
          }
        }, 800); // 等待用户停止输入 800ms 后再跳转
      }
    }
  };

  const bgOpacity = NAVBAR.backgroundOpacity;
  const backdropBlur = NAVBAR.enableBackdropBlur ? 'backdrop-blur-md' : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      <div
        className={`absolute inset-0 ${backdropBlur} border-b border-slate-200/50 shadow-sm transition-colors duration-500`}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        }}
      ></div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <a
            href="/"
            className={`flex-shrink-0 cursor-pointer group flex items-center gap-2 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="w-8 h-8 bg-docs-accent rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              {NAVBAR.logoIcon}
            </div>
            {NAVBAR.logoText && (
              <span className="font-serif font-bold text-xl tracking-tight group-hover:text-docs-accent transition-colors">
                {NAVBAR.logoText}
              </span>
            )}
          </a>

          {isSearchOpen ? (
            <div className="flex-1 max-w-lg flex items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-100 border-none rounded-lg py-2 pl-4 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-docs-accent outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  onClick={handleClearOrClose}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  aria-label="Clear search or close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block flex-1">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={(link as any).target || undefined}
                    rel={(link as any).target === '_blank' ? 'noopener noreferrer' : undefined}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${currentPath === link.href
                      ? 'text-docs-accent bg-blue-50'
                      : 'text-slate-600 hover:text-docs-accent hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {!isSearchOpen && NAVBAR.showSearch && (
              <button
                onClick={handleOpenSearch}
                className="p-2 rounded-full text-slate-500 hover:text-docs-accent hover:bg-slate-100 transition-all"
                aria-label="Open search"
              >
                <Search size={20} />
              </button>
            )}

            <div className="flex md:hidden gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-docs-accent hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && !isSearchOpen && (
        <div className="relative md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 animate-in slide-in-from-top-5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={(link as any).target || undefined}
                rel={(link as any).target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPath === link.href
                  ? 'text-docs-accent bg-blue-50'
                  : 'text-slate-600'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

