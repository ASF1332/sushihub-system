import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { hour: '18h', pedidos: 5 },
    { hour: '19h', pedidos: 12 },
    { hour: '20h', pedidos: 25 },
    { hour: '21h', pedidos: 18 },
    { hour: '22h', pedidos: 9 },
];

export function SalesByHourChart() {
    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                Pedidos por Hora
            </Typography>
            <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pedidos" fill="#8884d8" name="Nº de Pedidos" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}