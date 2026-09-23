import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures relative asset path resolution for GitHub Pages
    build: {
        outDir: 'dist'
    }
});
