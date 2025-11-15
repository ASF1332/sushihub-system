import { Paper, Typography, Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Definimos os tipos das propriedades que o KpiCard recebe
interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

// Aplicamos os tipos à função
function KpiCard({ title, value, icon, color = 'text.primary' }: KpiCardProps) {
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                {icon}
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Typography component="p" variant="h4" sx={{ color }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
}

export function KpiCards() {
    const summaryData = {
        faturamento: 295.50,
        pedidos: 3,
        ticketMedio: 98.50,
        aConfirmar: 1,
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                },
            }}
        >
            <KpiCard
                title="Faturamento (Hoje)"
                value={summaryData.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                icon={<AttachMoneyIcon sx={{ color: 'green' }} />}
                color="green"
            />
            <KpiCard
                title="Total de Pedidos (Hoje)"
                value={summaryData.pedidos}
                icon={<ReceiptLongIcon sx={{ color: 'primary.main' }} />}
            />
            <KpiCard
                title="Ticket Médio"
                value={summaryData.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                icon={<PointOfSaleIcon sx={{ color: 'secondary.main' }} />}
            />
            <KpiCard
                title="Pedidos a Confirmar"
                value={summaryData.aConfirmar}
                icon={<NotificationsIcon sx={{ color: 'orange' }} />}
                color="orange"
            />
        </Box>
    );
}