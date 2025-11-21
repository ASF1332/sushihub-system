import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert, LinearProgress, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { InsumoModal } from '../components/InsumoModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useLocation } from 'react-router-dom';

interface Insumo { id: number; nome: string; categoria: string; unidade?: string; estoque?: number; estoqueMinimo?: number; }
type InsumoData = Omit<Insumo, 'id'>;

export function InsumosPage() {
    const location = useLocation();
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; insumoId: number | null }>({ open: false, insumoId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    // --- NOVO: Estado para saber qual item deve piscar ---
    const [highlightedInsumoId, setHighlightedInsumoId] = useState<number | null>(null);

    const fetchInsumos = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
            .then(res => res.json()).then(setInsumos).catch(() => setError('Falha ao carregar insumos.'));
    };
    useEffect(() => { fetchInsumos(); }, []);

    // --- NOVO: Efeito para limpar o destaque após 3 segundos e rolar até o item ---
    useEffect(() => {
        if (highlightedInsumoId && selectedCategory) {
            // 1. Rola a tela até o item
            setTimeout(() => {
                const element = document.getElementById(`insumo-row-${highlightedInsumoId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100); // Pequeno delay para garantir que a tabela renderizou

            // 2. Remove o efeito de piscar depois de 3 segundos
            const timer = setTimeout(() => {
                setHighlightedInsumoId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedInsumoId, selectedCategory]);

    useEffect(() => {
        // Sempre que a localização mudar (alguém clicou em Insumos no menu),
        // limpamos a categoria selecionada para voltar aos cards.
        setSelectedCategory(null);
    }, [location]);

    // --- LÓGICA DE DADOS ---
    const insumosPorCategoria = useMemo(() => insumos.reduce((acc, insumo) => {
        (acc[insumo.categoria] = acc[insumo.categoria] || []).push(insumo);
        return acc;
    }, {} as Record<string, Insumo[]>), [insumos]);

    const filteredInsumos = useMemo(() => selectedCategory ? insumos.filter(i => i.categoria === selectedCategory) : [], [insumos, selectedCategory]);

    // --- CÁLCULOS DO DASHBOARD ---
    const itensEmAlerta = useMemo(() => {
        return insumos.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5));
    }, [insumos]);

    const totalItens = insumos.length;
    const totalAlerta = itensEmAlerta.length;
    const percentualSaude = totalItens > 0 ? ((totalItens - totalAlerta) / totalItens) * 100 : 100;

    // --- FUNÇÕES DE AÇÃO ---
    const handleNew = () => { setEditingInsumo(null); setIsModalOpen(true); };
    const handleEdit = (insumo: Insumo) => { setEditingInsumo(insumo); setIsModalOpen(true); };
    const handleDelete = (id: number) => setDeleteConfirm({ open: true, insumoId: id });

    // --- NOVO: Atualizamos a função para receber o ID do item ---
    const handleNavigateToItem = (categoria: string, id: number) => {
        setSelectedCategory(categoria);
        setHighlightedInsumoId(id); // Ativa o destaque
    };

    const confirmDelete = () => {
        if (deleteConfirm.insumoId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${deleteConfirm.insumoId}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error();
                    setInsumos(prev => prev.filter(i => i.id !== deleteConfirm.insumoId));
                    setSnackbar({ open: true, message: 'Insumo excluído com sucesso!', severity: 'success' });
                })
                .catch(() => setSnackbar({ open: true, message: 'Erro ao excluir insumo.', severity: 'error' }))
                .finally(() => setDeleteConfirm({ open: false, insumoId: null }));
        }
    };

    const handleSave = (insumoData: InsumoData | Insumo) => {
        const isEditing = 'id' in insumoData;
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/api/insumos/${insumoData.id}` : `${import.meta.env.VITE_API_URL}/api/insumos`;
        const method = isEditing ? 'PUT' : 'POST';

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(insumoData) })
            .then(res => res.json())
            .then(savedInsumo => {
                if (isEditing) {
                    setInsumos(prev => prev.map(i => i.id === savedInsumo.id ? savedInsumo : i));
                } else {
                    setInsumos(prev => [...prev, savedInsumo]);
                }
                setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Insumo salvo com sucesso!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao salvar insumo.', severity: 'error' }));
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                {selectedCategory && (
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>Voltar</Button>
                )}
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    {selectedCategory ? selectedCategory : 'Gestão de Insumos'}
                </Typography>
                <Button variant="contained" color="primary" onClick={handleNew}>Novo Insumo</Button>
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {!selectedCategory ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {Object.entries(insumosPorCategoria).map(([categoria, itens]) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={categoria}>
                                <Paper elevation={3} onClick={() => setSelectedCategory(categoria)} sx={{ p: 2, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
                                    <Typography variant="h6" align="left">{categoria.toUpperCase()}</Typography>
                                    <Typography color="text.primary" fontWeight="bold" align="right">{itens.length} {itens.length > 1 ? 'itens' : 'item'}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" /> Painel de Alertas e Reposição
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Card de Saúde do Estoque */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>Saúde do Estoque</Typography>

                                {/* Barra de Progresso */}
                                <Box sx={{ width: '100%', mb: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentualSaude}
                                        color={percentualSaude > 80 ? "success" : percentualSaude > 50 ? "warning" : "error"}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </Box>

                                {/* PORCENTAGENS (Esquerda: OK, Direita: Crítico) */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        {Math.round(percentualSaude)}% OK
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        {Math.round(100 - percentualSaude)}% Crítico
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    {totalAlerta === 0 ? "Estoque perfeito! Nada a repor." : `${totalAlerta} itens precisam de atenção imediata.`}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="error.main">Itens com Estoque Crítico</Typography>
                                {itensEmAlerta.length > 0 ? (
                                    <TableContainer sx={{ maxHeight: 300 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Insumo</TableCell>
                                                    <TableCell>Categoria</TableCell>
                                                    <TableCell align="right">Atual</TableCell>
                                                    <TableCell align="right">Mínimo</TableCell>
                                                    <TableCell align="right">A Comprar</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {itensEmAlerta.map((item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        hover
                                                        // --- NOVO: Passamos o ID também ---
                                                        onClick={() => handleNavigateToItem(item.categoria, item.id)}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 'bold' }}>{item.nome}</TableCell>
                                                        <TableCell><Chip label={item.categoria} size="small" /></TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{item.estoque}</TableCell>
                                                        <TableCell align="right">{item.estoqueMinimo || 5}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                            {((item.estoqueMinimo || 5) - (item.estoque || 0))} {item.unidade}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography>Tudo certo! Nenhum item abaixo do mínimo.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead><TableRow><TableCell>Nome do Insumo</TableCell><TableCell align="right">Estoque Atual</TableCell><TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Estoque Mínimo</TableCell><TableCell align="right">Unidade</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
                            <TableBody>
                                {filteredInsumos.map((insumo) => {
                                    const minimo = insumo.estoqueMinimo || 5;
                                    const estoqueBaixo = (insumo.estoque || 0) < minimo;

                                    // --- NOVO: Verifica se este é o item destacado ---
                                    const isHighlighted = insumo.id === highlightedInsumoId;

                                    return (
                                        <TableRow
                                            key={insumo.id}
                                            id={`insumo-row-${insumo.id}`} // <-- ID para o scroll automático
                                            sx={{
                                                // --- A MÁGICA DA ANIMAÇÃO ---
                                                backgroundColor: isHighlighted ? 'rgba(25, 118, 210, 0.2)' : 'inherit',
                                                transition: 'background-color 0.5s ease',
                                                animation: isHighlighted ? 'pulse 1s infinite' : 'none',
                                                '@keyframes pulse': {
                                                    '0%': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                                    '50%': { backgroundColor: 'rgba(25, 118, 210, 0.3)' },
                                                    '100%': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                                }
                                            }}
                                        >
                                            <TableCell>{insumo.nome}</TableCell>
                                            <TableCell align="right" sx={{ color: estoqueBaixo ? 'error.main' : '#4caf50', fontWeight: 'bold' }}>{insumo.estoque}</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 'bold' }}>{insumo.estoqueMinimo || '-'}</TableCell>
                                            <TableCell align="right">{insumo.unidade}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" color="secondary" onClick={() => handleEdit(insumo)}><EditIcon /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(insumo.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <InsumoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} insumoToEdit={editingInsumo} />
            <ConfirmationDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, insumoId: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja excluir este insumo?" />
            {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
        </Box>
    );
}