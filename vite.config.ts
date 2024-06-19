import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  server: {
    port: 3000, // You can customize the dev server port here
  },
  build: {
    outDir: 'dist', // Customize the output directory
  },
});
