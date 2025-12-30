import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Carrega as variáveis de ambiente
    const env = loadEnv(mode, process.cwd(), '');

    // Define a URL da API (Vercel ou Local)
    const apiUrl = env.VITE_API_URL || 'http://localhost:3001';

    return {
        plugins: [react()],

        // Injeta a URL correta no código
        define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
        },

        server: {
            port: 5174,
            strictPort: true,
        },

        build: {
            // Aumenta o limite de aviso de tamanho (para não ficar apitando alerta)
            chunkSizeWarningLimit: 1600,
            // REMOVI O 'manualChunks' QUE ESTAVA QUEBRANDO O SITE
        },
    }
})