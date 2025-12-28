import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

export interface Cliente {
    id: number;
    nome: string;
    telefone: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    complemento?: string;
}

export type NewClientData = Omit<Cliente, 'id'>;

interface ClientModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (client: NewClientData | Cliente) => void;
    clientToEdit?: Cliente | null;
}

const emptyClient: NewClientData = {
    nome: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: ''
};

export function ClientModal({ open, onClose, onSave, clientToEdit }: ClientModalProps) {
    const [clientData, setClientData] = useState<NewClientData | Cliente>(emptyClient);
    // 1. NOVO: Estado para erros de validação
    const [errors, setErrors] = useState<{ nome?: string; telefone?: string }>({});

    useEffect(() => {
        if (clientToEdit) {
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
        // Limpa erros ao abrir/fechar
        setErrors({});
    }, [clientToEdit, open]);

    // 2. NOVO: Função de Máscara de Telefone
    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '') // Remove tudo que não é dígito
            .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses no DDD
            .replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen antes dos últimos 4 dígitos
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Limpa o erro do campo que está sendo digitado
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        if (name === 'cep') {
            setClientData(prev => ({
                ...prev,
                cep: value,
                logradouro: '',
                bairro: '',
                cidade: '',
                estado: '',
            }));
        } else if (name === 'telefone') {
            // Aplica a máscara no telefone
            setClientData(prev => ({ ...prev, [name]: formatPhone(value) }));
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
            setClientData(prev => ({
                ...prev,
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    // 3. ALTERADO: Validação antes de salvar
    const handleSave = () => {
        const newErrors: { nome?: string; telefone?: string } = {};

        if (!clientData.nome.trim()) {
            newErrors.nome = "O nome é obrigatório.";
        }
        if (!clientData.telefone.trim()) {
            newErrors.telefone = "O telefone é obrigatório.";
        } else if (clientData.telefone.length < 14) {
            // Validação simples para garantir que o número está completo (ex: (11) 99999-9999)
            newErrors.telefone = "Telefone inválido.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // Para a execução aqui se houver erros
        }

        onSave(clientData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <TextField
                    autoFocus
                    name="nome"
                    label="Nome Completo"
                    fullWidth
                    value={clientData.nome}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    // Adiciona feedback visual de erro
                    error={!!errors.nome}
                    helperText={errors.nome}
                />
                <TextField
                    name="telefone"
                    label="Telefone"
                    fullWidth
                    value={clientData.telefone}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    // Adiciona feedback visual de erro
                    error={!!errors.telefone}
                    helperText={errors.telefone}
                    inputProps={{ maxLength: 15 }} // Limita tamanho da máscara
                />

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <TextField name="cep" label="CEP" value={clientData.cep} onChange={handleChange} onBlur={handleCepBlur} />
                    <TextField name="logradouro" label="Logradouro" value={clientData.logradouro} onChange={handleChange} />
                    <TextField name="numero" label="Número" value={clientData.numero} onChange={handleChange} />
                    <TextField name="bairro" label="Bairro" value={clientData.bairro} onChange={handleChange} />
                    <TextField name="cidade" label="Cidade" value={clientData.cidade} onChange={handleChange} />
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