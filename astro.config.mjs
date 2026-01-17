// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blinkad.co.kr',
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'ko',
        locales: {
          ko: 'ko-KR',
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  // Compression settings
  compressHTML: true,

  build: {
    // Inline small CSS
    inlineStylesheets: 'auto',
  },
});
