const THEME_STORAGE_KEY = 'theme-preference';

export function initTheme() {
  if (typeof window === 'undefined') return;
  
  try {
    // 优先从 localStorage 读取用户之前的选择
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // 如果没有保存的主题，使用系统偏好
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        // 保存系统偏好到 localStorage
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
    }
  } catch (e) {
    // localStorage 可能不可用，回退到系统偏好
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function toggleTheme() {
  if (typeof window === 'undefined') return false;
  
  try {
    const isDark = document.documentElement.classList.contains('dark');
    const newIsDark = !isDark;
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
    
    return newIsDark;
  } catch (e) {
    // localStorage 不可用，只切换类名
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    return !isDark;
  }
}

export function getTheme() {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
}

