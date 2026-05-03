import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daniel-espanadero.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    server: {
      allowedHosts: ['w7kbtl-ip-186-18-87-181.tunnelmole.net'],
    },
  },
});
