import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        register: resolve(__dirname, 'frontend/register.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        about: resolve(__dirname, 'frontend/about.html'),
        order: resolve(__dirname, 'frontend/order.html'),
        products: resolve(__dirname, 'frontend/products.html'),
        payment: resolve(__dirname, 'frontend/payment.html'),
        privacy: resolve(__dirname, 'frontend/privacy.html'),
        terms: resolve(__dirname, 'frontend/terms.html'),
        intro: resolve(__dirname, 'frontend/intro.html'),
        about_payment: resolve(__dirname, 'frontend/about_payment.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
