import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Select, MenuItem, InputLabel, FormControl, IconButton, Typography, List, ListItem, ListItemText, Autocomplete } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces
interface Produto { id: number; nome: string; preco: number; }
interface Cliente { id: number; nome: string; telefone: string; } // Nova interface para Clientes
interface ItemPedido { produtoId: number; quantidade: number; nomeProduto: string; precoUnitario: number; }

interface PedidoModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (pedido: any) => void;
}

export function PedidoModal({ open, onClose, onSave }: PedidoModalProps) {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]); // Estado para guardar a lista de clientes

    // Dados do Pedido
    const [clienteNome, setClienteNome] = useState(''); // Guarda o nome (digitado ou selecionado)
    const [telefone, setTelefone] = useState('');
    const [canal, setCanal] = useState('Local');
    const [itens, setItens] = useState<ItemPedido[]>([]);

    // Dados do Item sendo adicionado
    const [selectedProdId, setSelectedProdId] = useState<string>('');
    const [quantidade, setQuantidade] = useState(1);

    // Busca dados ao abrir
    useEffect(() => {
        if (open) {
            // Busca Produtos
            fetch(`${import.meta.env.VITE_API_URL}/api/produtos`)
                .then(res => res.json())
                .then(setProdutos);

            // Busca Clientes (NOVO)
            fetch(`${import.meta.env.VITE_API_URL}/api/clientes`)
                .then(res => res.json())
                .then(setClientes);

            // Resetar formulário
            setClienteNome('');
            setTelefone('');
            setCanal('Local');
            setItens([]);
            setSelectedProdId('');
            setQuantidade(1);
        }
    }, [open]);

    // Função inteligente ao selecionar cliente
    const handleClienteChange = (_event: any, newValue: Cliente | string | null) => {
        if (typeof newValue === 'string') {
            // Se digitou um nome novo
            setClienteNome(newValue);
            setTelefone('');
        } else if (newValue && typeof newValue === 'object') {
            // Se selecionou da lista
            setClienteNome(newValue.nome);
            setTelefone(newValue.telefone); // <-- PREENCHE O TELEFONE AUTOMATICAMENTE
        } else {
            setClienteNome('');
            setTelefone('');
        }
    };

    const handleAddItem = () => {
        const produto = produtos.find(p => p.id === Number(selectedProdId));
        if (produto) {
            const novoItem: ItemPedido = {
                produtoId: produto.id,
                nomeProduto: produto.nome,
                quantidade: Number(quantidade),
                precoUnitario: produto.preco
            };
            // Adiciona o novo item à lista existente
            setItens(prevItens => [...prevItens, novoItem]);

            // Reseta os campos de seleção de produto
            setSelectedProdId('');
            setQuantidade(1);
        }
    };

    const handleRemoveItem = (index: number) => {
        const novosItens = [...itens];
        novosItens.splice(index, 1);
        setItens(novosItens);
    };

    // Recalcula o total sempre que a lista de itens mudar
    const valorTotal = itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);

    const handleSave = () => {
        const pedidoPayload = {
            cliente: clienteNome,
            telefone,
            canal,
            valor: valorTotal,
            itens: itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, nomeProduto: i.nomeProduto }))
        };
        onSave(pedidoPayload);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Novo Pedido</DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {/* CAMPO DE BUSCA DE CLIENTE INTELIGENTE */}
                    <Autocomplete
                        freeSolo // Permite digitar um nome que não está na lista
                        options={clientes}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.nome}
                        value={clienteNome}
                        onChange={handleClienteChange}
                        onInputChange={(_, newInputValue) => setClienteNome(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="Cliente (Busca)" fullWidth />}
                        sx={{ flexGrow: 1 }}
                    />

                    <TextField
                        label="Telefone"
                        value={telefone}
                        onChange={e => setTelefone(e.target.value)}
                        sx={{ width: '200px' }}
                    />

                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Canal</InputLabel>
                        <Select value={canal} label="Canal" onChange={(e) => setCanal(e.target.value)}>
                            <MenuItem value="Local">Balcão</MenuItem>
                            <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                            <MenuItem value="Telefone">Telefone</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>Adicionar Produtos</Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1, mb: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Produto</InputLabel>
                        <Select
                            value={selectedProdId}
                            label="Produto"
                            onChange={(e) => setSelectedProdId(e.target.value)}
                        >
                            {produtos.map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.nome} - R$ {p.preco.toFixed(2)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Qtd"
                        type="number"
                        sx={{ width: 100 }}
                        value={quantidade}
                        onChange={e => setQuantidade(Number(e.target.value))}
                    />
                    {/* O Botão + só habilita se tiver um produto selecionado */}
                    <IconButton
                        color="primary"
                        onClick={handleAddItem}
                        disabled={!selectedProdId}
                    >
                        <AddCircleIcon fontSize="large" />
                    </IconButton>
                </Box>

                <List dense sx={{ bgcolor: 'background.paper', border: '1px solid #eee', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    {itens.map((item, index) => (
                        <ListItem key={index} secondaryAction={
                            <IconButton edge="end" color="error" onClick={() => handleRemoveItem(index)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText
                                primary={`${item.quantidade}x ${item.nomeProduto}`}
                                secondary={`R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}`}
                            />
                        </ListItem>
                    ))}
                    {itens.length === 0 && <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>Nenhum item adicionado</Typography>}
                </List>

                <Typography variant="h5" sx={{ mt: 2, textAlign: 'right', fontWeight: 'bold', color: 'primary.main' }}>
                    Total: R$ {valorTotal.toFixed(2)}
                </Typography>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                {/* O Botão Criar só habilita se tiver Cliente E pelo menos 1 item */}
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={itens.length === 0 || !clienteNome}
                >
                    Criar Pedido
                </Button>
            </DialogActions>
        </Dialog>
    );
}