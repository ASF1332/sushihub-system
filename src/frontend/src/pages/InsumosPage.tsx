import { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert, LinearProgress, Chip, TextField, MenuItem, Select } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { InsumoModal } from '../components/InsumoModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface Insumo { id: number; nome: string; categoria: string; unidade?: string; estoque?: number; estoqueMinimo?: number; }
type InsumoData = Omit<Insumo, 'id'>;

// --- COMPONENTE AUXILIAR: CÉLULA EDITÁVEL (TRAVADA) ---
// --- COMPONENTE AUXILIAR: CÉLULA EDITÁVEL (CORRIGIDO COM CORES) ---
const EditableCell = ({
                          value,
                          isEditing,
                          onDoubleClick,
                          onSave,
                          onCancel,
                          type = 'text',
                          align = 'left',
                          options = [],
                          sx = {} // <-- RECEBE AS CORES AQUI
                      }: any) => {
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // MODO VISUALIZAÇÃO (COM COR)
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
                    ...sx // <-- APLICA AS CORES AQUI
                }}
            >
                {value}
            </TableCell>
        );
    }

    // MODO EDIÇÃO (INPUT)
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
                    display: 'flex',
                    justifyContent: 'center',
                    '& .MuiInputBase-root': {
                        height: '100%',
                        fontSize: '0.875rem',
                        // Aplica a cor também no input enquanto digita
                        color: sx.color || 'inherit',
                        fontWeight: sx.fontWeight || 'inherit',
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


export function InsumosPage() {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; insumoId: number | null }>({ open: false, insumoId: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    // Estado para piscar a linha (animação)
    const [highlightedInsumoId, setHighlightedInsumoId] = useState<number | null>(null);

    // --- NOVO: Estado para saber QUAL CÉLULA está sendo editada ---
    // Ex: { id: 1, field: 'nome' }
    const [editingCell, setEditingCell] = useState<{ id: number, field: string } | null>(null);

    const fetchInsumos = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`)
            .then(res => res.json()).then(setInsumos).catch(() => setError('Falha ao carregar insumos.'));
    };
    useEffect(() => { fetchInsumos(); }, []);

    // Efeito de scroll e piscar (igual antes)
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

    const insumosPorCategoria = useMemo(() => insumos.reduce((acc, insumo) => {
        (acc[insumo.categoria] = acc[insumo.categoria] || []).push(insumo);
        return acc;
    }, {} as Record<string, Insumo[]>), [insumos]);

    const filteredInsumos = useMemo(() => selectedCategory ? insumos.filter(i => i.categoria === selectedCategory) : [], [insumos, selectedCategory]);

    const itensEmAlerta = useMemo(() => insumos.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5)), [insumos]);
    const totalItens = insumos.length;
    const totalAlerta = itensEmAlerta.length;
    const percentualSaude = totalItens > 0 ? ((totalItens - totalAlerta) / totalItens) * 100 : 100;

    const handleNew = () => { setEditingInsumo(null); setIsModalOpen(true); };
    const handleEditComplete = (insumo: Insumo) => { setEditingInsumo(insumo); setIsModalOpen(true); }; // Edição completa via modal
    const handleDelete = (id: number) => setDeleteConfirm({ open: true, insumoId: id });

    const handleNavigateToItem = (categoria: string, id: number) => {
        setSelectedCategory(categoria);
        setHighlightedInsumoId(id);
    };

    // --- NOVA FUNÇÃO: SALVAR EDIÇÃO EM LINHA (CELULA) ---
    const handleCellSave = (id: number, field: string, value: any) => {
        const insumoOriginal = insumos.find(i => i.id === id);
        if (!insumoOriginal) return;

        // Se o valor não mudou, não faz nada
        if (insumoOriginal[field as keyof Insumo] == value) {
            setEditingCell(null);
            return;
        }

        const insumoAtualizado = { ...insumoOriginal, [field]: value };

        // Converte para número se for estoque
        if (field === 'estoque' || field === 'estoqueMinimo') {
            insumoAtualizado[field] = Number(value);
        }

        // Atualiza no Backend
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumoAtualizado)
        })
            .then(res => res.json())
            .then(savedInsumo => {
                setInsumos(prev => prev.map(i => i.id === savedInsumo.id ? savedInsumo : i));
                setEditingCell(null); // Sai do modo de edição
                setSnackbar({ open: true, message: 'Atualizado!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao atualizar.', severity: 'error' }));
    };

    const confirmDelete = () => {
        if (deleteConfirm.insumoId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${deleteConfirm.insumoId}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error();
                    setInsumos(prev => prev.filter(i => i.id !== deleteConfirm.insumoId));
                    setSnackbar({ open: true, message: 'Excluído!', severity: 'success' });
                })
                .catch(() => setSnackbar({ open: true, message: 'Erro ao excluir.', severity: 'error' }))
                .finally(() => setDeleteConfirm({ open: false, insumoId: null }));
        }
    };

    const handleSaveModal = (insumoData: InsumoData | Insumo) => {
        const isEditing = 'id' in insumoData;
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/api/insumos/${insumoData.id}` : `${import.meta.env.VITE_API_URL}/api/insumos`;
        const method = isEditing ? 'PUT' : 'POST';

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(insumoData) })
            .then(res => res.json())
            .then(savedInsumo => {
                if (isEditing) {
                    setInsumos(prev => prev.map(i => i.id === savedInsumo.id ? savedInsumo : i));
                } else {
                    setInsumos(prev => [...prev, savedInsumo]);
                }
                setIsModalOpen(false);
                setSnackbar({ open: true, message: 'Salvo com sucesso!', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Erro ao salvar.', severity: 'error' }));
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                {selectedCategory && (
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedCategory(null)}>Voltar</Button>
                )}
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    {selectedCategory ? selectedCategory : 'Gestão de Insumos'}
                </Typography>
                <Button variant="contained" color="primary" onClick={handleNew}>Novo Insumo</Button>
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {!selectedCategory ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {Object.entries(insumosPorCategoria).map(([categoria, itens]) => {
                            // 1. CÁLCULO: Quantos itens DESSA categoria estão abaixo do mínimo?
                            const qtdCriticos = itens.filter(i => (i.estoque || 0) < (i.estoqueMinimo || 5)).length;

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={categoria}>
                                    <Paper
                                        elevation={3}
                                        onClick={() => setSelectedCategory(categoria)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '120px'
                                        }}
                                    >
                                        {/* Título da Categoria */}
                                        <Typography variant="h6" align="left">{categoria.toUpperCase()}</Typography>

                                        {/* Rodapé do Card (Esquerda: Críticos / Direita: Total) */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>

                                            {/* ESQUERDA: Itens Críticos em Vermelho */}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'error.main', // Vermelho
                                                    fontWeight: 'bold',
                                                    // Se for 0, esconde para deixar o visual limpo (opcional)
                                                    visibility: qtdCriticos > 0 ? 'visible' : 'hidden'
                                                }}
                                            >
                                                {qtdCriticos} {qtdCriticos === 1 ? 'crítico' : 'críticos'}
                                            </Typography>

                                            {/* DIREITA: Total de Itens */}
                                            <Typography color="text.primary" fontWeight="bold" align="right">
                                                {itens.length} {itens.length > 1 ? 'itens' : 'item'}
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
                                <Typography variant="body2" color="text.secondary">
                                    {totalAlerta === 0 ? "Estoque perfeito! Nada a repor." : `${totalAlerta} itens precisam de atenção imediata.`}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="error.main">Itens com Estoque Crítico</Typography>
                                {itensEmAlerta.length > 0 ? (
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
                                                {itensEmAlerta.map((item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        hover
                                                        // Removemos o onClick na linha inteira para não conflitar com a edição
                                                        // Adicionamos o clique apenas nas células não editáveis
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        {/* NOME (Clique simples navega, não edita aqui para evitar confusão) */}
                                                        <TableCell
                                                            onClick={() => handleNavigateToItem(item.categoria, item.id)}
                                                        >
                                                            {item.nome}
                                                        </TableCell>

                                                        <TableCell onClick={() => handleNavigateToItem(item.categoria, item.id)}>
                                                            <Chip label={item.categoria} size="small" />
                                                        </TableCell>

                                                        {/* ESTOQUE ATUAL (EDITÁVEL) */}
                                                        <EditableCell
                                                            value={item.estoque}
                                                            type="number"
                                                            align="right"
                                                            sx={{
                                                                color: 'error.main',
                                                                fontWeight: 'bold'
                                                            }}
                                                            isEditing={editingCell?.id === item.id && editingCell?.field === 'estoque'}
                                                            onDoubleClick={() => setEditingCell({ id: item.id, field: 'estoque' })}
                                                            onSave={(newVal: any) => handleCellSave(item.id, 'estoque', newVal)}
                                                            onCancel={() => setEditingCell(null)}
                                                        />

                                                        {/* MÍNIMO (EDITÁVEL) */}
                                                        <EditableCell
                                                            value={item.estoqueMinimo || 5}
                                                            type="number"
                                                            align="right"
                                                            isEditing={editingCell?.id === item.id && editingCell?.field === 'estoqueMinimo'}
                                                            onDoubleClick={() => setEditingCell({ id: item.id, field: 'estoqueMinimo' })}
                                                            onSave={(newVal: any) => handleCellSave(item.id, 'estoqueMinimo', newVal)}
                                                            onCancel={() => setEditingCell(null)}
                                                            // ADICIONE ESTE BLOCO:
                                                            sx={{
                                                                color: '#1976d2', // Azul
                                                                fontWeight: 'bold' // Negrito
                                                            }}
                                                        />

                                                        {/* A COMPRAR (Cálculo Automático, não editável) */}
                                                        <TableCell
                                                            align="right"
                                                            sx={{ color: 'text.primary' }} // Apenas a cor, sem o bold
                                                            onClick={() => handleNavigateToItem(item.categoria, item.id)}
                                                        >
                                                            {((item.estoqueMinimo || 5) - (item.estoque || 0))} {item.unidade}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography>Tudo certo! Nenhum item abaixo do mínimo.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome do Insumo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estoque Atual</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold',}}>Estoque Mínimo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unidade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredInsumos.map((insumo) => {
                                    const minimo = insumo.estoqueMinimo || 5;
                                    const estoqueBaixo = (insumo.estoque || 0) < minimo;
                                    const isHighlighted = insumo.id === highlightedInsumoId;

                                    return (
                                        <TableRow
                                            key={insumo.id}
                                            id={`insumo-row-${insumo.id}`}
                                            hover
                                            sx={{
                                                backgroundColor: isHighlighted ? 'rgba(25, 118, 210, 0.2)' : 'inherit',
                                                transition: 'background-color 0.5s ease',
                                                animation: isHighlighted ? 'pulse 1s infinite' : 'none',
                                                '@keyframes pulse': {
                                                    '0%': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                                    '50%': { backgroundColor: 'rgba(25, 118, 210, 0.3)' },
                                                    '100%': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                                }
                                            }}
                                        >
                                            <EditableCell
                                                value={insumo.nome}
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'nome'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'nome' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'nome', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                            />

                                            {/* ESTOQUE ATUAL (AGORA VAI FUNCIONAR) */}
                                            <EditableCell
                                                value={insumo.estoque}
                                                type="number"
                                                align="right"
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'estoque'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'estoque' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'estoque', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                                // AQUI A COR VAI FUNCIONAR PORQUE A VARIÁVEL EXISTE AGORA
                                                sx={{
                                                    color: estoqueBaixo ? 'error.main' : '#4caf50',
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            {/* ESTOQUE MÍNIMO (EDITÁVEL) */}
                                            <EditableCell
                                                value={insumo.estoqueMinimo || 5}
                                                type="number"
                                                align="right"
                                                isEditing={editingCell?.id === insumo.id && editingCell?.field === 'estoqueMinimo'}
                                                onDoubleClick={() => setEditingCell({ id: insumo.id, field: 'estoqueMinimo' })}
                                                onSave={(newVal: any) => handleCellSave(insumo.id, 'estoqueMinimo', newVal)}
                                                onCancel={() => setEditingCell(null)}
                                                // AQUI A MUDANÇA DA COR:
                                                sx={{
                                                    color: '#1976d2', // Azul Profissional
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            {/* UNIDADE (EDITÁVEL COM SELECT) */}
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
            )}

            <InsumoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} insumoToEdit={editingInsumo} />
            <ConfirmationDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, insumoId: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja excluir este insumo?" />
            {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
        </Box>
    );
}