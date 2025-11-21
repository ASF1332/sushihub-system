import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

// Interface completa do Insumo
interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade?: 'kg' | 'g' | 'L' | 'ml' | 'un';
    estoque?: number;
}
type InsumoData = Omit<Insumo, 'id'>;

interface InsumoModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (insumo: InsumoData | Insumo) => void;
    insumoToEdit?: Insumo | null; // <-- NOVO: Prop para receber o insumo a ser editado
}

const emptyInsumo: InsumoData = { nome: '', estoque: 0, unidade: 'g', categoria: 'Insumos' };

export function InsumoModal({ open, onClose, onSave, insumoToEdit }: InsumoModalProps) {
    const [insumoData, setInsumoData] = useState<InsumoData | Insumo>(emptyInsumo);

    // Efeito para preencher o formulário quando estiver editando
    useEffect(() => {
        if (insumoToEdit) {
            setInsumoData(insumoToEdit);
        } else {
            setInsumoData(emptyInsumo);
        }
    }, [insumoToEdit, open]);

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setInsumoData(prev => ({ ...prev, [name!]: value }));
    };

    const handleSaveClick = () => {
        onSave(insumoData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* Título dinâmico */}
            <DialogTitle>{insumoToEdit ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField autoFocus name="nome" label="Nome do Insumo" fullWidth value={insumoData.nome} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField name="estoque" label="Estoque" type="number" fullWidth value={insumoData.estoque || ''} onChange={handleChange} sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Unidade</InputLabel>
                    <Select name="unidade" value={insumoData.unidade || ''} onChange={handleChange} label="Unidade">
                        <MenuItem value="g">Gramas (g)</MenuItem>
                        <MenuItem value="kg">Quilogramas (kg)</MenuItem>
                        <MenuItem value="ml">Mililitros (ml)</MenuItem>
                        <MenuItem value="L">Litros (L)</MenuItem>
                        <MenuItem value="un">Unidade (un)</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select name="categoria" value={insumoData.categoria} onChange={handleChange} label="Categoria">
                        <MenuItem value="Cozinha">Cozinha</MenuItem>
                        <MenuItem value="Embalagens">Embalagens</MenuItem>
                        <MenuItem value="Insumos">Insumos</MenuItem>
                        <MenuItem value="Hortifruti">Hortifruti</MenuItem>
                        <MenuItem value="Bebidas">Bebidas</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSaveClick} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
}