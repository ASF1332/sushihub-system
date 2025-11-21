import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Chip, Button, IconButton } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FastfoodIcon from '@mui/icons-material/Fastfood'; // iFood icon fake
import StorefrontIcon from '@mui/icons-material/Storefront'; // OlaClick
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ItemPedido { produtoId: number; quantidade: number; nomeProduto?: string; }
interface Pedido {
    id: number;
    cliente: string;
    telefone?: string;
    canal: 'iFood' | 'WhatsApp' | 'OlaClick' | 'Local';
    status: 'Novo' | 'Em Preparo' | 'Saiu para Entrega' | 'Entregue' | 'Cancelado';
    valor: number;
    itens: ItemPedido[];
    dataHora: string;
}

export function PedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    const fetchPedidos = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`)
            .then(res => res.json())
            .then(setPedidos);
    };

    // Atualiza a cada 10 segundos automaticamente (Polling simples)
    useEffect(() => {
        fetchPedidos();
        const interval = setInterval(fetchPedidos, 10000);
        return () => clearInterval(interval);
    }, []);

    const atualizarStatus = (id: number, novoStatus: string) => {
        fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        }).then(() => fetchPedidos());
    };

    const getCanalIcon = (canal: string) => {
        switch (canal) {
            case 'iFood': return <FastfoodIcon color="error" />;
            case 'WhatsApp': return <WhatsAppIcon color="success" />;
            case 'OlaClick': return <StorefrontIcon color="warning" />;
            default: return <StorefrontIcon />;
        }
    };

    // Colunas do Kanban
    const colunas = [
        { titulo: 'NOVOS', status: 'Novo', cor: '#3b82f6' }, // Azul
        { titulo: 'EM PREPARO', status: 'Em Preparo', cor: '#f59e0b' }, // Laranja
        { titulo: 'EM ENTREGA', status: 'Saiu para Entrega', cor: '#8b5cf6' }, // Roxo
        { titulo: 'FINALIZADOS', status: 'Entregue', cor: '#10b981' } // Verde
    ];

    return (
        <Box sx={{ p: 3, height: '100%', overflowX: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Monitor de Pedidos (KDS)</Typography>

            <Grid container spacing={2} sx={{ minWidth: 1000 }}> {/* Garante largura para não espremer */}
                {colunas.map((coluna) => (
                    <Grid item xs={3} key={coluna.status}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                backgroundColor: '#f8f9fa',
                                height: '100%',
                                minHeight: '70vh',
                                borderTop: `6px solid ${coluna.cor}`
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                                {coluna.titulo} ({pedidos.filter(p => p.status === coluna.status).length})
                            </Typography>

                            {pedidos
                                .filter(p => p.status === coluna.status)
                                .map((pedido) => (
                                    <Card key={pedido.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Chip
                                                    icon={getCanalIcon(pedido.canal)}
                                                    label={pedido.canal}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    #{pedido.id}
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {pedido.cliente}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {new Date(pedido.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>

                                            <Box sx={{ my: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                {pedido.itens.map((item, idx) => (
                                                    <Typography key={idx} variant="body2">
                                                        • {item.quantidade}x {item.nomeProduto || `Prod ${item.produtoId}`}
                                                    </Typography>
                                                ))}
                                            </Box>

                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}>
                                                R$ {pedido.valor.toFixed(2)}
                                            </Typography>

                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                {pedido.status === 'Novo' && (
                                                    <Button size="small" variant="contained" color="warning" onClick={() => atualizarStatus(pedido.id, 'Em Preparo')}>
                                                        Aceitar
                                                    </Button>
                                                )}
                                                {pedido.status === 'Em Preparo' && (
                                                    <Button size="small" variant="contained" color="info" startIcon={<DeliveryDiningIcon />} onClick={() => atualizarStatus(pedido.id, 'Saiu para Entrega')}>
                                                        Enviar
                                                    </Button>
                                                )}
                                                {pedido.status === 'Saiu para Entrega' && (
                                                    <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => atualizarStatus(pedido.id, 'Entregue')}>
                                                        Concluir
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}