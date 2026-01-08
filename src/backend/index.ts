import 'dotenv/config';
console.log("🔥🔥🔥 ESTOU RODANDO O CÓDIGO NOVO! SE NÃO APARECER ISSO, ESTÁ ERRADO! 🔥🔥🔥");
console.log("DATABASE URL USADA:", process.env.DATABASE_URL); // Vamos conferir se está no banco certo
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
    console.log("!!! --- INÍCIO DO DEBUG --- !!!");
    console.log("1. Recebi requisição para criar:", req.body.nome);

    try {
        const { nome, categoria, unidade, estoque, estoqueMinimo, preco } = req.body;
        const nomeLimpo = nome.trim();

        console.log("2. Nome limpo:", nomeLimpo);

        // Verifica conexão com o banco
        const contagem = await prisma.insumo.count();
        console.log(`3. Total de insumos no banco agora: ${contagem}`);

        // Tenta achar o duplicado
        const insumoExistente = await prisma.insumo.findFirst({
            where: {
                nome: {
                    equals: nomeLimpo,
                    mode: 'insensitive'
                }
            }
        });

        console.log("4. Resultado da busca por duplicado:", insumoExistente);

        if (insumoExistente) {
            console.log("!!! BLOQUEADO PELO CÓDIGO !!!");
            return res.status(400).json({
                error: `Já existe um insumo chamado "${insumoExistente.nome}".`
            });
        }

        console.log("5. Passou da validação, tentando salvar...");

        const novo = await prisma.insumo.create({
            data: {
                nome: nomeLimpo,
                categoria,
                unidade: unidade || 'un',
                estoque: Number(estoque),
                estoqueMinimo: Number(estoqueMinimo),
                preco: Number(preco || 0)
            }
        });

        console.log("6. Salvo com sucesso ID:", novo.id);
        res.json(novo);

    } catch (error: any) {
        console.error("!!! ERRO NO PROCESSO !!!", error);
        if (error.code === 'P2002') {
            console.log("!!! BLOQUEADO PELO BANCO DE DADOS (Unique Constraint) !!!");
            return res.status(400).json({ error: 'ERRO CRÍTICO: O Banco bloqueou duplicidade.' });
        }
        res.status(500).json({ error: 'Erro ao criar insumo' });
    }
});

app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { nome, categoria, unidade, estoque, estoqueMinimo, preco } = req.body;

        const dadosAtualizar: any = {
            categoria,
            unidade
        };

        // Se o usuário estiver tentando mudar o NOME, verificamos duplicidade
        if (nome) {
            const nomeLimpo = nome.trim();
            dadosAtualizar.nome = nomeLimpo;

            // Verifica se existe OUTRO insumo com esse nome (excluindo o próprio ID que estamos editando)
            const insumoDuplicado = await prisma.insumo.findFirst({
                where: {
                    nome: {
                        equals: nomeLimpo,
                        mode: 'insensitive'
                    },
                    NOT: {
                        id: Number(id) // Não conta ele mesmo
                    }
                }
            });

            if (insumoDuplicado) {
                return res.status(400).json({
                    error: `O nome "${nomeLimpo}" já está sendo usado por outro insumo.`
                });
            }
        }

        if (estoque !== undefined) dadosAtualizar.estoque = Number(estoque);
        if (estoqueMinimo !== undefined) dadosAtualizar.estoqueMinimo = Number(estoqueMinimo);
        if (preco !== undefined) dadosAtualizar.preco = Number(preco);

        const atualizado = await prisma.insumo.update({
            where: { id: Number(id) },
            data: dadosAtualizar
        });
        res.json(atualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar insumo' });
    }
});

