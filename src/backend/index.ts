import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// --- ROTAS DE INSUMOS ---
app.get('/api/insumos', async (req, res) => {
    try {
        const insumos = await prisma.insumo.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar insumos' });
    }
});

app.post('/api/insumos', async (req, res) => {
    try {
        // ATUALIZADO: Recebendo 'preco'
        const { nome, categoria, unidade, estoque, estoqueMinimo, preco } = req.body;

        const novo = await prisma.insumo.create({
            data: {
                nome,
                categoria,
                unidade: unidade || 'un',
                estoque: Number(estoque),
                estoqueMinimo: Number(estoqueMinimo),
                preco: Number(preco || 0) // Salva o preço de custo
            }
        });
        res.json(novo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar insumo' });
    }
});

app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // ATUALIZADO: Garante que os números sejam convertidos corretamente
        const { nome, categoria, unidade, estoque, estoqueMinimo, preco } = req.body;

        const dadosAtualizar: any = {
            nome,
            categoria,
            unidade
        };

        if (estoque !== undefined) dadosAtualizar.estoque = Number(estoque);
        if (estoqueMinimo !== undefined) dadosAtualizar.estoqueMinimo = Number(estoqueMinimo);
        if (preco !== undefined) dadosAtualizar.preco = Number(preco);

        const atualizado = await prisma.insumo.update({
            where: { id: Number(id) },
            data: dadosAtualizar
        });
        res.json(atualizado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar insumo' });
    }
});

app.delete('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Primeiro apaga as referências na ficha técnica para não dar erro
        await prisma.fichaTecnica.deleteMany({ where: { insumoId: Number(id) } });

        await prisma.insumo.delete({ where: { id: Number(id) } });
        res.json({ message: 'Insumo deletado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar insumo' });
    }
});

// --- ROTAS DE PRODUTOS ---
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            include: { fichaTecnica: true },
            orderBy: { nome: 'asc' }
        });
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.post('/api/produtos', async (req, res) => {
    try {
        // ATUALIZADO: Recebendo 'precoPromocional'
        const { nome, preco, categoria, fichaTecnica, precoPromocional } = req.body;

        const novo = await prisma.produto.create({
            data: {
                nome,
                preco: Number(preco),
                // Se vier valor, salva número, se não, salva null
                precoPromocional: precoPromocional ? Number(precoPromocional) : null,
                categoria,
                fichaTecnica: {
                    create: fichaTecnica.map((item: any) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade)
                    }))
                }
            },
            include: { fichaTecnica: true }
        });
        res.json(novo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    // ATUALIZADO: Recebendo 'precoPromocional'
    const { nome, preco, categoria, fichaTecnica, precoPromocional } = req.body;

    try {
        const atualizado = await prisma.produto.update({
            where: { id: Number(id) },
            data: {
                nome,
                preco: Number(preco),
                precoPromocional: precoPromocional ? Number(precoPromocional) : null,
                categoria,
                fichaTecnica: {
                    deleteMany: {}, // Limpa ficha antiga
                    create: fichaTecnica.map((item: any) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade)
                    }))
                }
            },
            include: { fichaTecnica: true }
        });
        res.json(atualizado);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteFicha = prisma.fichaTecnica.deleteMany({
            where: { produtoId: Number(id) }
        });
        const deleteProduto = prisma.produto.delete({
            where: { id: Number(id) }
        });

        await prisma.$transaction([deleteFicha, deleteProduto]);

        res.json({ message: 'Produto deletado' });
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { cliente, telefone, canal, valor, itens } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx: any) => {
            const novoPedido = await tx.pedido.create({
                data: {
                    cliente,
                    telefone,
                    canal,
                    status: 'Novo',
                    valor: Number(valor),
                    itens: {
                        create: itens.map((item: any) => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade
                        }))
                    }
                },
                include: { itens: true }
            });

            // Baixa de Estoque
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
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const devolverEstoque = req.query.devolverEstoque === 'true';

    try {
        await prisma.$transaction(async (tx: any) => {
            if (devolverEstoque) {
                const pedido = await tx.pedido.findUnique({
                    where: { id: Number(id) },
                    include: { itens: true }
                });

                if (pedido) {
                    for (const itemPedido of pedido.itens) {
                        const produto = await tx.produto.findUnique({
                            where: { id: itemPedido.produtoId },
                            include: { fichaTecnica: true }
                        });

                        if (produto && produto.fichaTecnica) {
                            for (const insumoFicha of produto.fichaTecnica) {
                                const qtdDevolver = insumoFicha.quantidade * itemPedido.quantidade;
                                await tx.insumo.update({
                                    where: { id: insumoFicha.insumoId },
                                    data: { estoque: { increment: qtdDevolver } }
                                });
                            }
                        }
                    }
                }
            }

            await tx.itemPedido.deleteMany({ where: { pedidoId: Number(id) } });
            await tx.pedido.delete({ where: { id: Number(id) } });
        });

        res.json({ message: 'Pedido deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
});

// --- ROTAS DE CLIENTES ---
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' }});
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const novoCliente = await prisma.cliente.create({ data: req.body });
        res.json(novoCliente);
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.cliente.delete({ where: { id: Number(id) } });
        res.json({ message: 'Cliente deletado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
});

app.listen(PORT, '0.0.0.0', () => { // Adicionei '0.0.0.0' para aceitar conexões externas
    console.log(`✅ Servidor Backend rodando na porta ${PORT}`);
});