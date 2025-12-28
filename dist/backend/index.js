"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- ROTAS DE INSUMOS ---
app.get('/api/insumos', async (req, res) => {
    try {
        const insumos = await prisma.insumo.findMany();
        res.json(insumos);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar insumos' });
    }
});
app.post('/api/insumos', async (req, res) => {
    try {
        const { nome, categoria, unidade, estoque, estoqueMinimo } = req.body;
        const novo = await prisma.insumo.create({
            data: {
                nome,
                categoria,
                unidade: unidade || 'un',
                estoque: Number(estoque),
                estoqueMinimo: Number(estoqueMinimo)
            }
        });
        res.json(novo);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar insumo' });
    }
});
app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const atualizado = await prisma.insumo.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json(atualizado);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar insumo' });
    }
});
app.delete('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.insumo.delete({ where: { id: Number(id) } });
        res.json({ message: 'Insumo deletado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar insumo' });
    }
});
// --- ROTAS DE PRODUTOS ---
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            include: { fichaTecnica: true }
        });
        res.json(produtos);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});
app.post('/api/produtos', async (req, res) => {
    try {
        const { nome, preco, categoria, fichaTecnica } = req.body;
        const novo = await prisma.produto.create({
            data: {
                nome,
                preco: Number(preco),
                categoria,
                fichaTecnica: {
                    create: fichaTecnica.map((item) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade)
                    }))
                }
            },
            include: { fichaTecnica: true }
        });
        res.json(novo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});
// --- ROTA DE ATUALIZAR PRODUTO (CORRIGIDA) ---
app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, categoria, fichaTecnica } = req.body;
    try {
        const atualizado = await prisma.produto.update({
            where: { id: Number(id) },
            data: {
                nome,
                preco: Number(preco),
                categoria,
                fichaTecnica: {
                    // 1. Apaga os ingredientes antigos
                    deleteMany: {},
                    // 2. Cria os novos ingredientes atualizados
                    create: fichaTecnica.map((item) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade)
                    }))
                }
            },
            include: { fichaTecnica: true }
        });
        res.json(atualizado);
    }
    catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // O Prisma deleta a ficha técnica automaticamente se configurado como Cascade,
        // mas por segurança deletamos a ficha antes ou usamos deleteMany na transaction.
        // Como simplificação aqui, vamos deletar o produto e o Prisma cuida do resto se o schema permitir,
        // mas para garantir sem erro de chave estrangeira:
        const deleteFicha = prisma.fichaTecnica.deleteMany({
            where: { produtoId: Number(id) }
        });
        const deleteProduto = prisma.produto.delete({
            where: { id: Number(id) }
        });
        await prisma.$transaction([deleteFicha, deleteProduto]);
        res.json({ message: 'Produto deletado' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});
// --- ROTAS DE PEDIDOS ---
app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            include: { itens: { include: { produto: true } } },
            orderBy: { dataHora: 'desc' }
        });
        res.json(pedidos);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});
app.post('/api/pedidos', async (req, res) => {
    const { cliente, telefone, canal, valor, itens } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const novoPedido = await tx.pedido.create({
                data: {
                    cliente,
                    telefone,
                    canal,
                    status: 'Novo',
                    valor: Number(valor),
                    itens: {
                        create: itens.map((item) => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade
                        }))
                    }
                },
                include: { itens: true }
            });
            for (const itemPedido of itens) {
                const produto = await tx.produto.findUnique({
                    where: { id: itemPedido.produtoId },
                    include: { fichaTecnica: true }
                });
                if (produto && produto.fichaTecnica) {
                    for (const insumoFicha of produto.fichaTecnica) {
                        const descontoTotal = insumoFicha.quantidade * itemPedido.quantidade;
                        await tx.insumo.update({
                            where: { id: insumoFicha.insumoId },
                            data: { estoque: { decrement: descontoTotal } }
                        });
                    }
                }
            }
            return novoPedido;
        });
        res.json(resultado);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao processar pedido' });
    }
});
app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const atualizado = await prisma.pedido.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(atualizado);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
});
// --- ROTAS DE CLIENTES ---
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany();
        res.json(clientes);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});
// Deletar Pedido (Com opção de estorno de estoque)
app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const devolverEstoque = req.query.devolverEstoque === 'true'; // Lê o parâmetro da URL
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Se for para devolver, precisamos ver o que tinha no pedido ANTES de deletar
            if (devolverEstoque) {
                const pedido = await tx.pedido.findUnique({
                    where: { id: Number(id) },
                    include: { itens: true }
                });
                if (pedido) {
                    for (const itemPedido of pedido.itens) {
                        // Busca a ficha técnica do produto
                        const produto = await tx.produto.findUnique({
                            where: { id: itemPedido.produtoId },
                            include: { fichaTecnica: true }
                        });
                        if (produto && produto.fichaTecnica) {
                            for (const insumoFicha of produto.fichaTecnica) {
                                // Cálculo inverso: Devolve a quantidade gasta
                                const qtdDevolver = insumoFicha.quantidade * itemPedido.quantidade;
                                await tx.insumo.update({
                                    where: { id: insumoFicha.insumoId },
                                    data: {
                                        estoque: { increment: qtdDevolver } // <--- INCREMENTA O ESTOQUE
                                    }
                                });
                            }
                        }
                    }
                }
            }
            // 2. Apaga os itens do pedido (necessário por causa das chaves estrangeiras)
            await tx.itemPedido.deleteMany({
                where: { pedidoId: Number(id) }
            });
            // 3. Apaga o pedido
            await tx.pedido.delete({
                where: { id: Number(id) }
            });
        });
        res.json({ message: 'Pedido deletado com sucesso' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
});
app.post('/api/clientes', async (req, res) => {
    try {
        const novoCliente = await prisma.cliente.create({ data: req.body });
        res.json(novoCliente);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});
app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const atualizado = await prisma.cliente.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json(atualizado);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});
app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.cliente.delete({ where: { id: Number(id) } });
        res.json({ message: 'Cliente deletado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
});
app.listen(PORT, () => {
    console.log(`✅ Servidor Backend rodando com Banco de Dados na porta ${PORT}`);
});
