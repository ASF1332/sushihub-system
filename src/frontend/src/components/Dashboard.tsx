import { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { KpiCards } from './KpiCards';
import { SalesByChannelChart } from './SalesByChannelChart';
import { SalesByHourChart } from './SalesByHourChart';

interface Pedido {
    id: number;
    cliente: string;
    canal: string;
    status: string;
    valor: number;
}

export function Dashboard() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ALTERAÇÃO: Trocamos o endereço fixo pela variável de ambiente
        fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`)
            .then(response => response.json())
            .then(data => setPedidos(data))
            .catch(err => {
                console.error("Falha ao conectar com a API:", err);
                setError("Não foi possível carregar os pedidos. O servidor backend está rodando?");
            });
    }, []);

    if (error) {
        return <Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>;
    }

    return (
        <Box sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Visão geral do seu negócio de sushi
            </Typography>

            <Box sx={{ my: 4 }}>
                <KpiCards />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                    <SalesByChannelChart />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '67%' } }}>
                    <SalesByHourChart />
                </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
                Pedidos Recentes
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="tabela de pedidos">
                    <TableHead>
                        <TableRow>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Canal</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Valor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pedidos.map((pedido) => (
                            <TableRow key={pedido.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{pedido.cliente}</TableCell>
                                <TableCell>{pedido.canal}</TableCell>
                                <TableCell>{pedido.status}</TableCell>
                                <TableCell align="right">{pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}