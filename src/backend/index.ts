import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- TIPOS DE DADOS UNIFICADOS ---
interface Pedido {
    id: number;
    cliente: string;
    telefone?: string;
    canal: 'iFood' | 'WhatsApp' | 'OlaClick' | 'Local';
    status: 'Novo' | 'Em Preparo' | 'Saiu para Entrega' | 'Entregue' | 'Cancelado';
    valor: number;
    itens: { produtoId: number; quantidade: number; nomeProduto?: string }[];
    dataHora: string;
}

interface Cliente { id: number; nome: string; telefone: string; cep: string; logradouro: string; numero: string; bairro: string; cidade: string; uf: string; complemento?: string; }
interface Insumo {
    id: number;
    nome: string;
    categoria: string;
    unidade?: 'kg' | 'g' | 'L' | 'ml' | 'un';
    estoque?: number;
    estoqueMinimo?: number;
}
interface Produto { id: number; nome: string; preco: number; categoria: string; fichaTecnica: { insumoId: number; quantidade: number; }[]; }

// --- BANCO DE DADOS FALSO ---

let mockPedidos: Pedido[] = [
    {
        id: 101,
        cliente: 'Ana Silva',
        canal: 'iFood',
        status: 'Novo',
        valor: 95.50,
        telefone: '11999999999',
        dataHora: new Date().toISOString(),
        itens: [] // Começa vazio ou com algum item de exemplo se quiser
    }
];

