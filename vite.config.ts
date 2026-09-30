import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/roborock-vacuum-card.ts',
            formats: ['es'],
            fileName: () => 'roborock-vacuum-card.js',
        },
        rollupOptions: {
            external: [],
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: {
            origin: '*',
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
            allowedHeaders: ['*'],
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'Access-Control-Allow-Headers': '*',
        },
    },
});
