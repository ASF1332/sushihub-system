import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174, // Define a porta padrão para 5174
        strictPort: true, // Se a porta 5174 estiver ocupada, o Vite vai falhar em vez de tentar outra
    },
    // --- CONFIGURAÇÃO DE OTIMIZAÇÃO DE BUILD ---
    build: {
        // Aumenta o limite do aviso para 1000kb (1MB) para evitar alertas desnecessários
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Função manual para separar as bibliotecas pesadas
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // 1. Separa o Material UI (que é pesado) em um arquivo 'mui.js'
                        if (id.includes('@mui')) {
                            return 'mui';
                        }
                        // 2. Separa o React e o Router em um arquivo 'react-vendor.js'
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'react-vendor';
                        }
                        // 3. Separa bibliotecas de gráficos (se houver) em 'charts.js'
                        if (id.includes('recharts') || id.includes('chart.js')) {
                            return 'charts';
                        }
                        // O restante fica no arquivo padrão
                    }
                },
            },
        },
    },
})