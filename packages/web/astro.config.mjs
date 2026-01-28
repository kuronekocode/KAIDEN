import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  
  // GitHub Pages デプロイ用設定
  site: 'https://kuronekocode.github.io',
  base: '/kaiden',
  
  // 静的サイト生成
  output: 'static',
  
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
      },
    },
  },
});
