import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, CircularProgress, Snackbar, Alert, Chip, TextField, InputAdornment,
    Collapse, Autocomplete, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'; // Ícone para Novo Grupo
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloseIcon from '@mui/icons-material/Close';
import { ProductModal } from '../components/ProductModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useLocation } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// --- TIPOS ---
interface Insumo { id: number; nome: string; unidade: string; preco: number; }
interface FichaTecnicaItem { insumoId: number; quantidade: number; }
interface Produto {
    id: number;
    nome: string;
    preco: number;
    precoPromocional?: number | null;
    categoria: string;
    fichaTecnica: FichaTecnicaItem[];
}
export type NewProductData = Omit<Produto, 'id'>;

// --- FUNÇÃO DE CÁLCULO INTELIGENTE ---
const calculateSmartCost = (preco: number, quantidade: number, unidade: string) => {
    const unit = unidade?.toLowerCase() || '';
    if (unit === 'g' || unit === 'ml') {
        return (preco * quantidade) / 1000;
    }
    return preco * quantidade;
};

// --- COMPONENTE DE CÉLULA EDITÁVEL ---
const EditableCell = ({
                          value,
                          isEditing,
                          onDoubleClick,
                          onSave,
                          onCancel,
                          type = 'text',
                          align = 'left',
                          options = [],
                          sx = {}
                      }: any) => {
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setTempValue(value); }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSave(tempValue);
        else if (e.key === 'Escape') {
            onCancel();
            setTempValue(value);
        }
    };

    if (!isEditing) {
        return (
            <TableCell
                align={align}
                onDoubleClick={onDoubleClick}
                sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    height: '40px',
                    // Aqui aplicamos a animação de pulsar o fundo
                    '&:hover': {
                        animation: 'pulseCell 1.5s infinite ease-in-out'
                    },
                    ...sx
                }}
            >
                {value}
            </TableCell>
        );
    }

    if (options.length > 0) {
        return (
            <TableCell align={align} sx={{ p: 0, height: '40px' }}>
                <Select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => onSave(tempValue)}
                    autoFocus
                    defaultOpen
                    fullWidth
                    variant="standard"
                    sx={{ height: '100%', '& .MuiSelect-select': { paddingLeft: '16px', paddingRight: '16px' } }}
                >
                    {options.map((opt: string) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
            </TableCell>
        );
    }

    return (
        <TableCell align={align} sx={{ p: 0, height: '40px' }}>
            <TextField
                inputRef={inputRef}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => onSave(tempValue)}
                onKeyDown={handleKeyDown}
                type={type}
                variant="standard"
                fullWidth
                sx={{
                    height: '100%',
                    '& .MuiInputBase-root': { height: '100%', fontSize: '0.875rem', paddingLeft: align === 'right' ? 0 : '16px', paddingRight: align === 'right' ? '16px' : 0 },
                    '& .MuiInput-input': { padding: '0 !important', height: '100%' }
                }}
                inputProps={{ style: { textAlign: align === 'right' ? 'right' : 'left' } }}
            />
        </TableCell>
    );
};

