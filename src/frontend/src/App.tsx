import { Box } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import { Outlet } from 'react-router-dom'; // Importe o Outlet

function App() {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            {/*
        O Outlet é um placeholder.
        O react-router-dom vai renderizar o componente da rota atual aqui.
        Se a URL for '/', ele renderiza o <Dashboard />.
        Se a URL for '/clientes', ele renderiza a <ClientsPage />.
      */}
            <Outlet />
        </Box>
    );
}

export default App;