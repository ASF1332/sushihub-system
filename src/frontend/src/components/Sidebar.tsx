import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import { Link, useLocation } from 'react-router-dom'; // Importe o Link e o hook useLocation

// Atualizamos nosso array de itens para incluir o "path" (caminho da URL)
const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Produtos', icon: <RestaurantMenuIcon />, path: '/produtos' },
    { text: 'Insumos', icon: <InventoryIcon />, path: '/insumos' },
    { text: 'Pedidos', icon: <ReceiptLongIcon />, path: '/pedidos' },
    { text: 'Financeiro', icon: <PaidIcon />, path: '/financeiro' },
];

export function Sidebar() {
    const location = useLocation(); // Este hook nos dá a URL atual

    return (
        <Box
            sx={{
                width: 240,
                height: '100vh',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                // ADICIONADO: Faz a sidebar "grudar" no topo da tela
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start', // Garante o alinhamento correto
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" component="h1">
                    Takashi Sushi
                </Typography>
            </Box>
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <List>
                {menuItems.map((item) => {
                    // Verificamos se o caminho do item corresponde à localização atual
                    const isActive = location.pathname === item.path;

                    return (
                        // O componente Link do react-router-dom envolve nosso botão
                        <Link to={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        // Aplicamos o estilo de fundo vermelho se o item estiver ativo
                                        backgroundColor: isActive ? '#ef4444' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: isActive ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'white' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    );
                })}
            </List>
        </Box>
    );
}