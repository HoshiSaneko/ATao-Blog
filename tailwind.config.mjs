/**
 * Tailwind CSS 配置文件
 * 
 * 注意：此文件中的颜色和字体配置应与 src/config.ts 中的 THEME_COLORS 和 THEME_FONTS 保持一致
 * 如需修改主题，请同时更新 src/config.ts 和此文件
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // 对应 config.ts 中的 THEME_FONTS.sans
        sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // 对应 config.ts 中的 THEME_FONTS.serif
        serif: ['Merriweather', 'Noto Serif SC', 'Songti SC', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        // 对应 config.ts 中的 THEME_COLORS.light
        docs: {
          bg: '#FAFBFC',
          paper: '#FFFFFF',
          text: '#1F2937',
          accent: '#4285F4',
          muted: '#6B7280',
        },
        // 对应 config.ts 中的 THEME_COLORS.dark
        dark: {
          bg: '#0A0B0E',
          paper: '#131418',
          text: '#E5E7EB',
          accent: '#60A5FA',
          muted: '#9CA3AF',
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInFromLeft: {
          '0%': { 
            transform: 'translateX(-20px) scale(0.9) rotate(-2deg)',
            opacity: '0',
          },
          '60%': {
            transform: 'translateX(5px) scale(1.02) rotate(1deg)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateX(0) scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        tagSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        roleBadgeEnter: {
          '0%': {
            transform: 'translateY(15px) scale(0.85) rotate(-3deg)',
            opacity: '0',
            filter: 'blur(4px)',
          },
          '50%': {
            transform: 'translateY(-3px) scale(1.05) rotate(2deg)',
            opacity: '0.9',
            filter: 'blur(1px)',
          },
          '75%': {
            transform: 'translateY(1px) scale(0.98) rotate(-0.5deg)',
            opacity: '1',
            filter: 'blur(0px)',
          },
          '100%': {
            transform: 'translateY(0) scale(1) rotate(0deg)',
            opacity: '1',
            filter: 'blur(0px)',
          },
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'zoom-in': 'zoomIn 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-left': 'slideInFromLeft 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'role-badge-enter': 'roleBadgeEnter 900ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'tag-slide-in': 'tagSlideIn 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}

