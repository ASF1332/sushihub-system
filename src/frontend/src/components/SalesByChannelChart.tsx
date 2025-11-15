import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'iFood', value: 216.00 },
    { name: 'WhatsApp', value: 78.00 },
    { name: 'OlaClick', value: 150.00 },
];

const COLORS = ['#ef4444', '#22c55e', '#3b82f6'];

export function SalesByChannelChart() {
    return (
        <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
                Vendas por Canal
            </Typography>
            <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {/* Corrigimos o 'entry' não utilizado para '_' */}
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}