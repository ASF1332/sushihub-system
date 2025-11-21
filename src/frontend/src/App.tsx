import { Box } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import { Outlet } from 'react-router-dom'; // Importe o Outlet

// A linha 'import { InsumosPage } from './pages/InsumosPage';' FOI REMOVIDA

function App() {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Outlet />
        </Box>
    );
}

export default App;