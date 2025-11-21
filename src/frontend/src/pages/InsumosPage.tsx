import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InsumoModal } from '../components/InsumoModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface Insumo { id: number; nome: string; categoria: string; unidade?: string; estoque?: number; }
type InsumoData = Omit<Insumo, 'id'>;

export function InsumosPage() {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; insumoId: number | null }>({ open: false, insumoId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    const fetchInsumos = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
            .then(res => res.json()).then(setInsumos).catch(() => setError('Falha ao carregar insumos.'));
    };
    useEffect(() => { fetchInsumos(); }, []);

    const insumosPorCategoria = useMemo(() => insumos.reduce((acc, insumo) => {
        (acc[insumo.categoria] = acc[insumo.categoria] || []).push(insumo);
        return acc;
    }, {} as Record<string, Insumo[]>), [insumos]);

    const filteredInsumos = useMemo(() => selectedCategory ? insumos.filter(i => i.categoria === selectedCategory) : [], [insumos, selectedCategory]);

    const handleNew = () => { setEditingInsumo(null); setIsModalOpen(true); };
    const handleEdit = (insumo: Insumo) => { setEditingInsumo(insumo); setIsModalOpen(true); };
    const handleDelete = (id: number) => setDeleteConfirm({ open: true, insumoId: id });

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

                {/* O botão de Voltar continua opcional */}
                {selectedCategory && (
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>
                        Voltar
                    </Button>
                )}

                {/* O título agora ocupa todo o espaço livre, empurrando o botão para a direita */}
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    {selectedCategory ? selectedCategory : 'Categorias de Insumos'}
                </Typography>

                {/* O botão Novo Insumo continua no final */}
                <Button variant="contained" color="primary" onClick={handleNew}>
                    Novo Insumo
                </Button>

            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {!selectedCategory ? (
                <Grid container spacing={3}>
                    {Object.entries(insumosPorCategoria).map(([categoria, itens]) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={categoria}>
                            <Paper elevation={3} onClick={() => setSelectedCategory(categoria)} sx={{ p: 2, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
                                <Typography variant="h6" align="left">{categoria.toUpperCase()}</Typography>
                                <Typography color="text.primary" fontWeight="bold" align="right">{itens.length} {itens.length > 1 ? 'itens' : 'item'}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead><TableRow><TableCell>Nome</TableCell><TableCell align="right">Estoque</TableCell><TableCell align="right">Unidade</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
                            <TableBody>
                                {filteredInsumos.map((insumo) => (
                                    <TableRow key={insumo.id}>
                                        <TableCell>{insumo.nome}</TableCell>
                                        <TableCell align="right">{insumo.estoque}</TableCell>
                                        <TableCell align="right">{insumo.unidade}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="secondary" onClick={() => handleEdit(insumo)}><EditIcon /></IconButton>

                                            <IconButton size="small" color="error" onClick={() => handleDelete(insumo.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
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