import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Carrega variáveis do arquivo .env (se existir)
    const env = loadEnv(mode, process.cwd(), '');

    // Tenta pegar a URL de 3 lugares diferentes (nessa ordem):
    // 1. Do sistema da Vercel (process.env)
    // 2. Do arquivo .env carregado (env)
    // 3. Se não achar nada, usa localhost (Fallback)
    const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:3001';

    // --- LOG PARA DEBUG NA VERCEL ---
    console.log("===========================================");
    console.log("🚀 BUILD VITE - DEFININDO URL DA API");
    console.log("👉 URL FINAL ESCOLHIDA:", apiUrl);
    console.log("===========================================");

    return {
        plugins: [react()],

        define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
        },

        server: {
            port: 5174,
            strictPort: true,
        },

        build: {
            chunkSizeWarningLimit: 1600,
        },
    }
})