import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Button, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        vendasHoje: 0,
        pedidosHoje: 0,
        estoqueBaixo: 0,
        itensCriticos: [] as any[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Busca Pedidos para calcular vendas de HOJE
                const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`);
                const pedidos = await resPedidos.json();

                // Filtra pedidos de hoje e que não foram cancelados
                const hoje = new Date().toLocaleDateString('pt-BR');
                const pedidosHoje = pedidos.filter((p: any) =>
                    new Date(p.dataHora).toLocaleDateString('pt-BR') === hoje &&
                    p.status !== 'Cancelado'
                );

                const totalVendas = pedidosHoje.reduce((acc: number, curr: any) => acc + curr.valor, 0);

                // 2. Busca Insumos para ver alertas de estoque
                const resInsumos = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
                const insumos = await resInsumos.json();

                // Filtra itens onde o estoque atual é menor ou igual ao mínimo
                const criticos = insumos.filter((i: any) => i.estoque <= i.estoqueMinimo);

                setStats({
                    vendasHoje: totalVendas,
                    pedidosHoje: pedidosHoje.length,
                    estoqueBaixo: criticos.length,
                    itensCriticos: criticos.slice(0, 5) // Pega apenas os top 5 para mostrar na lista
                });

            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Visão Geral do Dia
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card Vendas Hoje */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderLeft: '6px solid #2e7d32' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Faturamento (Hoje)</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats.vendasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card Pedidos Hoje */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderLeft: '6px solid #1976d2' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Pedidos (Hoje)</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats.pedidosHoje}
                                </Typography>
                                <ShoppingBagIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card Alertas Estoque */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderLeft: '6px solid #d32f2f', cursor: 'pointer' }} onClick={() => navigate('/insumos')}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Estoque Baixo</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" fontWeight="bold" color={stats.estoqueBaixo > 0 ? 'error' : 'textPrimary'}>
                                    {stats.estoqueBaixo} itens
                                </Typography>
                                <WarningIcon sx={{ fontSize: 40, color: '#d32f2f', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Seção de Detalhes */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                ⚠️ Itens Precisando de Reposição
                            </Typography>
                            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/insumos')}>
                                Ver Estoque
                            </Button>
                        </Box>

                        {stats.itensCriticos.length === 0 ? (
                            <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                                Tudo certo! Nenhum item crítico.
                            </Typography>
                        ) : (
                            <List>
                                {stats.itensCriticos.map((item) => (
                                    <ListItem key={item.id} divider>
                                        <ListItemIcon>
                                            <WarningIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.nome}
                                            secondary={`Estoque Atual: ${item.estoque} ${item.unidade} (Mín: ${item.estoqueMinimo})`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Acesso Rápido</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button variant="contained" size="large" onClick={() => navigate('/pedidos')}>
                                Novo Pedido
                            </Button>
                            <Button variant="outlined" size="large" onClick={() => navigate('/clientes')}>
                                Cadastrar Cliente
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}