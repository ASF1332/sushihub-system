import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TextField, CircularProgress, Snackbar, Alert, Chip, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { ClientModal } from '../components/ClientModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

// Definição da Interface (igual ao modal)
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

export function ClientsPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clientId: number | null }>({ open: false, clientId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/clientes`)
            .then(response => response.json())
            .then(data => setClientes(data))
            .catch(err => {
                console.error("Falha ao buscar clientes:", err);
                setError("Não foi possível carregar os clientes.");
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredClientes = useMemo(() => {
        if (!Array.isArray(clientes)) return [];
        return clientes.filter(cliente => {
            const nome = cliente.nome || '';
            const telefone = cliente.telefone || '';
            const termo = searchTerm.toLowerCase();
            return nome.toLowerCase().includes(termo) || telefone.includes(termo);
        });
    }, [clientes, searchTerm]);

    const handleDelete = (id: number) => {
        setDeleteConfirm({ open: true, clientId: id });
    };

    const confirmDelete = () => {
        if (deleteConfirm.clientId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/clientes/${deleteConfirm.clientId}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        setClientes(prev => prev.filter(c => c.id !== deleteConfirm.clientId));
                        setSnackbar({ open: true, message: 'Cliente excluído com sucesso!', severity: 'success' });
                    } else {
                        setError('Falha ao excluir cliente.');
                        setSnackbar({ open: true, message: 'Erro ao excluir cliente.', severity: 'error' });
                    }
                })
                .finally(() => setDeleteConfirm({ open: false, clientId: null }));
        }
    };

    const handleEdit = (cliente: Cliente) => {
        setEditingClient(cliente);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleSave = (clientData: NewClientData | Cliente) => {
        const isEditing = 'id' in clientData;
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/api/clientes/${clientData.id}` : `${import.meta.env.VITE_API_URL}/api/clientes`;
        const method = isEditing ? 'PUT' : 'POST';

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clientData) })
            .then(res => res.json())
            .then(savedClient => {
                if (isEditing) {
                    setClientes(prev => prev.map(c => c.id === savedClient.id ? savedClient : c));
                } else {
                    setClientes(prev => [...prev, savedClient]);
                }
                setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Cliente salvo com sucesso!', severity: 'success' });
            })
            .catch(err => {
                setError('Falha ao salvar cliente.');
                setSnackbar({ open: true, message: 'Erro ao salvar cliente.', severity: 'error' });
            });
    };

    return (
        <Box sx={{ p: 3, flexGrow: 1 }}>
            {/* CABEÇALHO COM TOTAL */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight="bold">Gestão de Clientes</Typography>
                    <Chip
                        icon={<PersonIcon />}
                        label={`${clientes.length} cadastrados`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
                    Novo Cliente
                </Button>
            </Box>

            {/* BARRA DE BUSCA */}
            <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {error && <Typography color="error">{error}</Typography>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }} elevation={2}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Endereço Principal</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredClientes.map((cliente) => (
                                    <TableRow key={cliente.id} hover>
                                        <TableCell>{cliente.nome}</TableCell>
                                        <TableCell>{cliente.telefone}</TableCell>
                                        <TableCell>{cliente.logradouro ? `${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}` : '-'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="secondary" onClick={() => handleEdit(cliente)}><EditIcon /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(cliente.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredClientes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            Nenhum cliente encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <ClientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} clientToEdit={editingClient} />
            <ConfirmationDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, clientId: null })}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
            />
            {snackbar && (
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
}