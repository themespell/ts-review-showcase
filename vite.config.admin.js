import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        minify: true,
        manifest: false,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main.jsx'),
            output: {
                dir: 'includes/assets/admin',
                entryFileNames: 'admin.js',
                assetFileNames: 'admin.[ext]',
                inlineDynamicImports: true,
            },
        },
    },
});
