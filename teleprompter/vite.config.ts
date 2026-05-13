import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@video': path.resolve(__dirname, '../src'),
      '@constants': path.resolve(__dirname, '../src/constants.ts'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'remotion', '@remotion/player'],
  },
});