app.delete('/api/insumos/categoria/:nomeCategoria', async (req, res) => {
    const { nomeCategoria } = req.params;

    try {
        // A mágica acontece aqui: $transaction
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Encontrar todos os insumos da categoria que queremos deletar
            console.log(`Buscando insumos para deletar na categoria: ${nomeCategoria}`);
            const insumosParaDeletar = await tx.insumo.findMany({
                where: { categoria: nomeCategoria },
                select: { id: true }
            });

            // Se não houver insumos, não há nada a fazer
            if (insumosParaDeletar.length === 0) {
                console.log("Nenhum insumo encontrado nesta categoria.");
                return { count: 0 };
            }

            const idsParaDeletar = insumosParaDeletar.map(i => i.id);
            console.log(`IDs a serem deletados: ${idsParaDeletar.join(', ')}`);

            // 2. Deletar todas as referências desses insumos na FichaTecnica
            console.log("Deletando referências da Ficha Técnica...");
            await tx.fichaTecnica.deleteMany({
                where: { insumoId: { in: idsParaDeletar } }
            });

            // 3. Finalmente, deletar os próprios insumos
            console.log("Deletando os insumos da categoria...");
            const deleteResult = await tx.insumo.deleteMany({
                where: { categoria: nomeCategoria }
            });

            return deleteResult;
        });

        res.json({ message: `${resultado.count} insumos da categoria '${nomeCategoria}' foram deletados com sucesso.` });

    } catch (error) {
        // Se qualquer um dos passos dentro da transação falhar, ele cairá aqui
        console.error("ERRO NA TRANSAÇÃO AO DELETAR CATEGORIA DE INSUMO:", error);
        res.status(500).json({ error: 'Erro ao deletar insumos por categoria. Verifique o log do servidor.' });
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
            include: {
                fichaTecnica: true // Isso já deve trazer a unidade se ela estiver no schema
            },
            orderBy: { nome: 'asc' }
        });
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.post('/api/produtos', async (req, res) => {
    try {
        const { nome, preco, categoria, fichaTecnica, precoPromocional } = req.body;
        const nomeLimpo = nome.trim();

        // 1. VALIDAÇÃO DE DUPLICIDADE (Antes de tentar salvar)
        const produtoExistente = await prisma.produto.findFirst({
            where: { nome: { equals: nomeLimpo, mode: 'insensitive' } }
        });

        if (produtoExistente) {
            return res.status(400).json({
                error: `Já existe um produto chamado "${produtoExistente.nome}".`
            });
        }

        // 2. CRIAÇÃO
        const novo = await prisma.produto.create({
            data: {
                nome: nomeLimpo,
                preco: Number(preco),
                precoPromocional: precoPromocional ? Number(precoPromocional) : null,
                categoria,
                fichaTecnica: {
                    create: fichaTecnica.map((item: any) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade),
                        medida: item.medida || item.unidade || 'un'
                    }))
                }
            },
            include: { fichaTecnica: true }
        });
        res.json(novo);
    } catch (error) {
        // Se a validação manual falhar, o Prisma vai barrar aqui
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto (possível duplicidade).' });
    }
});

app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, categoria, fichaTecnica, precoPromocional } = req.body;

    console.log(`[PUT] Atualizando produto ID ${id}...`);

    try {
        const atualizado = await prisma.produto.update({
            where: { id: Number(id) },
            data: {
                nome,
                preco: Number(preco),
                precoPromocional: precoPromocional ? Number(precoPromocional) : null,
                categoria,
                fichaTecnica: {
                    // 1. Limpa a ficha antiga
                    deleteMany: {},
                    // 2. Cria a nova
                    create: fichaTecnica.map((item: any) => ({
                        insumoId: Number(item.insumoId),
                        quantidade: Number(item.quantidade),
                        // BLINDAGEM: Aceita 'medida' (novo), 'unidade' (velho) ou assume 'un'
                        medida: item.medida || item.unidade || 'un'
                    }))
                }
            },
            include: { fichaTecnica: true }
        });

        console.log("✅ Produto atualizado com sucesso!");
        res.json(atualizado);

    } catch (error) {
        // AQUI VAI APARECER O ERRO REAL NO SEU TERMINAL
        console.error("❌ ERRO AO SALVAR PRODUTO:", error);
        res.status(500).json({ error: 'Erro interno ao salvar produto. Veja o terminal.' });
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