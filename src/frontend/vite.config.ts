import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // --- AQUI ESTÁ A SOLUÇÃO DEFINITIVA ---
    // Estamos obrigando o sistema a usar o Render, não importa onde esteja.
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify('https://sushihub-system.onrender.com')
    },

    server: {
        port: 5174,
        strictPort: true,
    },

    build: {
        chunkSizeWarningLimit: 1600,
    },
})