import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Carrega variáveis do arquivo .env (usado no seu PC)
    const env = loadEnv(mode, process.cwd(), '');

    // LÓGICA NOVA E MAIS SEGURA:
    // 1. Tenta pegar do arquivo .env (No seu PC, vai pegar localhost:3001)
    // 2. Tenta pegar do sistema da Vercel
    // 3. Se não achar NADA, usa o link do Render (Segurança para não dar erro no celular)

    const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL || 'https://sushihub-system.onrender.com';

    console.log("===========================================");
    console.log("🚀 BUILD VITE - URL DEFINIDA:", apiUrl);
    console.log("===========================================");

    return {
        plugins: [react()],

        // Ensina o Vite a buscar o .env na raiz do projeto
        envDir: '../../',

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