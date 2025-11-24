import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClientModal } from '../components/ClientModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { Cliente, NewClientData } from '../components/ClientModal';

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
        // ALTERAÇÃO 1: Trocamos o endereço fixo pela variável de ambiente
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
        return clientes.filter(cliente => {
            // PROTEÇÃO: Se vier nulo do banco, usa string vazia ''
            const nome = cliente.nome || '';
            const telefone = cliente.telefone || '';
            const termo = searchTerm.toLowerCase();

            // Busca por nome OU telefone
            return nome.toLowerCase().includes(termo) ||
                telefone.includes(termo);
        });
    }, [clientes, searchTerm]);

    const handleDelete = (id: number) => {
        setDeleteConfirm({ open: true, clientId: id });
    };

    const confirmDelete = () => {
        if (deleteConfirm.clientId) {
            // ALTERAÇÃO 2: Trocamos o endereço fixo pela variável de ambiente
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
        // ALTERAÇÃO 3: Trocamos o endereço fixo pela variável de ambiente
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

    const handleSnackbarClose = () => {
        setSnackbar(null);
    };

    return (
        <Box sx={{ p: 3, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>Gestão de Clientes</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>Novo Cliente</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            {error && <Typography color="error">{error}</Typography>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Telefone</TableCell>
                                    <TableCell>Endereço Principal</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredClientes.map((cliente) => (
                                    <TableRow key={cliente.id}>
                                        <TableCell>{cliente.nome}</TableCell>
                                        <TableCell>{cliente.telefone}</TableCell>
                                        <TableCell>{`${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}`}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="secondary" onClick={() => handleEdit(cliente)}><EditIcon /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(cliente.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
}