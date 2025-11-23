import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

// --- DEFINIÇÃO DOS TIPOS (Igual ao Banco de Dados) ---
export interface Cliente {
    id: number;
    nome: string;
    telefone: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string; // <--- O Banco espera 'estado', não 'uf'
    complemento?: string;
}

export type NewClientData = Omit<Cliente, 'id'>;

interface ClientModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (client: NewClientData | Cliente) => void;
    clientToEdit?: Cliente | null;
}

// Objeto inicial vazio
const emptyClient: NewClientData = {
    nome: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '', // <--- Corrigido aqui
    complemento: ''
};

export function ClientModal({ open, onClose, onSave, clientToEdit }: ClientModalProps) {
    const [clientData, setClientData] = useState<NewClientData | Cliente>(emptyClient);

    useEffect(() => {
        if (clientToEdit) {
            // Garante que se o banco trouxe null, converte para string vazia para não dar erro no input
            setClientData({
                ...clientToEdit,
                cep: clientToEdit.cep || '',
                logradouro: clientToEdit.logradouro || '',
                numero: clientToEdit.numero || '',
                bairro: clientToEdit.bairro || '',
                cidade: clientToEdit.cidade || '',
                estado: clientToEdit.estado || '',
                complemento: clientToEdit.complemento || ''
            });
        } else {
            setClientData(emptyClient);
        }
    }, [clientToEdit, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === 'cep') {
            // Se mudou o CEP, limpa os campos de endereço
            setClientData(prev => ({
                ...prev,
                cep: value,
                logradouro: '',
                bairro: '',
                cidade: '',
                estado: '', // <--- Corrigido
            }));
        } else {
            setClientData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
        const cep = event.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                console.error("CEP não encontrado");
                return;
            }

            // Mapeia o retorno do ViaCEP para o nosso padrão
            setClientData(prev => ({
                ...prev,
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf, // <--- O ViaCEP devolve 'uf', nós salvamos em 'estado'
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleSave = () => {
        onSave(clientData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField autoFocus name="nome" label="Nome Completo" fullWidth value={clientData.nome} onChange={handleChange} sx={{ mb: 2 }}/>
                <TextField name="telefone" label="Telefone" fullWidth value={clientData.telefone} onChange={handleChange} sx={{ mb: 2 }}/>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <TextField name="cep" label="CEP" value={clientData.cep} onChange={handleChange} onBlur={handleCepBlur} />
                    <TextField name="logradouro" label="Logradouro" value={clientData.logradouro} onChange={handleChange} />
                    <TextField name="numero" label="Número" value={clientData.numero} onChange={handleChange} />
                    <TextField name="bairro" label="Bairro" value={clientData.bairro} onChange={handleChange} />
                    <TextField name="cidade" label="Cidade" value={clientData.cidade} onChange={handleChange} />

                    {/* Campo Estado corrigido */}
                    <TextField name="estado" label="Estado (UF)" value={clientData.estado} onChange={handleChange} />

                    <TextField name="complemento" label="Complemento (Opcional)" value={clientData.complemento || ''} onChange={handleChange} sx={{ gridColumn: '1 / -1' }} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
}