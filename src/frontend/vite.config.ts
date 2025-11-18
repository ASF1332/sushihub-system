import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Define a porta padrão para 5174
    strictPort: true, // Se a porta 5174 estiver ocupada, o Vite vai falhar em vez de tentar outra
  }
})