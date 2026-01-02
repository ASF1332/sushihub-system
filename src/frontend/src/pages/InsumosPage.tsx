import { useEffect, useState, useMemo, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Snackbar,
    Alert,
    LinearProgress,
    Chip,
    TextField,
    MenuItem,
    Select,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { InsumoModal } from '../components/InsumoModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

// --- INTERFACE COMPLETA ---
interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade?: string;
    estoque?: number;
    estoqueMinimo?: number;
    preco?: number;
}

type InsumoData = Omit<Insumo, 'id'>;

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

    useEffect(() => {
        setTempValue(value);
    }, [value]);

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
                    height: '56px',
                    boxSizing: 'border-box',
                    '&:hover': {
                        animation: 'pulseCellRed 1.5s infinite ease-in-out'
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
            <TableCell align={align} sx={{ p: 0, height: '56px' }}>
                <Select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => onSave(tempValue)}
                    autoFocus
                    defaultOpen
                    fullWidth
                    variant="standard"
                    sx={{ height: '100%', '& .MuiSelect-select': { paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' } }}
                >
                    {options.map((opt: string) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
            </TableCell>
        );
    }

    return (
        <TableCell align={align} sx={{ p: 0, height: '56px' }}>
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
                    '& .MuiInputBase-root': {
                        height: '100%',
                        fontSize: '0.875rem',
                        paddingLeft: align === 'right' ? 0 : '16px',
                        paddingRight: align === 'right' ? '16px' : 0,
                    },
                    '& .MuiInput-input': {
                        padding: '0 !important',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }}
                inputProps={{ style: { textAlign: align === 'right' ? 'right' : 'left' } }}
            />
        </TableCell>
    );
};

// --- COMPONENTE PRINCIPAL ---
export function InsumosPage() {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showValues, setShowValues] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; insumoId: number | null }>({ open: false, insumoId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' } | null>(null);
    const [highlightedInsumoId, setHighlightedInsumoId] = useState<number | null>(null);
    const [editingCell, setEditingCell] = useState<{ id: number, field: string } | null>(null);

    // --- ESTADOS PARA NOVO GRUPO ---
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // --- BUSCA DADOS ---
    const fetchInsumos = () => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
            .then(res => {
                if (!res.ok) throw new Error('Erro na resposta da API');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setInsumos(data);
                    setError(null);
                } else {
                    setInsumos([]);
                    setError("Erro: Servidor retornou dados inválidos.");
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Aguardando conexão com o servidor...');
                setInsumos([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchInsumos(); }, []);

    useEffect(() => {
        if (highlightedInsumoId && selectedCategory) {
            setTimeout(() => {
                const element = document.getElementById(`insumo-row-${highlightedInsumoId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            const timer = setTimeout(() => setHighlightedInsumoId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedInsumoId, selectedCategory]);

    // --- CÁLCULOS ---
    const insumosPorCategoria = useMemo(() => {
        if (!Array.isArray(insumos)) return {};
        return insumos.reduce((acc, insumo) => {
            (acc[insumo.categoria] = acc[insumo.categoria] || []).push(insumo);
            return acc;
        }, {} as Record<string, Insumo[]>);
    }, [insumos]);

    const filteredInsumos = useMemo(() => {
        if (!selectedCategory || !Array.isArray(insumos)) return [];
        return insumos.filter(i => i.categoria === selectedCategory);
    }, [insumos, selectedCategory]);

    const valorTotalGeral = useMemo(() => {
        return insumos.reduce((acc, item) => acc + ((item.preco || 0) * (item.estoque || 0)), 0);
    }, [insumos]);

    const valorTotalCategoriaAtual = useMemo(() => {
        return filteredInsumos.reduce((acc, item) => acc + ((item.preco || 0) * (item.estoque || 0)), 0);
    }, [filteredInsumos]);

    const itensEmAlerta = useMemo(() => {
        return insumos.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5));
    }, [insumos]);

    const percentualSaude = insumos.length > 0 ? ((insumos.length - itensEmAlerta.length) / insumos.length) * 100 : 100;

    // --- AÇÕES ---
    const handleNew = () => { setEditingInsumo(null); setIsModalOpen(true); };
    const handleEditComplete = (insumo: Insumo) => { setEditingInsumo(insumo); setIsModalOpen(true); };
    const handleDelete = (id: number) => setDeleteConfirm({ open: true, insumoId: id });

    const handleNavigateToItem = (categoria: string, id: number) => {
        setSelectedCategory(categoria);
        setHighlightedInsumoId(id);
    };

    // --- LÓGICA DO NOVO GRUPO (CORRIGIDA) ---
    const handleNewGroupClick = () => {
        setNewGroupName('');
        setIsGroupDialogOpen(true);
    };

    const handleConfirmNewGroup = () => {
        const nomeLimpo = newGroupName.trim();

        if (!nomeLimpo) {
            setSnackbar({ open: true, message: 'Digite um nome para o grupo.', severity: 'error' });
            return;
        }

        // Verifica se o grupo já existe
        const categoriasExistentes = Object.keys(insumosPorCategoria).map(c => c.toLowerCase());
        if (categoriasExistentes.includes(nomeLimpo.toLowerCase())) {
            setSnackbar({
                open: true,
                message: `O grupo "${nomeLimpo}" já existe!`,
                severity: 'warning'
            });
            return;
        }

        setIsGroupDialogOpen(false);

        // Abre o modal de Insumo forçando a categoria nova
        // O usuário PRECISA salvar este insumo para o grupo ser criado de fato
        setEditingInsumo({
            id: 0,
            nome: '',
            categoria: nomeLimpo,
            unidade: 'un',
            estoque: 0,
            estoqueMinimo: 5,
            preco: 0
        });
        setIsModalOpen(true);
    };

    // --- SALVAR INSUMO (CORRIGIDO PARA EVITAR DUPLICIDADE VISUAL) ---
    const handleSaveModal = (data: InsumoData | Insumo) => {
        const isEditing = 'id' in data && (data as Insumo).id !== 0;
        const url = isEditing
            ? `${import.meta.env.VITE_API_URL}/api/insumos/${(data as Insumo).id}`
            : `${import.meta.env.VITE_API_URL}/api/insumos`;
        const method = isEditing ? 'PUT' : 'POST';

        const bodyData = { ...data };
        if (!isEditing && 'id' in bodyData) {
            // @ts-ignore
            delete bodyData.id;
        }

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        })
            .then(async res => {
                // SE O BACKEND RETORNAR ERRO (ex: 400 Duplicado), CAI AQUI
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Erro na requisição');
                }
                return res.json();
            })
            .then(saved => {
                // SÓ ATUALIZA A TELA SE DEU TUDO CERTO
                setInsumos(prev => isEditing ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
                setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Salvo com sucesso!', severity: 'success' });
            })
            .catch(err => {
                console.error(err);
                // EXIBE O ERRO DO BACKEND (ex: "Já existe um insumo...")
                setSnackbar({ open: true, message: err.message, severity: 'error' });
            });
    };

    const handleCellSave = (id: number, field: string, value: any) => {
        const insumoOriginal = insumos.find(i => i.id === id);
        if (!insumoOriginal || insumoOriginal[field as keyof Insumo] == value) {
            setEditingCell(null);
            return;
        }

        const insumoAtualizado = { ...insumoOriginal, [field]: value };
        if (['estoque', 'estoqueMinimo', 'preco'].includes(field)) {
            (insumoAtualizado as any)[field] = Number(value);
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumoAtualizado)
        })
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Erro ao atualizar');
                }
                return res.json();
            })
            .then(saved => {
                setInsumos(prev => prev.map(i => i.id === saved.id ? saved : i));
                setEditingCell(null);
                setSnackbar({ open: true, message: 'Atualizado!', severity: 'success' });
            })
            .catch(err => {
                setSnackbar({ open: true, message: err.message, severity: 'error' });
                // Reverte o valor visualmente se der erro
                setEditingCell(null);
            });
    };

    const confirmDelete = () => {
        if (deleteConfirm.insumoId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${deleteConfirm.insumoId}`, { method: 'DELETE' })
                .then(() => {
                    setInsumos(prev => prev.filter(i => i.id !== deleteConfirm.insumoId));
                    setSnackbar({ open: true, message: 'Excluído!', severity: 'success' });
                })
                .catch(() => setSnackbar({ open: true, message: 'Erro ao excluir.', severity: 'error' }))
                .finally(() => setDeleteConfirm({ open: false, insumoId: null }));
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <style>
                {`
                @keyframes floatCard {
                    0% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-4px) scale(1.01); }
                    100% { transform: translateY(0px) scale(1); }
                }
                @keyframes pulseCellRed {
                    0% { background-color: rgba(211, 47, 47, 0.0); } 
                    50% { background-color: rgba(211, 47, 47, 0.08); } 
                    100% { background-color: rgba(211, 47, 47, 0.0); }
                }
                `}
            </style>

            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                {selectedCategory && (
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>
                        Voltar
                    </Button>
                )}

                <Typography variant="h4" component="h1" sx={{ flexGrow: 0, mr: 2 }}>
                    {selectedCategory ? selectedCategory : 'Gestão de Insumos'}
                </Typography>

                <Chip
                    icon={<RestaurantIcon />}
                    label={`${selectedCategory ? filteredInsumos.length : insumos.length} itens`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', mr: 1 }}
                />

                <Chip
                    icon={<AttachMoneyIcon />}
                    label={showValues
                        ? (selectedCategory
                                ? valorTotalCategoriaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                : valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        )
                        : "R$ -----"}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1, mr: 2 }}
                />

                <IconButton onClick={() => setShowValues(!showValues)} sx={{ ml: 'auto' }}>
                    {showValues ? <Visibility color="primary" /> : <VisibilityOff color="action" />}
                </IconButton>

                <Button
                    variant="outlined"
                    startIcon={<CreateNewFolderIcon />}
                    onClick={handleNewGroupClick}
                    sx={{ ml: 2 }}
                >
                    Novo Grupo
                </Button>

                <Button variant="contained" color="primary" onClick={handleNew} sx={{ ml: 2 }}>
                    Novo Insumo
                </Button>
            </Box>

            {/* LOADING E ERRO */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}

            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error} <Button color="inherit" size="small" onClick={fetchInsumos}>Tentar Novamente</Button>
                </Alert>
            )}

            {/* VISÃO GERAL (CARDS) */}
            {!loading && !error && !selectedCategory ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {Object.entries(insumosPorCategoria).map(([categoria, itens]) => {
                            const qtdCriticos = itens.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5)).length;
                            const valorTotalCategoria = itens.reduce((acc, item) => {
                                return acc + ((item.preco || 0) * (item.estoque || 0));
                            }, 0);

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={categoria}>
                                    <Paper
                                        elevation={3}
                                        onClick={() => setSelectedCategory(categoria)}
                                        sx={{
                                            position: 'relative',
                                            p: 2,
                                            cursor: 'pointer',
                                            boxShadow: 3,
                                            border: '1px solid #e0e0e0',
                                            '&:hover': {
                                                animation: 'floatCard 1.5s infinite ease-in-out',
                                                boxShadow: '0 8px 24px rgba(211, 47, 47, 0.25)',
                                                borderColor: '#d32f2f',
                                                zIndex: 2
                                            },
                                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Typography variant="h6" align="left" sx={{ fontWeight: 'bold' }}>
                                                {categoria.toUpperCase()}
                                            </Typography>

                                            <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 'bold', bgcolor: '#e8f5e9', px: 1, borderRadius: 1 }}>
                                                {showValues
                                                    ? valorTotalCategoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                    : "R$ -----"}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                                            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold', visibility: qtdCriticos > 0 ? 'visible' : 'hidden' }}>
                                                {qtdCriticos} críticos
                                            </Typography>
                                            <Typography color="text.primary" fontWeight="bold" align="right">
                                                {itens.length} itens
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" /> Painel de Alertas e Reposição
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>Saúde do Estoque</Typography>
                                <Box sx={{ width: '100%', mb: 1 }}>
                                    <LinearProgress variant="determinate" value={percentualSaude} color={percentualSaude > 80 ? "success" : percentualSaude > 50 ? "warning" : "error"} sx={{ height: 10, borderRadius: 5 }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>{Math.round(percentualSaude)}% OK</Typography>
                                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>{Math.round(100 - percentualSaude)}% Crítico</Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="error.main">Itens com Estoque Crítico</Typography>
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Insumo</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Atual</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Mínimo</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>A Comprar</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itensEmAlerta.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} align="center">Tudo certo! Nenhum item crítico.</TableCell></TableRow>
                                            ) : (
                                                itensEmAlerta.map((item) => (
                                                    <TableRow key={item.id} hover sx={{ cursor: 'pointer' }}>
                                                        <TableCell onClick={() => handleNavigateToItem(item.categoria, item.id)}>{item.nome}</TableCell>
                                                        <TableCell onClick={() => handleNavigateToItem(item.categoria, item.id)}><Chip label={item.categoria} size="small" /></TableCell>
                                                        <EditableCell
                                                            value={item.estoque}
                                                            type="number"
                                                            align="right"
                                                            sx={{ color: 'error.main', fontWeight: 'bold' }}
                                                            isEditing={editingCell?.id === item.id && editingCell?.field === 'estoque'}
                                                            onDoubleClick={() => setEditingCell({ id: item.id, field: 'estoque' })}
                                                            onSave={(newVal: any) => handleCellSave(item.id, 'estoque', newVal)}
                                                            onCancel={() => setEditingCell(null)}
                                                        />
                                                        <EditableCell
                                                            value={item.estoqueMinimo || 5}
                                                            type="number"
                                                            align="right"
                                                            isEditing={editingCell?.id === item.id && editingCell?.field === 'estoqueMinimo'}
                                                            onDoubleClick={() => setEditingCell({ id: item.id, field: 'estoqueMinimo' })}
                                                            onSave={(newVal: any) => handleCellSave(item.id, 'estoqueMinimo', newVal)}
                                                            onCancel={() => setEditingCell(null)}
                                                            sx={{ color: '#1976d2', fontWeight: 'bold' }}
                                                        />
                                                        <TableCell align="right" onClick={() => handleNavigateToItem(item.categoria, item.id)}>
                                                            {((item.estoqueMinimo || 5) - (item.estoque || 0))} {item.unidade}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : null}

            {/* TABELA DETALHADA */}
            {!loading && !error && selectedCategory ? (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome do Insumo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Custo Unit.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estoque Atual</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estoque Mínimo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unidade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredInsumos.map((insumo) => {
                                    const estoqueBaixo = (insumo.estoque || 0) < (insumo.estoqueMinimo || 5);
                                    const isHighlighted = insumo.id === highlightedInsumoId;

                                    return (
                                        <TableRow
                                            key={insumo.id}
                                            id={`insumo-row-${insumo.id}`}
                                            hover
                                            sx={{
                                                backgroundColor: isHighlighted ? 'rgba(25, 118, 210, 0.2)' : 'inherit',
                                                transition: 'background-color 0.5s ease'
                                            }}
                                        >
                                            <EditableCell
                                                value={insumo.nome}
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'nome'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'nome' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'nome', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                            />

                                            <EditableCell
                                                value={showValues
                                                    ? (insumo.preco ? `R$ ${insumo.preco.toFixed(2)}` : 'R$ 0.00')
                                                    : 'R$ -----'}
                                                type="number"
                                                align="right"
                                                sx={{ fontWeight: 'bold' }}
                                                isEditing={showValues && editingCell?.id === insumo.id && editingCell?.field === 'preco'}
                                                onDoubleClick={() => showValues && setEditingCell({ id: insumo.id, field: 'preco' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'preco', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                            />

                                            <EditableCell
                                                value={insumo.estoque}
                                                type="number"
                                                align="right"
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'estoque'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'estoque' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'estoque', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                                sx={{
                                                    color: estoqueBaixo ? 'error.main' : '#4caf50',
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {showValues
                                                    ? ((insumo.preco || 0) * (insumo.estoque || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                    : "R$ -----"}
                                            </TableCell>

                                            <EditableCell
                                                value={insumo.estoqueMinimo || 5}
                                                type="number"
                                                align="right"
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'estoqueMinimo'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'estoqueMinimo' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'estoqueMinimo', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                                sx={{ color: '#1976d2', fontWeight: 'bold' }}
                                            />

                                            <EditableCell
                                                value={insumo.unidade}
                                                align="right"
                                                options={['un', 'kg', 'g', 'L', 'ml']}
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'unidade'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'unidade' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'unidade', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                            />

                                            <TableCell align="center">
                                                <IconButton size="small" color="secondary" onClick={() => handleEditComplete(insumo)}><EditIcon /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(insumo.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : null}

            <InsumoModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                insumoToEdit={editingInsumo}
                existingCategories={Object.keys(insumosPorCategoria)}
            />
            <ConfirmationDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, insumoId: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja excluir este insumo?" />
            {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}

            {/* --- DIALOG PARA CRIAR NOVO GRUPO --- */}
            <Dialog open={isGroupDialogOpen} onClose={() => setIsGroupDialogOpen(false)}>
                <DialogTitle>Criar Novo Grupo de Insumos</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Digite o nome do novo grupo (ex: Hortifruti, Embalagens).
                        Em seguida, cadastre o primeiro insumo deste grupo.
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
                    <Button onClick={handleConfirmNewGroup} variant="contained">Criar e Adicionar Insumo</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}