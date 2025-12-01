
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // 明确指定输出模式为静态站点生成
  output: 'static',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@astrojs/react'],
    },
    ssr: {
      external: ['react-syntax-highlighter'],
    },
    build: {
      // 增加 chunk 大小限制，避免过度拆分
      chunkSizeWarningLimit: 1000,
    },
  },
});

