import { defineConfig } from 'vite';
import { resolve } from 'path';

const pageRewrites = {
  '/': '/frontend/home.html',
  '/home': '/frontend/home.html',
  '/products': '/frontend/products.html',
  '/order': '/frontend/order.html',
  '/technology': '/frontend/technology.html',
  '/about': '/frontend/about.html',
  '/login': '/frontend/login.html',
  '/register': '/frontend/register.html',
  '/dashboard': '/frontend/dashboard.html',
  '/payment': '/frontend/payment.html',
  '/privacy': '/frontend/privacy.html',
  '/terms': '/frontend/terms.html',
  '/intro': '/frontend/intro.html',
  '/about_payment': '/frontend/about_payment.html',
};

export default defineConfig({
  root: '.',
  plugins: [
    {
      name: 'html-rewrites',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = req.url.split('?')[0].split('#')[0];
          
          // Force clean URL if they visit the .html path or /home
          const cleanPath = Object.keys(pageRewrites).find(key => pageRewrites[key] === pathname);
          if (pathname === '/home') {
            res.writeHead(301, { Location: '/' });
            res.end();
            return;
          }
          if (cleanPath && pathname.startsWith('/frontend/')) {
            // If the user hit /frontend/home.html directly, redirect them to / (or the clean path)
            // Use the shortest clean path (e.g. / for home)
            const bestCleanPath = cleanPath === '/home' ? '/' : cleanPath;
            res.writeHead(301, { Location: bestCleanPath });
            res.end();
            return;
          }

          if (pageRewrites[pathname]) {
            req.url = pageRewrites[pathname];
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        main: resolve(__dirname, 'frontend/home.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        register: resolve(__dirname, 'frontend/register.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        technology: resolve(__dirname, 'frontend/technology.html'),
        order: resolve(__dirname, 'frontend/order.html'),
        products: resolve(__dirname, 'frontend/products.html'),
        payment: resolve(__dirname, 'frontend/payment.html'),
        privacy: resolve(__dirname, 'frontend/privacy.html'),
        terms: resolve(__dirname, 'frontend/terms.html'),
        intro: resolve(__dirname, 'frontend/intro.html'),
        about_payment: resolve(__dirname, 'frontend/about_payment.html'),
        about: resolve(__dirname, 'frontend/about.html'),
        technology_fiverr: resolve(__dirname, 'frontend/technology.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