// --- COMPONENTE DA LINHA EXPANSÍVEL (ProductRow) ---
function ProductRow({ row, allInsumos, onUpdateProduct, onUpdateInsumoGlobal, onDelete, showValues }: {
    row: Produto,
    allInsumos: Insumo[],
    onUpdateProduct: (p: Produto) => void,
    onUpdateInsumoGlobal: (id: number, data: Partial<Insumo>) => void,
    onEdit: (p: Produto) => void,
    onDelete: (id: number) => void
    showValues: boolean
}) {
    const [open, setOpen] = useState(false);
    const [selectedInsumoId, setSelectedInsumoId] = useState<number | ''>('');
    const [qtdInsumo, setQtdInsumo] = useState<string>('');
    const [tempUnit, setTempUnit] = useState<string>('');

    // Controle de edição (Insumos e Desconto)
    const [editingCell, setEditingCell] = useState<{ type: 'insumo' | 'produto', id: number, field: string } | null>(null);

    // --- CÁLCULOS FINANCEIROS (CUSTOS) ---
    const custoTotalProducao = row.fichaTecnica.reduce((acc, item) => {
        const insumo = allInsumos.find(i => i.id === item.insumoId);
        if (!insumo) return acc;
        return acc + calculateSmartCost(insumo.preco || 0, item.quantidade, insumo.unidade);
    }, 0);

    // --- CÁLCULOS DE DESCONTO ---
    const valorDesconto = row.precoPromocional ? (row.preco - row.precoPromocional) : 0;
    const porcentagemDesconto = row.preco > 0 ? (valorDesconto / row.preco) * 100 : 0;
    const precoFinal = row.precoPromocional || row.preco;
    const lucroBruto = precoFinal - custoTotalProducao;
    const margemLucro = precoFinal > 0 ? (lucroBruto / precoFinal) * 100 : 0;

    // --- AÇÕES ---
    const handleAddInsumo = () => {
        if (!selectedInsumoId || !qtdInsumo) return;

        const insumoOriginal = allInsumos.find(i => i.id === selectedInsumoId);
        if (insumoOriginal && tempUnit && tempUnit !== insumoOriginal.unidade) {
            onUpdateInsumoGlobal(Number(selectedInsumoId), { unidade: tempUnit });
        }

        const novaFicha = [...row.fichaTecnica, { insumoId: Number(selectedInsumoId), quantidade: Number(qtdInsumo) }];
        onUpdateProduct({ ...row, fichaTecnica: novaFicha });

        setSelectedInsumoId('');
        setQtdInsumo('');
        setTempUnit('');
    };

    const handleKeyDownAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAddInsumo();
    };

    const handleRemoveInsumo = (insumoIdToRemove: number) => {
        const novaFicha = row.fichaTecnica.filter(item => item.insumoId !== insumoIdToRemove);
        onUpdateProduct({ ...row, fichaTecnica: novaFicha });
    };

    // Salvar Insumos (Tabela Interna)
    const handleInsumoSave = (insumoId: number, field: string, value: any) => {
        setEditingCell(null);
        if (field === 'quantidade') {
            const novaFicha = row.fichaTecnica.map(item =>
                item.insumoId === insumoId ? { ...item, quantidade: Number(value) } : item
            );
            onUpdateProduct({ ...row, fichaTecnica: novaFicha });
        }
        else if (field === 'preco' || field === 'unidade') {
            const insumoAtual = allInsumos.find(i => i.id === insumoId);
            if (insumoAtual) {
                const dadosAtualizados: Partial<Insumo> = {};
                if (field === 'preco') dadosAtualizados.preco = Number(value);
                if (field === 'unidade') dadosAtualizados.unidade = value;
                onUpdateInsumoGlobal(insumoId, dadosAtualizados);
            }
        }
    };

    // Salvar Desconto (Tabela Principal)
    const handleDiscountSave = (value: any) => {
        setEditingCell(null);
        const descontoDigitado = Number(value);

        if (descontoDigitado <= 0) {
            onUpdateProduct({ ...row, precoPromocional: null });
        } else {
            const novoPrecoPromocional = row.preco - descontoDigitado;
            onUpdateProduct({ ...row, precoPromocional: novoPrecoPromocional });
        }
    };

    const handleMainProductSave = (field: string, value: any) => {
        setEditingCell(null);
        const updatedProduct = { ...row };

        if (field === 'nome') {
            updatedProduct.nome = value;
        } else if (field === 'preco') {
            // Remove "R$", espaços e troca vírgula por ponto para salvar no banco
            const cleanValue = String(value).replace('R$', '').replace(/\s/g, '').replace(',', '.');
            const novoPreco = Number(cleanValue);

            if (!isNaN(novoPreco)) {
                updatedProduct.preco = novoPreco;
            }
        }
        onUpdateProduct(updatedProduct);
    };

    return (
        <>
        <style>
            {`
                @keyframes floatCard {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulseCell {
                    0% { background-color: rgba(0, 0, 0, 0.02); }
                    50% { background-color: rgba(0, 0, 0, 0.12); } 
                    100% { background-color: rgba(0, 0, 0, 0.02); }
                }
                `}
        </style>

            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* --- COLUNA NOME EDITÁVEL --- */}
                <EditableCell
                    value={row.nome}
                    isEditing={editingCell?.type === 'produto' && editingCell?.id === row.id && editingCell?.field === 'nome'}
                    onDoubleClick={() => setEditingCell({ type: 'produto', id: row.id, field: 'nome' })}
                    onSave={(val: any) => handleMainProductSave('nome', val)}
                    onCancel={() => setEditingCell(null)}
                />

                {/* --- COLUNA PREÇO EDITÁVEL --- */}
                <EditableCell
                    value={showValues ? row.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ -----'}
                    isEditing={editingCell?.type === 'produto' && editingCell?.id === row.id && editingCell?.field === 'preco'}
                    onDoubleClick={() => showValues && setEditingCell({ type: 'produto', id: row.id, field: 'preco' })}
                    onSave={(val: any) => handleMainProductSave('preco', val)}
                    onCancel={() => setEditingCell(null)}
                />

                <EditableCell
                    value={showValues ? (valorDesconto > 0 ? valorDesconto.toFixed(2) : '0.00') : '-----'}
                    type="number"
                    align="right"
                    sx={{ color: valorDesconto > 0 ? 'error.main' : 'text.secondary', fontWeight: 'bold' }}
                    isEditing={editingCell?.type === 'produto' && editingCell?.id === row.id && editingCell?.field === 'desconto'}
                    onDoubleClick={() => showValues && setEditingCell({ type: 'produto', id: row.id, field: 'desconto' })}
                    onSave={handleDiscountSave}
                    onCancel={() => setEditingCell(null)}
                />

                <TableCell align="right" sx={{ color: porcentagemDesconto > 0 ? 'error.main' : 'text.secondary' }}>
                    {porcentagemDesconto > 0 ? `-${porcentagemDesconto.toFixed(1)}%` : '-'}
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {showValues
                        ? precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ -----'}
                </TableCell>

                <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => onDelete(row.id)}><DeleteIcon /></IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, backgroundColor: '#f9f9f9', p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                Ficha Técnica & Custos
                            </Typography>

                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ingrediente</TableCell>
                                        <TableCell align="right">Quantidade</TableCell>
                                        <TableCell align="right">Unidade</TableCell>
                                        <TableCell align="right">Custo Unit.</TableCell>
                                        <TableCell align="right">Custo Total</TableCell>
                                        <TableCell align="right">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.fichaTecnica.map((fichaItem, index) => {
                                        const insumoReal = allInsumos.find(i => i.id === fichaItem.insumoId);
                                        const custoTotalItem = calculateSmartCost(
                                            insumoReal?.preco || 0,
                                            fichaItem.quantidade,
                                            insumoReal?.unidade || ''
                                        );

                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{insumoReal?.nome || `Insumo #${fichaItem.insumoId}`}</TableCell>

                                                <EditableCell
                                                    value={fichaItem.quantidade}
                                                    type="number"
                                                    align="right"
                                                    isEditing={editingCell?.type === 'insumo' && editingCell?.id === fichaItem.insumoId && editingCell?.field === 'quantidade'}
                                                    onDoubleClick={() => setEditingCell({ type: 'insumo', id: fichaItem.insumoId, field: 'quantidade' })}
                                                    onSave={(val: any) => handleInsumoSave(fichaItem.insumoId, 'quantidade', val)}
                                                    onCancel={() => setEditingCell(null)}
                                                />

                                                <EditableCell
                                                    value={insumoReal?.unidade || ''}
                                                    align="right"
                                                    options={['un', 'kg', 'g', 'L', 'ml']}
                                                    isEditing={editingCell?.type === 'insumo' && editingCell?.id === fichaItem.insumoId && editingCell?.field === 'unidade'}
                                                    onDoubleClick={() => setEditingCell({ type: 'insumo', id: fichaItem.insumoId, field: 'unidade' })}
                                                    onSave={(val: any) => handleInsumoSave(fichaItem.insumoId, 'unidade', val)}
                                                    onCancel={() => setEditingCell(null)}
                                                />

                                                <EditableCell
                                                    value={insumoReal?.preco ? `R$ ${insumoReal.preco.toFixed(2)}` : 'R$ 0.00'}
                                                    type="number"
                                                    align="right"
                                                    sx={{ fontWeight: 'bold', color: '#1976d2' }}
                                                    isEditing={editingCell?.type === 'insumo' && editingCell?.id === fichaItem.insumoId && editingCell?.field === 'preco'}
                                                    onDoubleClick={() => setEditingCell({ type: 'insumo', id: fichaItem.insumoId, field: 'preco' })}
                                                    onSave={(val: any) => handleInsumoSave(fichaItem.insumoId, 'preco', val)}
                                                    onCancel={() => setEditingCell(null)}
                                                />

                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#555' }}>
                                                    {custoTotalItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <IconButton size="small" color="error" onClick={() => handleRemoveInsumo(fichaItem.insumoId)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {row.fichaTecnica.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">Nenhum ingrediente cadastrado.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Resumo Financeiro */}
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Preço Final (Venda)</Typography>
                                    <Typography variant="h6" color="primary">
                                        {precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Custo de Produção</Typography>
                                    <Typography variant="h6" color="error">
                                        {custoTotalProducao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Lucro Bruto</Typography>
                                    <Typography variant="h6" sx={{ color: lucroBruto >= 0 ? 'success.main' : 'error.main' }}>
                                        {lucroBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Margem</Typography>
                                    <Chip
                                        label={`${margemLucro.toFixed(1)}%`}
                                        color={margemLucro > 30 ? 'success' : margemLucro > 0 ? 'warning' : 'error'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            {/* Área de Adição */}
                            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', borderTop: '1px dashed #ccc', pt: 2 }}>
                                <Autocomplete
                                    size="small"
                                    sx={{ width: 300 }}
                                    options={allInsumos}
                                    getOptionLabel={(option) => option.nome}
                                    value={allInsumos.find(i => i.id === selectedInsumoId) || null}
                                    onChange={(_event, newValue) => {
                                        setSelectedInsumoId(newValue ? newValue.id : '');
                                        setTempUnit(newValue ? newValue.unidade : '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Adicionar Ingrediente..." placeholder="Digite para buscar" />
                                    )}
                                />
                                <TextField
                                    label="Qtd"
                                    size="small"
                                    type="number"
                                    sx={{ width: 100 }}
                                    value={qtdInsumo}
                                    onChange={(e) => setQtdInsumo(e.target.value)}
                                    onKeyDown={handleKeyDownAdd}
                                />
                                <TextField
                                    select
                                    label="Unid"
                                    size="small"
                                    sx={{ width: 100 }}
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
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddInsumo}
                                    disabled={!selectedInsumoId || !qtdInsumo}
                                >
                                    Adicionar
                                </Button>
                                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Total Insumos
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {custoTotalProducao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

// --- PÁGINA PRINCIPAL ---
export function ProductsPage() {
    const location = useLocation();
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ open: boolean; categoryName: string | null }>({ open: false, categoryName: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
    const [showValues, setShowValues] = useState(() => {
        const saved = localStorage.getItem('sushihub_showValues');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('sushihub_showValues', JSON.stringify(showValues));
    }, [showValues]);

    // --- ESTADOS PARA NOVO GRUPO ---
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`http://localhost:3001/api/produtos`).then(res => res.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos`).then(res => res.json())
        ])
            .then(([produtosData, insumosData]) => {
                setProdutos(produtosData);
                setInsumos(insumosData);
            })
            .catch(() => setError("Erro ao carregar dados."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setSelectedCategory(null);
        setSearchTerm('');
    }, [location]);

    const handleUpdateInsumoGlobal = (id: number, data: Partial<Insumo>) => {
        const insumoAntigo = insumos.find(i => i.id === id);
        if (!insumoAntigo) return;
        const insumoAtualizado = { ...insumoAntigo, ...data };

        fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumoAtualizado)
        })
            .then(res => res.json())
            .then(savedInsumo => {
                setInsumos(prev => prev.map(i => i.id === savedInsumo.id ? savedInsumo : i));
                setSnackbar({ open: true, message: 'Insumo atualizado globalmente!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao atualizar insumo.', severity: 'error' }));
    };

    const categories = useMemo(() => {
        if (loading) return [];
        if (!Array.isArray(produtos)) return [];

        // Agora guardamos CONTAGEM e VALOR
        const statsByCategory = produtos.reduce((acc, product) => {
            const cat = product.categoria;
            if (!cat || cat.trim() === '') return acc;

            if (!acc[cat]) {
                acc[cat] = { count: 0, value: 0 };
            }

            acc[cat].count++;
            acc[cat].value += product.preco; // Soma o preço
            return acc;
        }, {} as Record<string, { count: number; value: number }>);

        return Object.entries(statsByCategory).map(([name, data]) => ({
            name,
            count: data.count,
            value: data.value // Retorna o valor somado
        }));
    }, [produtos, loading]);

    const totalMenuValue = useMemo(() => {
        // --- PROTEÇÃO: Se produtos não for uma lista, o total é 0 ---
        if (!Array.isArray(produtos)) return 0;

        return produtos.reduce((acc, curr) => acc + curr.preco, 0);
    }, [produtos]);

    const filteredProducts = useMemo(() => {
        if (searchTerm) {
            return produtos.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory) {
            return produtos.filter(p => p.categoria === selectedCategory);
        }
        return [];
    }, [produtos, selectedCategory, searchTerm]);

    const totalFilteredValue = useMemo(() => {
        return filteredProducts.reduce((acc, curr) => acc + curr.preco, 0);
    }, [filteredProducts]);

    const handleDelete = (id: number) => setDeleteConfirm({ open: true, productId: id });

    const confirmDelete = () => {
        if (deleteConfirm.productId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/produtos/${deleteConfirm.productId}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        setProdutos(prev => prev.filter(p => p.id !== deleteConfirm.productId));
                        setSnackbar({ open: true, message: 'Produto excluído!', severity: 'success' });
                    } else {
                        setSnackbar({ open: true, message: 'Erro ao excluir.', severity: 'error' });
                    }
                })
                .finally(() => setDeleteConfirm({ open: false, productId: null }));
        }
    };

    const handleDeleteCategoryClick = (categoryName: string) => {
        setDeleteCategoryConfirm({ open: true, categoryName });
    };

    const confirmDeleteCategory = async () => {
        const categoryName = deleteCategoryConfirm.categoryName;
        if (!categoryName) return;

        // 1. Filtra produtos da categoria
        const productsToDelete = produtos.filter(p => p.categoria === categoryName);

        try {
            // 2. Apaga um por um no banco
            await Promise.all(productsToDelete.map(product =>
                fetch(`${import.meta.env.VITE_API_URL}/api/produtos/${product.id}`, { method: 'DELETE' })
            ));

            // 3. Atualiza a tela
            setProdutos(prev => prev.filter(p => p.categoria !== categoryName));
            setSnackbar({ open: true, message: `Grupo "${categoryName}" excluído!`, severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'Erro ao excluir grupo.', severity: 'error' });
        } finally {
            setDeleteCategoryConfirm({ open: false, categoryName: null });
        }
    };

    const handleEdit = (produto: Produto) => { setEditingProduct(produto); setIsModalOpen(true); };

    // --- LÓGICA DO BOTÃO NOVO PRODUTO ---
    const handleNewProduct = () => {
        setEditingProduct(null); // Abre modal vazio
        setIsModalOpen(true);
    };

    // --- LÓGICA DO BOTÃO NOVO GRUPO ---
    const handleNewGroupClick = () => {
        setNewGroupName('');
        setIsGroupDialogOpen(true);
    };

    const handleConfirmNewGroup = () => {
        if (!newGroupName.trim()) {
            setSnackbar({ open: true, message: 'Digite um nome para o grupo.', severity: 'error' });
            return;
        }
        setIsGroupDialogOpen(false);
        // Truque: Cria um "Produto Modelo" com ID 0, mas com a categoria preenchida
        // O Modal vai abrir e o usuário só precisa preencher o nome e preço do primeiro item
        setEditingProduct({
            id: 0,
            nome: '',
            preco: 0,
            categoria: newGroupName,
            fichaTecnica: []
        });
        setIsModalOpen(true);
    };

    const handleSaveProduct = (productData: NewProductData | Produto) => {
        // VALIDAÇÃO IMPORTANTE: Impede salvar sem nome ou categoria
        if (!productData.nome || !productData.categoria) {
            setSnackbar({ open: true, message: 'Erro: Nome e Categoria são obrigatórios!', severity: 'error' });
            return;
        }

        const isEditing = 'id' in productData && (productData as Produto).id !== 0;
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/api/produtos/${(productData as Produto).id}` : `${import.meta.env.VITE_API_URL}/api/produtos`;
        const method = isEditing ? 'PUT' : 'POST';

        // Se for criação (ID 0), remove o ID antes de enviar
        const bodyData = { ...productData };
        if (!isEditing && 'id' in bodyData) {
            // @ts-ignore
            delete bodyData.id;
        }

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) })
            .then(res => res.json())
            .then(savedProduct => {
                if (isEditing) setProdutos(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                else setProdutos(prev => [...prev, savedProduct]);
                if (isModalOpen) setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Produto salvo com sucesso!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao salvar.', severity: 'error' }));
    };

    if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
    );

    const pageTitle = searchTerm ? `Resultados para "${searchTerm}"` : (selectedCategory || 'Cardápio Digital');

    return (
        <Box sx={{ p: 3, flexGrow: 1 }}>

            {/* --- INICIO DO CÓDIGO DE DEBUG (COLE ISSO AQUI) --- */}
            <Box sx={{ p: 2, bgcolor: '#fff3cd', color: '#856404', mb: 2, borderRadius: 1, border: '1px solid #ffeeba' }}>
                <Typography variant="body1" fontWeight="bold">
                    DEBUG URL: {import.meta.env.VITE_API_URL}
                </Typography>
            </Box>

            {/* --- AQUI ESTÃO AS ANIMAÇÕES CORRIGIDAS --- */}
            <style>
                {`
                @keyframes floatCard {
                    0% {
                        transform: translateY(0px) scale(1);
                    }
                    50% {
                        transform: translateY(-4px) scale(1.01);  /* Sobe e aumenta levemente */
                    }
                    100% {
                        transform: translateY(0px) scale(1);
                    }
                }
                
                @keyframes pulseCell {
                    0% { background-color: rgba(0, 0, 0, 0.02); }
                    50% { background-color: rgba(0, 0, 0, 0.12); } 
                    100% { background-color: rgba(0, 0, 0, 0.02); }
                }
                `}
            </style>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

                {/* --- LADO ESQUERDO (Voltar + Título + Chips) --- */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {(selectedCategory || searchTerm) && (
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}>
                            Voltar
                        </Button>
                    )}

                    <Typography variant="h4" fontWeight="bold">{pageTitle}</Typography>

                    {/* CHIPS (Agora dentro do grupo da esquerda para não grudar no olho) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            icon={<RestaurantIcon />}
                            label={`${(selectedCategory || searchTerm) ? filteredProducts.length : produtos.length} itens`}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                        />

                        <Chip
                            label={showValues
                                ? ((selectedCategory || searchTerm) ? totalFilteredValue : totalMenuValue)
                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                : "R$ -----"}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 'bold', bgcolor: 'rgba(46, 125, 50, 0.05)', borderColor: '#2e7d32' }}
                        />
                    </Box>
                </Box>

                {/* --- LADO DIREITO (Olho + Botões de Ação) --- */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <IconButton onClick={() => setShowValues(!showValues)} sx={{ mr: 1 }}>
                        {showValues ? <Visibility color="primary" /> : <VisibilityOff color="action" />}
                    </IconButton>

                    <Button
                        variant="outlined"
                        startIcon={<CreateNewFolderIcon />}
                        onClick={handleNewGroupClick}
                    >
                        Novo Grupo
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNewProduct}
                    >
                        Novo Produto
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
                <TextField
                    fullWidth
                    placeholder="Buscar produto no cardápio..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
                />
            </Paper>

            {!selectedCategory && !searchTerm ? (
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {categories.map(category => (
                        <Paper
                            key={category.name}
                            onClick={() => setSelectedCategory(category.name)}
                            sx={{
                                position: 'relative',
                                p: 2,
                                cursor: 'pointer',
                                boxShadow: 3,
                                '&:hover': {
                                    animation: 'floatCard 1.5s infinite ease-in-out',
                                    boxShadow: 10,
                                    zIndex: 2
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '120px'
                            }}
                        >
                            {/* BOTÃO X */}
                            <IconButton
                                size="small"
                                color="error"
                                sx={{ position: 'absolute', top: 5, right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategoryClick(category.name);
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            {/* Nome da Categoria */}
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', lineHeight: 1.2 }}>
                                {category.name}
                            </Typography>

                            {/* RODAPÉ DO CARD: Valor e Quantidade */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                                {/* Valor (Respeita o Olhinho) */}
                                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1rem' }}>
                                    {showValues
                                        ? category.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        : "R$ -----"}
                                </Typography>

                                {/* Quantidade */}
                                <Typography color="text.primary" fontWeight="bold" align="right">
                                    {category.count} itens
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Preço</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Desconto (R$)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Desconto (%)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Preço Final</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProducts.map((produto) => (
                                    <ProductRow
                                        key={produto.id}
                                        row={produto}
                                        allInsumos={insumos}
                                        onUpdateProduct={handleSaveProduct}
                                        onUpdateInsumoGlobal={handleUpdateInsumoGlobal}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        showValues={showValues}
                                    />
                                ))}
                                {filteredProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>Nenhum produto encontrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <ProductModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
            productToEdit={editingProduct}
            existingCategories={categories.map(c => c.name)}
            />

            <ConfirmationDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, productId: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja excluir este produto?" />

            <ConfirmationDialog
                open={deleteCategoryConfirm.open}
                onClose={() => setDeleteCategoryConfirm({ open: false, categoryName: null })}
                onConfirm={confirmDeleteCategory}
                title="Excluir Grupo Inteiro?"
                message={`ATENÇÃO: Isso excluirá o grupo "${deleteCategoryConfirm.categoryName}" e TODOS os produtos dele do banco de dados.`}
            />

            {snackbar && <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>}

            {/* --- DIALOG PARA CRIAR NOVO GRUPO --- */}
            <Dialog open={isGroupDialogOpen} onClose={() => setIsGroupDialogOpen(false)}>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Digite o nome do novo grupo (ex: Bebidas, Temakis).
                        Em seguida, você precisará cadastrar o primeiro produto deste grupo.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nome do Grupo"
                        fullWidth
                        variant="outlined"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsGroupDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmNewGroup} variant="contained">Criar e Adicionar Produto</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}