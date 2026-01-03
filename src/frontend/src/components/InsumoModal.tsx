import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Autocomplete, // Importante para o campo inteligente
    MenuItem
} from '@mui/material';

interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade: string;
    estoque: number;
    estoqueMinimo: number;
    preco: number;
}

interface InsumoModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (insumo: Omit<Insumo, 'id'> | Insumo) => void;
    insumoToEdit?: Insumo | null;
    existingCategories?: string[]; // Recebe a lista de categorias
}

const emptyInsumo = {
    nome: '',
    categoria: '',
    unidade: 'un',
    estoque: 0,
    estoqueMinimo: 5,
    preco: 0
};

export function InsumoModal({ open, onClose, onSave, insumoToEdit, existingCategories = [] }: InsumoModalProps) {
    const [formData, setFormData] = useState<any>(emptyInsumo);

    useEffect(() => {
        if (open) {
            if (insumoToEdit) {
                // Se vier um insumo para editar (ou criar grupo com ID 0)
                setFormData(insumoToEdit);
            } else {
                // Se for novo do zero
                setFormData(emptyInsumo);
            }
        }
    }, [open, insumoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'estoque' || name === 'estoqueMinimo' || name === 'preco' ? Number(value) : value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    // Lógica para decidir o Título:
    // Se tem ID e o ID é diferente de 0, é Edição.
    // Se não tem ID ou o ID é 0, é Novo.
    const isEditing = formData.id && formData.id !== 0;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* Adicionamos o <form> e o onSubmit aqui */}
            <form onSubmit={(e) => {
                e.preventDefault(); // Impede o recarregamento da página
                handleSubmit();     // Chama a função de salvar
            }}>
                <DialogTitle>{isEditing ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>

                    <TextField
                        autoFocus
                        margin="dense"
                        name="nome"
                        label="Nome do Insumo"
                        fullWidth
                        variant="outlined"
                        value={formData.nome}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />

                    <Autocomplete
                        freeSolo
                        options={existingCategories}
                        value={formData.categoria}
                        onInputChange={(_event, newValue) => {
                            setFormData((prev: any) => ({ ...prev, categoria: newValue }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Categoria"
                                margin="dense"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            name="estoque"
                            label="Estoque Atual"
                            type="number"
                            fullWidth
                            value={formData.estoque}
                            onChange={handleChange}
                        />
                        <TextField
                            name="estoqueMinimo"
                            label="Estoque Mínimo"
                            type="number"
                            fullWidth
                            value={formData.estoqueMinimo}
                            onChange={handleChange}
                            helperText="Alerta quando baixar disso"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            select
                            name="unidade"
                            label="Unidade"
                            fullWidth
                            value={formData.unidade}
                            onChange={handleChange}
                        >
                            {['un', 'kg', 'g', 'L', 'ml'].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            name="preco"
                            label="Preço de Custo (R$)"
                            type="number"
                            fullWidth
                            value={formData.preco}
                            onChange={handleChange}
                        />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    {/* O botão agora é do tipo "submit" */}
                    <Button type="submit" variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}