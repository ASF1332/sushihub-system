import { useEffect, useState, useMemo } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip, useTheme, CircularProgress
} from '@mui/material';
import { AttachMoney, TrendingUp, Receipt } from '@mui/icons-material';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Interface igual à da página de Pedidos
interface Pedido {
    id: number;
    cliente: string;
    canal: string;
    status: string;
    valor: number;
    dataHora: string;
}

export default function Financeiro() {
    const theme = useTheme();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    // --- AQUI ESTÁ A MÁGICA: Busca os dados reais do Banco de Dados ---
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`)
            .then(res => res.json())
            .then(data => {
                setPedidos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const dadosFinanceiros = useMemo(() => {
        // 1. Filtra cancelados para não somar no faturamento
        const ativos = pedidos.filter(p => p.status !== 'Cancelado');

        // 2. KPIs (Indicadores)
        const faturamentoTotal = ativos.reduce((acc, curr) => acc + curr.valor, 0);
        const qtdPedidos = ativos.length;
        const ticketMedio = qtdPedidos > 0 ? faturamentoTotal / qtdPedidos : 0;

        // 3. Gráfico Pizza (Vendas por Canal)
        const porCanal = ativos.reduce((acc, curr) => {
            acc[curr.canal] = (acc[curr.canal] || 0) + curr.valor;
            return acc;
        }, {} as Record<string, number>);

        const dataPizza = Object.keys(porCanal).map(canal => ({
            name: canal,
            value: porCanal[canal]
        }));

        // 4. Gráfico Barras (Últimos 7 pedidos para visualização)
        const dataBarras = ativos.slice(0, 7).map(p => ({
            name: `Ped #${p.id}`,
            valor: p.valor
        })).reverse(); // Inverte para mostrar cronologicamente

        return { faturamentoTotal, ticketMedio, qtdPedidos, dataPizza, dataBarras, ultimosPedidos: pedidos.slice(0, 10) };
    }, [pedidos]);

    const COLORS = ['#EA1D2C', '#25D366', '#FF9800', '#1976d2']; // Cores: iFood, Whats, OlaClick, Local

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Financeiro</Typography>

            {/* KPIs - Cards do Topo */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography color="textSecondary" variant="subtitle2">Faturamento Total</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                    {formatCurrency(dadosFinanceiros.faturamentoTotal)}
                                </Typography>
                            </Box>
                            <AttachMoney sx={{ fontSize: 40, color: '#2e7d32' }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography color="textSecondary" variant="subtitle2">Ticket Médio</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                                    {formatCurrency(dadosFinanceiros.ticketMedio)}
                                </Typography>
                            </Box>
                            <TrendingUp sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography color="textSecondary" variant="subtitle2">Pedidos Realizados</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                    {dadosFinanceiros.qtdPedidos}
                                </Typography>
                            </Box>
                            <Receipt sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gráfico de Barras */}
                <Grid item xs={12} md={8}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Vendas Recentes</Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer>
                                    <BarChart data={dadosFinanceiros.dataBarras}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                        <Bar dataKey="valor" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Gráfico de Pizza */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Por Canal</Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={dadosFinanceiros.dataPizza} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {dadosFinanceiros.dataPizza.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                        <Legend verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabela de Histórico */}
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Histórico de Pedidos</Typography>
                    <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Canal</TableCell>
                                    <TableCell>Valor</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dadosFinanceiros.ultimosPedidos.map((pedido) => (
                                    <TableRow key={pedido.id} hover>
                                        <TableCell>#{pedido.id}</TableCell>
                                        <TableCell>{new Date(pedido.dataHora).toLocaleDateString('pt-BR')} {new Date(pedido.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</TableCell>
                                        <TableCell>{pedido.cliente}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={pedido.canal}
                                                size="small"
                                                sx={{ bgcolor: pedido.canal === 'iFood' ? '#ffebee' : '#e3f2fd', color: '#333' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(pedido.valor)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={pedido.status}
                                                color={pedido.status === 'Cancelado' ? 'error' : 'success'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}