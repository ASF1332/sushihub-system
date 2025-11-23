import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    IconButton,
    Typography,
    Divider
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import type { NewProductData } from '../pages/ProductsPage';

// Interfaces locais
interface Insumo { id: number; nome: string; unidade: string; }
interface FichaTecnicaItem { insumoId: number; quantidade: number; }
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: FichaTecnicaItem[]; }

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (product: NewProductData | Produto) => void;
    productToEdit?: Produto | null;
}

const emptyProduct: NewProductData = { nome: '', preco: 0, categoria: '', fichaTecnica: [] };

export function ProductModal({ open, onClose, onSave, productToEdit }: ProductModalProps) {
    const [productData, setProductData] = useState<NewProductData | Produto>(emptyProduct);
    const [insumosList, setInsumosList] = useState<Insumo[]>([]);

    // Estado temporário para adicionar novo insumo na ficha técnica
    const [newInsumo, setNewInsumo] = useState<{ id: string | number; qtd: string }>({ id: '', qtd: '' });

    // Buscar lista de insumos ao abrir o modal
    useEffect(() => {
        if (open) {
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
                .then(res => res.json())
                .then(data => setInsumosList(data))
                .catch(err => console.error("Erro ao carregar insumos", err));
        }
    }, [open]);

    useEffect(() => {
        if (productToEdit) setProductData(productToEdit);
        else setProductData(emptyProduct);
    }, [productToEdit, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setProductData(prev => ({
            ...prev,
            // CORREÇÃO: Se for preço, converte para número
            [name!]: name === 'preco' ? Number(value) : value
        }));
    };

    const handleAddInsumo = () => {
        if (!newInsumo.id || !newInsumo.qtd) return;

        const newItem: FichaTecnicaItem = {
            insumoId: Number(newInsumo.id),
            quantidade: Number(newInsumo.qtd)
        };

        setProductData(prev => ({
            ...prev,
            fichaTecnica: [...prev.fichaTecnica, newItem]
        }));

        // Limpa os campos de adição
        setNewInsumo({ id: '', qtd: '' });
    };

    const handleRemoveInsumo = (insumoIdToRemove: number) => {
        setProductData(prev => ({
            ...prev,
            fichaTecnica: prev.fichaTecnica.filter(item => item.insumoId !== insumoIdToRemove)
        }));
    };

    const getInsumoName = (id: number) => insumosList.find(i => i.id === id)?.nome || 'Desconhecido';
    const getInsumoUnidade = (id: number) => insumosList.find(i => i.id === id)?.unidade || '';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField
                    autoFocus
                    name="nome"
                    label="Nome do Produto"
                    fullWidth
                    value={productData.nome}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        name="categoria"
                        label="Categoria (ex: Temakis, Combos)"
                        fullWidth
                        value={productData.categoria}
                        onChange={handleChange}
                    />
                    <TextField
                        name="preco"
                        label="Preço (R$)"
                        type="number"
                        fullWidth
                        value={productData.preco}
                        onChange={handleChange}
                    />
                </Box>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">FICHA TÉCNICA (BAIXA DE ESTOQUE)</Typography>
                </Divider>

                {/* Lista de Insumos Adicionados */}
                {productData.fichaTecnica.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        Nenhum insumo vinculado. O estoque não será baixado ao vender este produto.
                    </Typography>
                )}

                {productData.fichaTecnica.map(item => (
                    <Box key={item.insumoId} sx={{ display: 'flex', alignItems: 'center', mt: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                        <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            {getInsumoName(item.insumoId)}
                        </Typography>
                        <Typography sx={{ mr: 2 }}>
                            {item.quantidade} {getInsumoUnidade(item.insumoId)}
                        </Typography>
                        <IconButton onClick={() => handleRemoveInsumo(item.insumoId)} color="error" size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                {/* Adicionar Novo Insumo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Selecionar Insumo</InputLabel>
                        <Select
                            value={newInsumo.id}
                            onChange={e => setNewInsumo(p => ({ ...p, id: e.target.value }))}
                            label="Selecionar Insumo"
                        >
                            {insumosList.map(insumo => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {insumo.nome} ({insumo.unidade})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Qtd"
                        type="number"
                        size="small"
                        sx={{ width: '100px' }}
                        value={newInsumo.qtd}
                        onChange={e => setNewInsumo(p => ({ ...p, qtd: e.target.value }))}
                    />

                    <Button
                        variant="contained"
                        onClick={handleAddInsumo}
                        startIcon={<AddCircleIcon />}
                        disabled={!newInsumo.id || !newInsumo.qtd}
                    >
                        Adicionar
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSave(productData)} variant="contained" color="primary">
                    Salvar Produto
                </Button>
            </DialogActions>
        </Dialog>
    );
}