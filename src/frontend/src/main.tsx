import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dashboard } from './components/Dashboard.tsx';
import { ClientsPage } from './pages/ClientsPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { InsumosPage } from './pages/InsumosPage.tsx';

const customTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#c62828', // Vermelho
        },
        secondary: {
            main: '#1976d2', // Um azul padrão do Material UI
        },
        background: {
            default: '#f4f5f7',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666',
        },
    },
    components: {
        // 4. AQUI ESTÁ A MÁGICA: Sobrescrevemos a cor da Sidebar
        MuiDrawer: { // O componente Sidebar do MUI é um Drawer
            styleOverrides: {
                paper: {
                    backgroundColor: '#1a1a1a', // Cor de fundo escura
                    color: '#f5f5f5', // Cor do texto clara
                }
            }
        }
    }
});

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'clientes',
                element: <ClientsPage />,
            },
            {
                path: 'produtos',
                element: <ProductsPage />,
            },
            {
                path: 'insumos',
                element: <InsumosPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={customTheme}>
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>,
)