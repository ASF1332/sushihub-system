import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from './components/Dashboard.tsx';
import { ClientsPage } from './pages/ClientsPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';

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
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)