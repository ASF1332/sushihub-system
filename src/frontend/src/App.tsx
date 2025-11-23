import { Box } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import { Outlet } from 'react-router-dom';

function App() {
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar Fixa */}
            <Sidebar />

            {/* O Outlet é onde as páginas (Insumos, Financeiro, etc) serão renderizadas */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default App;