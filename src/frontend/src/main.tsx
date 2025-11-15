import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressRechartsWarning } from './utils/suppressWarnings.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importe os componentes que serão nossas páginas
import { Dashboard } from './components/Dashboard.tsx';
import { ClientsPage } from './pages/ClientsPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
// Crie as regras de roteamento
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />, // O App é o layout principal (com a sidebar)
        children: [
            {
                index: true, // A rota raiz (path: '/') vai renderizar o Dashboard
                element: <Dashboard />,
            },
            {
                path: 'clientes', // A rota '/clientes' vai renderizar a ClientsPage
                element: <ClientsPage />,
            },
            // NOVO: Adicione a rota para a página de produtos
            {
                path: 'produtos',
                element: <ProductsPage />,
            },
        ],
    },
]);

suppressRechartsWarning();

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        // Agora, em vez de renderizar o <App />, renderizamos o <RouterProvider />
        <RouterProvider router={router} />
    );
}