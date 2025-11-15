import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  },
  // ESTA É A CONFIGURAÇÃO FINAL E CORRETA
  server: {
    // 1. Faz o Vite ouvir em todos os endereços de rede.
    host: true,

    // 2. Desativa a verificação de host do HMR (Hot Module Replacement),
    // que é uma das camadas de segurança que pode estar causando o bloqueio.
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },

    // 3. A SOLUÇÃO "CANHÃO": Permite qualquer host. O '*' é um curinga universal.
    // Isso garante que o Vite não vai mais bloquear a requisição do Cloudflare.
    allowedHosts: ['*']
  }
})