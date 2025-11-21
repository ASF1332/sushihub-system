import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';

interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade?: 'kg' | 'g' | 'L' | 'ml' | 'un';
    estoque?: number;
    estoqueMinimo?: number; // <-- Novo campo
}
type InsumoData = Omit<Insumo, 'id'>;

interface InsumoModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (insumo: InsumoData | Insumo) => void;
    insumoToEdit?: Insumo | null;
}

const emptyInsumo: InsumoData = { nome: '', estoque: 0, estoqueMinimo: 5, unidade: 'un', categoria: 'Cozinha' };

export function InsumoModal({ open, onClose, onSave, insumoToEdit }: InsumoModalProps) {
    const [insumoData, setInsumoData] = useState<InsumoData | Insumo>(emptyInsumo);

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
            <DialogTitle>{insumoToEdit ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField autoFocus name="nome" label="Nome do Insumo" fullWidth value={insumoData.nome} onChange={handleChange} sx={{ mb: 2 }} />

                {/* Colocamos Estoque e Estoque Mínimo lado a lado */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField name="estoque" label="Estoque Atual" type="number" fullWidth value={insumoData.estoque || ''} onChange={handleChange} />
                    <TextField name="estoqueMinimo" label="Estoque Mínimo" type="number" fullWidth value={insumoData.estoqueMinimo || ''} onChange={handleChange} helperText="Avisa quando baixar disso" />
                </Box>

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