import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProductModal } from '../components/ProductModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface FichaTecnicaItem { insumoId: number; quantidade: number; }
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: FichaTecnicaItem[]; }
type NewProductData = Omit<Produto, 'id'>;

export function ProductsPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    useEffect(() => {
        setLoading(true);
        // ALTERAÇÃO 1: Trocamos o endereço fixo pela variável de ambiente
        fetch(`${import.meta.env.VITE_API_URL}/api/produtos`)
            .then(response => response.json())
            .then(data => setProdutos(data))
            .catch(() => setError("Não foi possível carregar os produtos."))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => {
        if (loading) return [];
        const productsByCategory = produtos.reduce((acc, product) => {
            if (!acc[product.categoria]) {
                acc[product.categoria] = 0;
            }
            acc[product.categoria]++;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(productsByCategory).map(([name, count]) => ({
            name,
            count,
        }));
    }, [produtos, loading]);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return [];
        return produtos.filter(p => p.categoria === selectedCategory);
    }, [produtos, selectedCategory]);

    const handleDelete = (id: number) => setDeleteConfirm({ open: true, productId: id });

    const confirmDelete = () => {
        if (deleteConfirm.productId) {
            // ALTERAÇÃO 2: Trocamos o endereço fixo pela variável de ambiente
            fetch(`${import.meta.env.VITE_API_URL}/api/produtos/${deleteConfirm.productId}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        setProdutos(prev => prev.filter(p => p.id !== deleteConfirm.productId));
                        setSnackbar({ open: true, message: 'Produto excluído com sucesso!', severity: 'success' });
                    } else {
                        setSnackbar({ open: true, message: 'Erro ao excluir produto.', severity: 'error' });
                    }
                })
                .finally(() => setDeleteConfirm({ open: false, productId: null }));
        }
    };

    const handleEdit = (produto: Produto) => {
        setEditingProduct(produto);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSave = (productData: NewProductData | Produto) => {
        const isEditing = 'id' in productData;
        // ALTERAÇÃO 3: Trocamos o endereço fixo pela variável de ambiente
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/api/produtos/${productData.id}` : `${import.meta.env.VITE_API_URL}/api/produtos`;
        const method = isEditing ? 'PUT' : 'POST';

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) })
            .then(res => res.json())
            .then(savedProduct => {
                if (isEditing) {
                    setProdutos(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                } else {
                    setProdutos(prev => [...prev, savedProduct]);
                }
                setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Produto salvo com sucesso!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao salvar produto.', severity: 'error' }));
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
    }

    return (
        <Box sx={{ p: 3, flexGrow: 1 }}>
            {selectedCategory ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>
                        Voltar para Categorias
                    </Button>
                    <Typography variant="h4" gutterBottom>{selectedCategory}</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
                        Novo Produto
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" gutterBottom>
                        Categorias de Produtos
                    </Typography>
                </Box>
            )}

            {!selectedCategory ? (
                <Box sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    mt: 4,
                }}>
                    {categories.map(category => (
                        <Paper
                            key={category.name}
                            onClick={() => setSelectedCategory(category.name)}
                            sx={{
                                p: 2,
                                cursor: 'pointer',
                                boxShadow: 3,
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6,
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '120px',
                            }}
                        >
                            <Typography variant="h6" align="left">{category.name}</Typography>
                            <Typography
                                color="text.primary"
                                fontWeight="bold"
                                align="right"
                            >
                                {category.count} {category.count > 1 ? 'produtos' : 'produto'}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome do Produto</TableCell>
                                    <TableCell>Preço</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProducts.map((produto) => (
                                    <TableRow key={produto.id}>
                                        <TableCell>{produto.nome}</TableCell>
                                        <TableCell>{produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" onClick={() => handleEdit(produto)}><EditIcon /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(produto.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <ProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} productToEdit={editingProduct} />
            <ConfirmationDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, productId: null })}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
            />
            {snackbar && (
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            )}
        </Box>
    );
}