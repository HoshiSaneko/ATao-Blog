import { initTheme, toggleTheme, getTheme } from './theme';

// Initialize theme on page load
if (typeof window !== 'undefined') {
  initTheme();
  
  // Setup global theme toggle handler
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const themeToggle = target.closest('[data-theme-toggle]');
    if (themeToggle) {
      const isDark = toggleTheme();
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark } }));
    }
  });
  
  // Listen for theme changes and update ParticlesBackground
  window.addEventListener('theme-changed', ((e: CustomEvent) => {
    const isDark = e.detail.isDark;
    // Update any ParticlesBackground components
    const particles = document.querySelector('canvas');
    if (particles) {
      // Trigger re-render by dispatching event
      window.dispatchEvent(new CustomEvent('particles-theme-changed', { detail: { isDark } }));
    }
  }) as EventListener);
}

