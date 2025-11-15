import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- TIPOS DE DADOS ---
interface Pedido { id: number; cliente: string; canal: string; status: string; valor: number; }
interface Cliente { id: number; nome: string; telefone: string; cep: string; logradouro: string; numero: string; bairro: string; cidade: string; uf: string; complemento?: string; }
interface Insumo { id: number; nome: string; unidade: 'g' | 'ml' | 'un'; }
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: { insumoId: number; quantidade: number; }[]; }

// --- BANCO DE DADOS FALSO ---

const mockPedidos: Pedido[] = [
    { id: 101, cliente: 'Ana Silva', canal: 'iFood', status: 'Em Preparo', valor: 95.50 },
    { id: 102, cliente: 'Bruno Costa', canal: 'WhatsApp', status: 'Aguardando Confirmação', valor: 78.00 },
];

let mockClientes: Cliente[] = [
    { id: 1, nome: 'Ana Silva', telefone: '(11) 98765-4321', cep: '01001-000', logradouro: 'Praça da Sé', numero: '123', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', complemento: 'Apto 10' },
    { id: 2, nome: 'Bruno Costa', telefone: '(21) 91234-5678', cep: '20040-001', logradouro: 'Avenida Rio Branco', numero: '456', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ', complemento: '' },
];

const mockInsumos: Insumo[] = [
    { id: 1, nome: 'Salmão', unidade: 'g' },
    { id: 2, nome: 'Arroz de Sushi', unidade: 'g' },
    { id: 3, nome: 'Alga Nori', unidade: 'un' },
    { id: 4, nome: 'Cream Cheese', unidade: 'g' },
    { id: 5, nome: 'Shoyu', unidade: 'ml' },
];

let mockProdutos: Produto[] = [
    // COMBOS MAIS PEDIDOS
    { id: 1, nome: "TAKASHI 38", preco: 119.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 2, nome: "TAKASHI 30 (+1 TEMAKI)", preco: 99.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 3, nome: "TAKASHI 40", preco: 119.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 4, nome: "TAKASHI 42", preco: 124.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 5, nome: "TEMAKI SALMÃO PHILADELPHIA", preco: 28.90, categoria: "TEMAKIS", fichaTecnica: [
            { insumoId: 1, quantidade: 100 }, // 100g de Salmão
            { insumoId: 2, quantidade: 80 },  // 80g de Arroz
            { insumoId: 3, quantidade: 1 },   // 1un de Nori
            { insumoId: 4, quantidade: 30 },  // 30g de Cream Cheese
        ] },
    { id: 6, nome: "TAKASHI IDEAL (70 PEÇAS E LÂMINAS)", preco: 139.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 7, nome: "TAKASHI 70", preco: 144.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 8, nome: "URAMAKI PHILADELPHIA (8 pçs)", preco: 27.90, categoria: "SUSHIS ESPECIAIS", fichaTecnica: [
            { insumoId: 1, quantidade: 40 }, // 40g de Salmão
            { insumoId: 2, quantidade: 100 },// 100g de Arroz
            { insumoId: 3, quantidade: 0.5 },// 0.5un de Nori
            { insumoId: 4, quantidade: 20 }, // 20g de Cream Cheese
        ] },
    { id: 9, nome: "TAKASHI 104", preco: 154.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 10, nome: "TAKASHI 110 (FAMILIA)", preco: 169.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },
    { id: 11, nome: "COMBO HOT ESPECIAL 2.0 (30 PEÇAS)", preco: 69.90, categoria: "COMBOS MAIS PEDIDOS", fichaTecnica: [] },

    // COMBOS PREMIUM
    { id: 12, nome: "TAKASHI EBI TEN 52 PEÇAS (CAMARÃO )", preco: 209.90, categoria: "COMBOS PREMIUM", fichaTecnica: [] },
    { id: 13, nome: "COMBO CASAL 56 PEÇAS", preco: 169.90, categoria: "COMBOS PREMIUM", fichaTecnica: [] },
    { id: 14, nome: "COMBO DO CHEFE 64 PEÇAS", preco: 199.90, categoria: "COMBOS PREMIUM", fichaTecnica: [] },
    { id: 15, nome: "TAKASHI 80 SALMÃO", preco: 189.90, categoria: "COMBOS PREMIUM", fichaTecnica: [] },
    { id: 16, nome: "COMBO GUNAKAN 20 PEÇAS", preco: 129.90, categoria: "COMBOS PREMIUM", fichaTecnica: [] },

    // COMBOS PARA 1 PESSOA
    { id: 17, nome: "TAKASHI ALASKA (40 peças)", preco: 89.90, categoria: "COMBOS PARA 1 PESSOA", fichaTecnica: [] },
    { id: 18, nome: "TAKASHI SÓ SALMÃO (38 PEÇAS)", preco: 139.90, categoria: "COMBOS PARA 1 PESSOA", fichaTecnica: [] },

    // PORÇOES DE SUSHI
    { id: 19, nome: "DRAGON EBI TEN 5 PEÇAS CAMARÃO", preco: 39.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 20, nome: "GUNKAN EBI TEN 5 PEÇAS CAMARÃO", preco: 29.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 21, nome: "URAMAKI FILA 10 PEÇAS", preco: 34.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 22, nome: "URAMAKI SALMAO 10 PEÇAS", preco: 34.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 23, nome: "URAMAKI SALAD (GRELHADO) 10 PEÇAS", preco: 34.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 24, nome: "URAMAKI SKIN 10 PEÇAS", preco: 29.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 25, nome: "URAMAKI ALASCA 10 PEÇAS", preco: 32.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 26, nome: "HOSSOMAKI FILA 10 PEÇAS", preco: 29.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 27, nome: "HOSSOMAKI SALMAO 10 PEÇAS", preco: 29.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 28, nome: "HOSSOMAKI SKIN 10 PEÇAS", preco: 24.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 29, nome: "HOSSOMAKI KANI 10 PEÇAS", preco: 24.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 30, nome: "HOSSOMAKI PEPINO 10 PEÇAS", preco: 24.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 31, nome: "GUNKAN ALASCA 5 PEÇAS", preco: 17.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 32, nome: "GUNKAN SALMAO 5 PEÇAS", preco: 29.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 33, nome: "SASHIMI 10 PEÇAS", preco: 54.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 34, nome: "NIGUIRI SALMAO 5 PEÇAS", preco: 19.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 35, nome: "NIGUIRI SKIN 5 PEÇAS", preco: 17.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },
    { id: 36, nome: "NIGUIRI KANI 5 PEÇAS", preco: 17.90, categoria: "PORÇOES DE SUSHI", fichaTecnica: [] },

    // TEMAKIS
    { id: 37, nome: "TEMAKI CAMARÃO/SALMÃO", preco: 39.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 38, nome: "TEMAKI FILA", preco: 34.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 39, nome: "TEMAKI SALMAO", preco: 34.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 40, nome: "TEMAKI HOT", preco: 39.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 41, nome: "TEMAKI SALMAO SKIN", preco: 31.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 42, nome: "TEMAKI SKIN", preco: 28.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 43, nome: "TEMAKI KANI", preco: 24.90, categoria: "TEMAKIS", fichaTecnica: [] },
    { id: 44, nome: "TEMAKI ALASKA", preco: 29.90, categoria: "TEMAKIS", fichaTecnica: [] },

    // BOLINHOS DE SALMÃO TAKASHI
    { id: 45, nome: "4 BOLINHOS DE SALMÃO E CEBOLINHA", preco: 24.90, categoria: "BOLINHOS DE SALMÃO TAKASHI", fichaTecnica: [] },

    // POKE'S TAKASHI
    { id: 46, nome: "POKE SAMURAI", preco: 59.90, categoria: "POKE'S TAKASHI", fichaTecnica: [] },
    { id: 47, nome: "POKE FUJI", preco: 54.90, categoria: "POKE'S TAKASHI", fichaTecnica: [] },
    { id: 48, nome: "POKE HAVAÍ CROCANTE", preco: 64.90, categoria: "POKE'S TAKASHI", fichaTecnica: [] },
    { id: 49, nome: "POKE VEGETARIANO", preco: 44.90, categoria: "POKE'S TAKASHI", fichaTecnica: [] },

    // BIG HOT'S TAKASHI
    { id: 50, nome: "BIG HOT SALAD", preco: 49.90, categoria: "BIG HOT'S TAKASHI", fichaTecnica: [] },
    { id: 51, nome: "BIG HOT SALMÃO/ALHO PORÓ/CEBOLA RX", preco: 49.90, categoria: "BIG HOT'S TAKASHI", fichaTecnica: [] },

    // PORÇOES HOTROLL
    { id: 52, nome: "HOT ROLL FILADÉLFIA 10 PEÇAS", preco: 19.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },
    { id: 53, nome: "HOT ROLL FILADÉLFIA 20 PEÇAS", preco: 38.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },
    { id: 54, nome: "HOT ROLL FILADÉLFIA 30 PEÇAS", preco: 49.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },
    { id: 55, nome: "HOT EBI CAMARÃO 10 PEÇAS", preco: 34.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },
    { id: 56, nome: "HOT ROLL DOCE MORANGO/CHOCOLATE", preco: 24.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },
    { id: 57, nome: "HOT ROLL DOCE BANANA/CHOCOLATE", preco: 24.90, categoria: "PORÇOES HOTROLL", fichaTecnica: [] },

    // BEBIDAS
    { id: 58, nome: "COCA COLA 2L", preco: 18.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 59, nome: "COCA COLA ZERO 2L", preco: 18.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 60, nome: "GUARANÁ 2L", preco: 13.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 61, nome: "GUARANÁ ZERO 2L", preco: 13.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 62, nome: "COCA COLA LATA", preco: 6.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 63, nome: "GUARANÁ LATA", preco: 5.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 64, nome: "GUARANÁ ZERO LATA", preco: 5.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 65, nome: "ÁGUA SEM GÁS 500ML", preco: 5.00, categoria: "BEBIDAS", fichaTecnica: [] },
    { id: 66, nome: "ÁGUA COM GÁS 500ML", preco: 5.00, categoria: "BEBIDAS", fichaTecnica: [] },

    // ACOMPANHAMENTOS
    { id: 67, nome: "Geleia de pimenta potinho", preco: 5.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 68, nome: "Salada sunomono potinho", preco: 5.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 69, nome: "Shoyu mitsuwa 5 unidades", preco: 5.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 70, nome: "Tarê mitsuwa 5 unidades", preco: 5.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 71, nome: "Shoyu mitsuwa light 5 unidades", preco: 5.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 72, nome: "GENGIBRE/WASSABI GRÁTIS", preco: 0.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 73, nome: "KIT GRANDE ADICIONAL", preco: 10.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] },
    { id: 74, nome: "PAR DE HASHI", preco: 1.00, categoria: "ACOMPANHAMENTOS", fichaTecnica: [] }
];


// --- ROTAS DA API ---

// Rotas de Pedidos
app.get('/api/pedidos', (_req: Request, res: Response) => res.json(mockPedidos));

// Rotas de Clientes (COMPLETAS)
app.get('/api/clientes', (_req: Request, res: Response) => res.json(mockClientes));
app.post('/api/clientes', (req: Request, res: Response) => {
    const novoCliente: Omit<Cliente, 'id'> = req.body;
    const clienteSalvo: Cliente = { ...novoCliente, id: Date.now() };
    mockClientes.push(clienteSalvo);
    res.status(201).json(clienteSalvo);
});
app.put('/api/clientes/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = mockClientes.findIndex(c => c.id === id);
    if (index !== -1) {
        mockClientes[index] = { ...mockClientes[index], ...req.body };
        res.json(mockClientes[index]);
    } else {
        res.status(404).json({ message: 'Cliente não encontrado' });
    }
});
app.delete('/api/clientes/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    mockClientes = mockClientes.filter(c => c.id !== id);
    res.status(204).send();
});

// Rotas de Insumos
app.get('/api/insumos', (_req: Request, res: Response) => res.json(mockInsumos));

// Rotas de Produtos (COMPLETAS)
app.get('/api/produtos', (_req: Request, res: Response) => res.json(mockProdutos));
app.post('/api/produtos', (req: Request, res: Response) => {
    const novoProduto: Omit<Produto, 'id'> = req.body;
    const produtoSalvo: Produto = { ...novoProduto, id: Date.now() };
    mockProdutos.push(produtoSalvo);
    res.status(201).json(produtoSalvo);
});
app.put('/api/produtos/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = mockProdutos.findIndex(p => p.id === id);
    if (index !== -1) {
        mockProdutos[index] = { ...mockProdutos[index], ...req.body };
        res.json(mockProdutos[index]);
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});
app.delete('/api/produtos/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    mockProdutos = mockProdutos.filter(p => p.id !== id);
    res.status(204).send();
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`✅ Servidor Backend está rodando em http://localhost:${port}`);
});