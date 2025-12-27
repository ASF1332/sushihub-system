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
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { InsumoModal } from '../components/InsumoModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

// --- INTERFACE COMPLETA (COM PREÇO) ---
interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade?: string;
    estoque?: number;
    estoqueMinimo?: number;
    preco?: number; // Campo de custo
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

    // Atualiza o valor interno se o valor externo mudar
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

    // MODO VISUALIZAÇÃO
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
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    ...sx
                }}
            >
                {value}
            </TableCell>
        );
    }

    // MODO EDIÇÃO (SELECT)
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

    // MODO EDIÇÃO (TEXTO/NUMERO)
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; insumoId: number | null }>({ open: false, insumoId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
    const [highlightedInsumoId, setHighlightedInsumoId] = useState<number | null>(null);
    const [editingCell, setEditingCell] = useState<{ id: number, field: string } | null>(null);

    // --- BUSCA DADOS ---
    const fetchInsumos = () => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
            .then(res => {
                if (!res.ok) throw new Error('Erro na resposta da API');
                return res.json();
            })
            .then(data => {
                // PROTEÇÃO: Garante que é um array antes de salvar
                if (Array.isArray(data)) {
                    setInsumos(data);
                    setError(null);
                } else {
                    console.error("API retornou dados inválidos:", data);
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

    // Efeito de destaque na linha
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

    // --- CÁLCULOS E FILTROS (Com proteção contra nulo) ---
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

    const itensEmAlerta = useMemo(() => {
        if (!Array.isArray(insumos)) return [];
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

    // Salvar edição da célula (Inline Edit)
    const handleCellSave = (id: number, field: string, value: any) => {
        const insumoOriginal = insumos.find(i => i.id === id);
        if (!insumoOriginal || insumoOriginal[field as keyof Insumo] == value) {
            setEditingCell(null);
            return;
        }

        const insumoAtualizado = { ...insumoOriginal, [field]: value };
        // Converte para número se necessário
        if (['estoque', 'estoqueMinimo', 'preco'].includes(field)) {
            insumoAtualizado[field as keyof Insumo] = Number(value);
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumoAtualizado)
        }).then(res => res.json()).then(saved => {
            setInsumos(prev => prev.map(i => i.id === saved.id ? saved : i));
            setEditingCell(null);
            setSnackbar({ open: true, message: 'Atualizado!', severity: 'success' });
        });
    };

    // Confirmar Exclusão
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

    // Salvar via Modal
    const handleSaveModal = (data: InsumoData | Insumo) => {
        const isEditing = 'id' in data;
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos${isEditing ? `/${data.id}` : ''}`, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(saved => {
            setInsumos(prev => isEditing ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
            setIsModalOpen(false);
            setSnackbar({ open: true, message: 'Salvo com sucesso!', severity: 'success' });
        });
    };

    return (
        // CORREÇÃO DE SCROLL (maxWidth e overflowX)
        <Box sx={{ p: 3, maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                {selectedCategory && (
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>Voltar</Button>
                )}
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    {selectedCategory ? selectedCategory : 'Gestão de Insumos'}
                </Typography>
                <Button variant="contained" color="primary" onClick={handleNew}>Novo Insumo</Button>
            </Box>

            {/* LOADING E ERRO */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}

            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error} <Button color="inherit" size="small" onClick={fetchInsumos}>Tentar Novamente</Button>
                </Alert>
            )}

            {/* VISÃO GERAL (CARDS DE CATEGORIA + PAINEL DE ALERTAS) */}
            {!loading && !error && !selectedCategory ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {Object.entries(insumosPorCategoria).map(([categoria, itens]) => {
                            const qtdCriticos = itens.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5)).length;
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={categoria}>
                                    <Paper
                                        elevation={3}
                                        onClick={() => setSelectedCategory(categoria)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px'
                                        }}
                                    >
                                        <Typography variant="h6" align="left">{categoria.toUpperCase()}</Typography>
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

            {/* TABELA DETALHADA DA CATEGORIA SELECIONADA */}
            {!loading && !error && selectedCategory ? (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome do Insumo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Custo Unit.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estoque Atual</TableCell>
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

                                            {/* COLUNA DE PREÇO (Que eu tinha esquecido antes) */}
                                            <EditableCell
                                                value={insumo.preco ? `R$ ${insumo.preco.toFixed(2)}` : 'R$ 0.00'}
                                                type="number"
                                                align="right"
                                                sx={{ color: '#2e7d32', fontWeight: 'bold' }}
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'preco'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'preco' })}
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

            <InsumoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} insumoToEdit={editingInsumo} />
            <ConfirmationDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, insumoId: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja excluir este insumo?" />
            {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
        </Box>
    );
}