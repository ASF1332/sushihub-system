import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Select, MenuItem, InputLabel, FormControl, IconButton, Typography, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';


interface Insumo { id: number; nome: string; unidade: string; }
interface FichaTecnicaItem { insumoId: number; quantidade: number; }
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: FichaTecnicaItem[]; }
type NewProductData = Omit<Produto, 'id'>;

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
    const [newInsumo, setNewInsumo] = useState<{ id: string | number; qtd: string }>({ id: '', qtd: '' });

    useEffect(() => {
        if (open) {
            // ALTERAÇÃO: Trocamos o endereço fixo pela variável de ambiente
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
                .then(res => res.json())
                .then(data => setInsumosList(data));
        }
    }, [open]);

    useEffect(() => {
        if (productToEdit) setProductData(productToEdit);
        else setProductData(emptyProduct);
    }, [productToEdit, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setProductData(prev => ({ ...prev, [name!]: value }));
    };

    const handleAddInsumo = () => {
        if (!newInsumo.id || !newInsumo.qtd) return;
        const newItem: FichaTecnicaItem = { insumoId: Number(newInsumo.id), quantidade: Number(newInsumo.qtd) };
        setProductData(prev => ({ ...prev, fichaTecnica: [...prev.fichaTecnica, newItem] }));
        setNewInsumo({ id: '', qtd: '' });
    };

    const handleRemoveInsumo = (insumoIdToRemove: number) => {
        setProductData(prev => ({
            ...prev,
            fichaTecnica: prev.fichaTecnica.filter(item => item.insumoId !== insumoIdToRemove)
        }));
    };

    const getInsumoName = (id: number) => insumosList.find(i => i.id === id)?.nome || 'Insumo não encontrado';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField autoFocus name="nome" label="Nome do Produto" fullWidth value={productData.nome} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField name="categoria" label="Categoria" fullWidth value={productData.categoria} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField name="preco" label="Preço (R$)" type="number" fullWidth value={productData.preco} onChange={handleChange} sx={{ mb: 2 }} />

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Ficha Técnica</Typography>

                {productData.fichaTecnica.map(item => (
                    <Box key={item.insumoId} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography sx={{ flexGrow: 1 }}>{getInsumoName(item.insumoId)}: {item.quantidade}{insumosList.find(i => i.id === item.insumoId)?.unidade}</Typography>
                        <IconButton onClick={() => handleRemoveInsumo(item.insumoId)} color="error"><DeleteIcon /></IconButton>
                    </Box>
                ))}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Insumo</InputLabel>
                        <Select value={newInsumo.id} onChange={e => setNewInsumo(p => ({ ...p, id: e.target.value }))} label="Insumo">
                            {insumosList.map(insumo => <MenuItem key={insumo.id} value={insumo.id}>{insumo.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Quantidade" type="number" value={newInsumo.qtd} onChange={e => setNewInsumo(p => ({ ...p, qtd: e.target.value }))} />
                    <IconButton onClick={handleAddInsumo} color="primary"><AddCircleIcon /></IconButton>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSave(productData)} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
}