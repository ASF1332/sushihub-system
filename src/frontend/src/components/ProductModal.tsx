import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
    Divider,
    Autocomplete,
    MenuItem
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import type { NewProductData } from '../pages/ProductsPage';

// Interfaces locais
interface Insumo { id: number; nome: string; unidade: string; }
interface FichaTecnicaItem { insumoId: number; quantidade: number; medida: string; }
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: FichaTecnicaItem[]; }

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (product: NewProductData | Produto) => void;
    productToEdit?: Produto | null;
    existingCategories?: string[];
}

const emptyProduct: NewProductData = { nome: '', preco: 0, categoria: '', fichaTecnica: [] };

export function ProductModal({ open, onClose, onSave, productToEdit, existingCategories = [] }: ProductModalProps) {
    const [productData, setProductData] = useState<NewProductData | Produto>(emptyProduct);
    const [insumosList, setInsumosList] = useState<Insumo[]>([]);

    const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
    const [qtdInsumo, setQtdInsumo] = useState<string>('');
    const [tempUnit, setTempUnit] = useState<string>('');

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

        setSelectedInsumo(null);
        setQtdInsumo('');
        setTempUnit('');
    }, [productToEdit, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setProductData(prev => ({
            ...prev,
            [name!]: name === 'preco' ? Number(value) : value
        }));
    };

    const handleAddInsumo = () => {
        // Adicionei a verificação !tempUnit para garantir que tenha unidade
        if (!selectedInsumo || !qtdInsumo || !tempUnit) return;

        const newItem: FichaTecnicaItem = {
            insumoId: selectedInsumo.id,
            quantidade: Number(qtdInsumo),
            unidade: tempUnit // Salva a unidade selecionada no modal
        };

        setProductData(prev => ({
            ...prev,
            fichaTecnica: [...prev.fichaTecnica, newItem]
        }));

        setSelectedInsumo(null);
        setQtdInsumo('');
        setTempUnit('');
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
            {/* 1. Tag <form> envolvendo todo o conteúdo do diálogo */}
            <form onSubmit={(e) => {
                e.preventDefault();
                onSave(productData);
            }}>
                <DialogTitle>
                    {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>

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
                        <Autocomplete
                            freeSolo
                            options={existingCategories}
                            value={productData.categoria}
                            onInputChange={(_event, newValue) => {
                                setProductData(prev => ({ ...prev, categoria: newValue }));
                            }}
                            fullWidth
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Categoria (ex: Temakis, Combos)"
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: 'off',
                                    }}
                                />
                            )}
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
                                {item.quantidade} {item.unidade || getInsumoUnidade(item.insumoId)}
                            </Typography>
                            <IconButton onClick={() => handleRemoveInsumo(item.insumoId)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>

                        <Autocomplete
                            options={insumosList}
                            getOptionLabel={(option) => `${option.nome}`}
                            value={selectedInsumo}
                            onChange={(_event, newValue) => {
                                setSelectedInsumo(newValue);
                            }}
                            componentsProps={{
                                popper: {
                                    modifiers: [{ name: 'flip', enabled: false }]
                                }
                            }}
                            fullWidth
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Selecionar Insumo..."
                                    placeholder="Digite para pesquisar"
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: 'off',
                                    }}
                                />
                            )}
                        />

                        <TextField
                            label="Qtd"
                            type="number"
                            size="small"
                            sx={{ width: '100px' }}
                            value={qtdInsumo}
                            onChange={e => setQtdInsumo(e.target.value)}
                        />

                        <TextField
                            select
                            label="Unid"
                            size="small"
                            sx={{ width: '100px' }}
                            value={tempUnit}
                            onChange={(e) => setTempUnit(e.target.value)}
                        >
                            {['un', 'kg', 'g', 'L', 'ml'].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="contained"
                            onClick={handleAddInsumo}
                            startIcon={<AddCircleIcon />}
                            disabled={!selectedInsumo || !qtdInsumo}
                        >
                            Adicionar
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    {/* 2. Botão principal agora é do tipo "submit" */}
                    <Button type="submit" variant="contained" color="primary">
                        Salvar Produto
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}