let mockClientes: Cliente[] = [
    { id: 1, nome: 'Ana Silva', telefone: '(11) 98765-4321', cep: '01001-000', logradouro: 'Praça da Sé', numero: '123', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', complemento: 'Apto 10' },
    { id: 2, nome: 'Bruno Costa', telefone: '(21) 91234-5678', cep: '20040-001', logradouro: 'Avenida Rio Branco', numero: '456', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ', complemento: '' },
];

let mockInsumos: Insumo[] = [
    // Cozinha
    { id: 1, nome: 'Gás P13', categoria: 'Cozinha', unidade: 'un', estoque: 2 },
    { id: 2, nome: 'Gás maçarico', categoria: 'Cozinha', unidade: 'un', estoque: 3 },
    { id: 3, nome: 'Bombril', categoria: 'Cozinha', unidade: 'un', estoque: 10 },
    { id: 4, nome: 'Esponja louça', categoria: 'Cozinha', unidade: 'un', estoque: 20 },
    { id: 5, nome: 'Detergente', categoria: 'Cozinha', unidade: 'L', estoque: 5 },
    { id: 6, nome: 'Sabão em pó', categoria: 'Cozinha', unidade: 'kg', estoque: 2 },
    { id: 7, nome: 'Clorofila', categoria: 'Cozinha', unidade: 'L', estoque: 5 },
    { id: 8, nome: 'Desinfetante', categoria: 'Cozinha', unidade: 'L', estoque: 5 },
    { id: 9, nome: 'Desingordurante', categoria: 'Cozinha', unidade: 'L', estoque: 3 },
    { id: 10, nome: 'Álcool', categoria: 'Cozinha', unidade: 'L', estoque: 5 },
    { id: 11, nome: 'Saco de lixo 100lts', categoria: 'Cozinha', unidade: 'un', estoque: 50 },
    { id: 12, nome: 'Saco de lixo 15lts', categoria: 'Cozinha', unidade: 'un', estoque: 100 },
    { id: 13, nome: 'Papel toalha', categoria: 'Cozinha', unidade: 'un', estoque: 30 },
    { id: 14, nome: 'Papel higiênico', categoria: 'Cozinha', unidade: 'un', estoque: 40 },
    { id: 15, nome: 'Grampo', categoria: 'Cozinha', unidade: 'un', estoque: 100 },

    // Embalagens
    { id: 16, nome: 'Rolo perflex', categoria: 'Embalagens', unidade: 'un', estoque: 5 },
    { id: 17, nome: 'Rolo insulfilme', categoria: 'Embalagens', unidade: 'un', estoque: 5 },
    { id: 18, nome: 'Molheira', categoria: 'Embalagens', unidade: 'un', estoque: 500 },
    { id: 19, nome: 'Hashi', categoria: 'Embalagens', unidade: 'un', estoque: 1000 },
    { id: 20, nome: 'Saco Porção 1kg', categoria: 'Embalagens', unidade: 'un', estoque: 200 },
    { id: 21, nome: 'Saco kraft grande', categoria: 'Embalagens', unidade: 'un', estoque: 300 },
    { id: 22, nome: 'Saco kraft pequeno', categoria: 'Embalagens', unidade: 'un', estoque: 300 },
    { id: 23, nome: 'Embalagem termica HF04', categoria: 'Embalagens', unidade: 'un', estoque: 150 },
    { id: 24, nome: 'Embalagem térmica HF05', categoria: 'Embalagens', unidade: 'un', estoque: 150 },
    { id: 25, nome: 'Embalagem Poke', categoria: 'Embalagens', unidade: 'un', estoque: 100 },
    { id: 26, nome: 'Caixa sushi Grande', categoria: 'Embalagens', unidade: 'un', estoque: 100 },
    { id: 27, nome: 'Caixa sushi média', categoria: 'Embalagens', unidade: 'un', estoque: 100 },
    { id: 28, nome: 'Caixa sushi pequena', categoria: 'Embalagens', unidade: 'un', estoque: 100 },
    { id: 29, nome: 'Potinho porção', categoria: 'Embalagens', unidade: 'un', estoque: 200 },
    { id: 30, nome: 'Bobina impressora', categoria: 'Embalagens', unidade: 'un', estoque: 10 },

    // Insumos
    { id: 31, nome: 'Salmão', categoria: 'Insumos', unidade: 'kg', estoque: 10 },
    { id: 32, nome: 'Kani', categoria: 'Insumos', unidade: 'kg', estoque: 2 },
    { id: 33, nome: 'Camarão', categoria: 'Insumos', unidade: 'kg', estoque: 3 },
    { id: 34, nome: 'Cream cheese', categoria: 'Insumos', unidade: 'kg', estoque: 4 },
    { id: 35, nome: 'Alga Nori', categoria: 'Insumos', unidade: 'un', estoque: 100 },
    { id: 36, nome: 'Shoyu sachê', categoria: 'Insumos', unidade: 'un', estoque: 1000 },
    { id: 37, nome: 'Tarê sachê', categoria: 'Insumos', unidade: 'un', estoque: 1000 },
    { id: 38, nome: 'Tarê galão 5L', categoria: 'Insumos', unidade: 'L', estoque: 5 },
    { id: 39, nome: 'Geleia Pimenta 5L', categoria: 'Insumos', unidade: 'L', estoque: 5 },
    { id: 40, nome: 'Hondashi', categoria: 'Insumos', unidade: 'g', estoque: 500 },
    { id: 41, nome: 'Gergelim mix', categoria: 'Insumos', unidade: 'g', estoque: 1000 },
    { id: 42, nome: 'Gengibre', categoria: 'Insumos', unidade: 'kg', estoque: 1 },
    { id: 43, nome: 'Wasabi', categoria: 'Insumos', unidade: 'g', estoque: 300 },
    { id: 44, nome: 'Farinha trigo', categoria: 'Insumos', unidade: 'kg', estoque: 5 },
    { id: 45, nome: 'Açúcar', categoria: 'Insumos', unidade: 'kg', estoque: 5 },
    { id: 46, nome: 'Arroz japonês', categoria: 'Insumos', unidade: 'kg', estoque: 25 },
    { id: 47, nome: 'Tempero arroz', categoria: 'Insumos', unidade: 'L', estoque: 5 },
    { id: 48, nome: 'Farinha Panko', categoria: 'Insumos', unidade: 'kg', estoque: 2 },
    { id: 49, nome: 'Azeite', categoria: 'Insumos', unidade: 'L', estoque: 2 },
    { id: 50, nome: 'Chocolate forneavel', categoria: 'Insumos', unidade: 'kg', estoque: 1 },
    { id: 51, nome: 'Café', categoria: 'Insumos', unidade: 'kg', estoque: 1 },
    { id: 52, nome: 'Erva mate', categoria: 'Insumos', unidade: 'kg', estoque: 1 },

    // Hortifruti
    { id: 53, nome: 'Morango', categoria: 'Hortifruti', unidade: 'kg', estoque: 1 },
    { id: 54, nome: 'Banana', categoria: 'Hortifruti', unidade: 'kg', estoque: 2 },
    { id: 55, nome: 'Cebolinha', categoria: 'Hortifruti', unidade: 'g', estoque: 500 },
    { id: 56, nome: 'Alho Poró', categoria: 'Hortifruti', unidade: 'g', estoque: 500 },
    { id: 57, nome: 'Couve', categoria: 'Hortifruti', unidade: 'un', estoque: 5 },
    { id: 58, nome: 'Batata doce', categoria: 'Hortifruti', unidade: 'kg', estoque: 2 },
    { id: 59, nome: 'Limão', categoria: 'Hortifruti', unidade: 'kg', estoque: 1 },
    { id: 60, nome: 'Alface', categoria: 'Hortifruti', unidade: 'un', estoque: 4 },
    { id: 61, nome: 'Pepino japonês', categoria: 'Hortifruti', unidade: 'kg', estoque: 2 },
    { id: 62, nome: 'Cebola roxa', categoria: 'Hortifruti', unidade: 'kg', estoque: 1 },
    { id: 63, nome: 'Manga', categoria: 'Hortifruti', unidade: 'kg', estoque: 2 },
    { id: 64, nome: 'Abacate', categoria: 'Hortifruti', unidade: 'kg', estoque: 1 },
    { id: 65, nome: 'Tomate cereja', categoria: 'Hortifruti', unidade: 'g', estoque: 500 },

    // Bebidas
    { id: 66, nome: 'Água com gás', categoria: 'Bebidas', unidade: 'un', estoque: 24 },
    { id: 67, nome: 'Águas sem gás', categoria: 'Bebidas', unidade: 'un', estoque: 24 },
    { id: 68, nome: 'Coca lata', categoria: 'Bebidas', unidade: 'un', estoque: 48 },
    { id: 69, nome: 'Coca lata zero', categoria: 'Bebidas', unidade: 'un', estoque: 24 },
    { id: 70, nome: 'Guaraná lata', categoria: 'Bebidas', unidade: 'un', estoque: 48 },
    { id: 71, nome: 'Guaraná lata zero', categoria: 'Bebidas', unidade: 'un', estoque: 24 },
    { id: 72, nome: 'Coca 2 litros', categoria: 'Bebidas', unidade: 'un', estoque: 12 },
    { id: 73, nome: 'Coca zero 2 litros', categoria: 'Bebidas', unidade: 'un', estoque: 12 },
    { id: 74, nome: 'Guaraná 2 litros', categoria: 'Bebidas', unidade: 'un', estoque: 12 },
    { id: 75, nome: 'Guaraná zero 2 litros', categoria: 'Bebidas', unidade: 'un', estoque: 12 },
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

// Rotas de Insumos (UMA ÚNICA ROTA CORRETA)
app.get('/api/insumos', (_req: Request, res: Response) => res.json(mockInsumos));

// Rota para CRIAR um novo insumo (POST)
app.post('/api/insumos', (req: Request, res: Response) => {
    // 1. Pega o ID do último insumo na lista para gerar um novo ID.
    // Se a lista estiver vazia, começa com ID 0.
    const ultimoId = mockInsumos.length > 0 ? mockInsumos[mockInsumos.length - 1].id : 0;
    const novoId = ultimoId + 1;

    // 2. Cria um objeto completo para o novo insumo, combinando:
    //    - O novo ID que acabamos de gerar.
    //    - Os dados que o frontend enviou (que estão em req.body).
    const novoInsumo: Insumo = {
        id: novoId,
        nome: req.body.nome,
        estoque: req.body.estoque,
        estoqueMinimo: req.body.estoqueMinimo,
        unidade: req.body.unidade,
        categoria: req.body.categoria
    };

    // 3. Adiciona o novo insumo ao final do nosso array 'mockInsumos'.
    mockInsumos.push(novoInsumo);

    // 4. Responde para o frontend com o status 201 (que significa "Criado com Sucesso")
    //    e envia de volta o objeto do insumo que foi salvo (agora com o ID).
    res.status(201).json(novoInsumo);
});

// Rotas de Produtos (COMPLETAS)
app.get('/api/produtos', (_req: Request, res: Response) => res.json(mockProdutos));
app.post('/api/produtos', (req: Request, res: Response) => {
    const novoProduto: Omit<Produto, 'id'> = req.body;
    const produtoSalvo: Produto = { ...novoProduto, id: Date.now() };
    mockProdutos.push(produtoSalvo);
    res.status(201).json(produtoSalvo);
});

// Rota para ATUALIZAR um insumo (PUT)
app.put('/api/insumos/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = mockInsumos.findIndex(i => i.id === id);

    if (index !== -1) {
        // Atualiza o insumo no array com os novos dados
        mockInsumos[index] = { ...mockInsumos[index], ...req.body };
        res.json(mockInsumos[index]);
    } else {
        res.status(404).json({ message: 'Insumo não encontrado' });
    }
});

// Rota para DELETAR um insumo (DELETE)
app.delete('/api/insumos/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    mockInsumos = mockInsumos.filter(i => i.id !== id);
    res.status(204).send(); // 204 significa "sucesso, sem conteúdo para retornar"
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

app.post('/api/pedidos', (req: Request, res: Response) => {
    const itensDoPedido = req.body.itens || [];

    // 1. VALIDAR E ABATER ESTOQUE
    // Vamos percorrer cada produto do pedido
    for (const item of itensDoPedido) {
        const produto = mockProdutos.find(p => p.id === item.produtoId);
        if (produto) {
            for (const ingrediente of produto.fichaTecnica) {
                const insumoNoEstoque = mockInsumos.find(i => i.id === ingrediente.insumoId);
                if (insumoNoEstoque && insumoNoEstoque.estoque !== undefined) {
                    insumoNoEstoque.estoque -= (item.quantidade * ingrediente.quantidade);
                }
            }
        }
    }

    // --- CRIAÇÃO DO PEDIDO ---
    const novoPedido: Pedido = {
        id: req.body.id || Date.now(), // O n8n pode mandar o ID do iFood se quiser
        cliente: req.body.cliente,
        telefone: req.body.telefone,
        canal: req.body.canal || 'Local',
        status: 'Novo', // Todo pedido chega como Novo
        valor: req.body.valor,
        itens: itensDoPedido,
        dataHora: new Date().toISOString()
    };

    mockPedidos.push(novoPedido);
    res.status(201).json(novoPedido);
});

// Rota para ATUALIZAR STATUS (Mover no Kanban)
app.put('/api/pedidos/:id/status', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const novoStatus = req.body.status;
    const pedido = mockPedidos.find(p => p.id === id);

    if (pedido) {
        pedido.status = novoStatus;
        res.json(pedido);
    } else {
        res.status(404).json({ message: 'Pedido não encontrado' });
    }
});

// Rota para EXCLUIR um pedido (DELETE) com opção de devolver estoque
app.delete('/api/pedidos/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    // Verificamos se o frontend mandou "true" na URL
    const devolverEstoque = req.query.devolverEstoque === 'true';

    if (devolverEstoque) {
        const pedido = mockPedidos.find(p => p.id === id);
        if (pedido) {
            console.log(`Devolvendo estoque do pedido #${id}...`);
            // Percorre os itens do pedido para devolver
            pedido.itens.forEach(itemPedido => {
                const produto = mockProdutos.find(p => p.id === itemPedido.produtoId);
                if (produto) {
                    // Percorre a receita do produto
                    produto.fichaTecnica.forEach(ingrediente => {
                        const insumo = mockInsumos.find(i => i.id === ingrediente.insumoId);
                        if (insumo && insumo.estoque !== undefined) {
                            // AQUI A MÁGICA: SOMA de volta ao estoque
                            const qtdDevolver = itemPedido.quantidade * ingrediente.quantidade;
                            insumo.estoque += qtdDevolver;
                        }
                    });
                }
            });
        }
    }

    // Remove o pedido da lista
    mockPedidos = mockPedidos.filter(p => p.id !== id);

    res.status(204).send();
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`✅ Servidor Backend está rodando em http://localhost:${port}`);
});