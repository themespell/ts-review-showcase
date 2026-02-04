import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        minify: true,
        manifest: false,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/frontend/Frontend.jsx'),
            output: {
                dir: 'includes/assets/frontend',
                entryFileNames: 'frontend.js',
                assetFileNames: 'frontend.[ext]',
                inlineDynamicImports: true,
            },
        },
    },
});
