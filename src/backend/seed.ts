import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando a população FINAL (80 Itens) do Banco de Dados...');

    // 1. LIMPEZA TOTAL
    await prisma.itemPedido.deleteMany({});
    await prisma.pedido.deleteMany({});
    await prisma.fichaTecnica.deleteMany({});
    await prisma.produto.deleteMany({});
    await prisma.insumo.deleteMany({});
    console.log('🧹 Banco limpo.');

    // --- 2. INSUMOS ---
    const insumos = [
        { nome: 'Gás P13', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Gás maçarico', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Bombril', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Esponja louça', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Detergente', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Sabão em pó', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Clorofila', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Desinfetante', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Desingordurante', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Álcool', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Saco de lixo 100lts', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Saco de lixo 15lts', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Papel toalha', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Papel higiênico', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Grampo', categoria: 'Cozinha', unidade: 'un' },
        { nome: 'Rolo perflex', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Rolo insulfilme', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Molheira', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Hashi (Estoque)', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Saco Porção 1kg', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Saco kraft grande', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Saco kraft pequeno', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Embalagem termica HF04', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Embalagem térmica HF05', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Embalagem Poke', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Caixa sushi Grande', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Caixa sushi média', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Caixa sushi pequena', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Potinho porção', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Bobina impressora', categoria: 'Embalagens', unidade: 'un' },
        { nome: 'Salmão', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Kani', categoria: 'Insumos', unidade: 'un' },
        { nome: 'Camarão', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Cream cheese', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Alga Nori', categoria: 'Insumos', unidade: 'un' },
        { nome: 'Shoyu sachê (Estoque)', categoria: 'Insumos', unidade: 'un' },
        { nome: 'Tarê sachê (Estoque)', categoria: 'Insumos', unidade: 'un' },
        { nome: 'Tarê galão 5L', categoria: 'Insumos', unidade: 'L' },
        { nome: 'Geleia Pimenta 5L', categoria: 'Insumos', unidade: 'L' },
        { nome: 'Hondashi', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Gergelim mix', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Gengibre (Estoque)', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Wasabi (Estoque)', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Farinha trigo', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Açúcar', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Arroz japonês', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Tempero arroz', categoria: 'Insumos', unidade: 'L' },
        { nome: 'Farinha Panko', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Azeite', categoria: 'Insumos', unidade: 'L' },
        { nome: 'Chocolate forneavel', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Café', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Erva mate', categoria: 'Insumos', unidade: 'kg' },
        { nome: 'Morango', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Banana', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Cebolinha', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Alho Poró', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Couve', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Batata doce', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Limão', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Alface', categoria: 'Hortifruti', unidade: 'un' },
        { nome: 'Pepino japonês', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Cebola roxa', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Manga', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Abacate', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Tomate cereja', categoria: 'Hortifruti', unidade: 'kg' },
        { nome: 'Água com gás (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Águas sem gás (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Coca lata (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Coca lata zero (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Guaraná lata (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Guaraná lata zero (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Coca 2 litros (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Coca zero 2 litros (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Guaraná 2 litros (Estoque)', categoria: 'Bebidas', unidade: 'un' },
        { nome: 'Guaraná zero 2 litros (Estoque)', categoria: 'Bebidas', unidade: 'un' },
    ];

    console.log(`📦 Criando ${insumos.length} insumos...`);
    for (const item of insumos) {
        await prisma.insumo.create({
            data: {
                nome: item.nome,
                categoria: item.categoria,
                unidade: item.unidade,
                estoque: 0,
                estoqueMinimo: 5
            }
        });
    }

// --- 3. PRODUTOS (Cardápio Oficial - 73 Itens - Português Corrigido) ---
    const produtos = [
        // --- CATEGORIA: COMBOS MAIS PEDIDOS ---
        { nome: 'TAKASHI 68', preco: 99.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 104', preco: 154.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 110 (FAMÍLIA)', preco: 169.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 38', preco: 119.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 30 (+1 TEMAKI)', preco: 99.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 40', preco: 119.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 42', preco: 124.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI IDEAL (70 PEÇAS E LÂMINAS)', preco: 139.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 70', preco: 144.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'TAKASHI 72', preco: 149.90, categoria: 'COMBOS MAIS PEDIDOS' },
        { nome: 'COMBO HOT ESPECIAL 2.0 (30 PEÇAS)', preco: 69.90, categoria: 'COMBOS MAIS PEDIDOS' },

        // --- CATEGORIA: COMBOS PREMIUM ---
        { nome: 'TAKASHI EBI TEN 52 PEÇAS (CAMARÃO)', preco: 209.90, categoria: 'COMBOS PREMIUM' },
        { nome: 'COMBO CASAL 56 PEÇAS', preco: 169.90, categoria: 'COMBOS PREMIUM' },
        { nome: 'COMBO DO CHEFE 64 PEÇAS', preco: 199.90, categoria: 'COMBOS PREMIUM' },
        { nome: 'TAKASHI 80 SALMÃO', preco: 189.90, categoria: 'COMBOS PREMIUM' },
        { nome: 'COMBO GUNKAN 20 PEÇAS', preco: 129.90, categoria: 'COMBOS PREMIUM' },

        // --- CATEGORIA: COMBOS PARA 1 PESSOA ---
        { nome: 'TAKASHI ALASKA (40 PEÇAS)', preco: 89.90, categoria: 'COMBOS PARA 1 PESSOA' },
        { nome: 'TAKASHI SÓ SALMÃO (38 PEÇAS)', preco: 139.90, categoria: 'COMBOS PARA 1 PESSOA' },

        // --- CATEGORIA: PORÇÕES DE SUSHI ---
        { nome: 'DRAGON EBI TEN 5 PEÇAS CAMARÃO', preco: 39.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'GUNKAN EBI TEN 5 PEÇAS CAMARÃO', preco: 29.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'URAMAKI FILA 10 PEÇAS', preco: 34.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'URAMAKI SALMÃO 10 PEÇAS', preco: 34.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'URAMAKI SALAD (GRELHADO) 10 PEÇAS', preco: 34.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'URAMAKI SKIN 10 PEÇAS', preco: 29.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'URAMAKI ALASKA 10 PEÇAS', preco: 32.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'HOSSOMAKI FILA 10 PEÇAS', preco: 29.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'HOSSOMAKI SALMÃO 10 PEÇAS', preco: 29.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'HOSSOMAKI SKIN 10 PEÇAS', preco: 24.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'HOSSOMAKI KANI 10 PEÇAS', preco: 24.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'HOSSOMAKI PEPINO 10 PEÇAS', preco: 24.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'GUNKAN ALASKA 5 PEÇAS', preco: 17.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'GUNKAN SALMÃO 5 PEÇAS', preco: 29.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'SASHIMI 10 PEÇAS', preco: 54.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'NIGUIRI SALMÃO 5 PEÇAS', preco: 19.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'NIGUIRI SKIN 5 PEÇAS', preco: 17.90, categoria: 'PORÇÕES DE SUSHI' },
        { nome: 'NIGUIRI KANI 5 PEÇAS', preco: 17.90, categoria: 'PORÇÕES DE SUSHI' },

        // --- CATEGORIA: TEMAKIS ---
        { nome: 'TEMAKI CAMARÃO/SALMÃO', preco: 39.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI FILA', preco: 34.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI SALMÃO', preco: 34.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI HOT', preco: 39.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI SALMÃO SKIN', preco: 31.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI SKIN', preco: 28.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI KANI', preco: 24.90, categoria: 'TEMAKIS' },
        { nome: 'TEMAKI ALASKA', preco: 29.90, categoria: 'TEMAKIS' },

        // --- CATEGORIA: BOLINHOS DE SALMÃO TAKASHI ---
        { nome: '4 BOLINHOS DE SALMÃO E CEBOLINHA', preco: 24.90, categoria: 'BOLINHOS DE SALMÃO TAKASHI' },

        // --- CATEGORIA: POKES TAKASHI ---
        { nome: 'POKE SAMURAI', preco: 59.90, categoria: 'POKES TAKASHI' },
        { nome: 'POKE FUJI', preco: 54.90, categoria: 'POKES TAKASHI' },
        { nome: 'POKE HAVAÍ CROCANTE', preco: 64.90, categoria: 'POKES TAKASHI' },
        { nome: 'POKE VEGETARIANO', preco: 44.90, categoria: 'POKES TAKASHI' },

        // --- CATEGORIA: BIG HOTS TAKASHI ---
        { nome: 'BIG HOT SALAD', preco: 49.90, categoria: 'BIG HOTS TAKASHI' },
        { nome: 'BIG HOT SALMÃO/ALHO PORÓ/CEBOLA RX', preco: 49.90, categoria: 'BIG HOTS TAKASHI' },

        // --- CATEGORIA: PORÇÕES HOT ROLL ---
        { nome: 'HOT ROLL FILADÉLFIA 10 PEÇAS', preco: 19.90, categoria: 'PORÇÕES HOT ROLL' },
        { nome: 'HOT ROLL FILADÉLFIA 20 PEÇAS', preco: 38.90, categoria: 'PORÇÕES HOT ROLL' },
        { nome: 'HOT ROLL FILADÉLFIA 30 PEÇAS', preco: 49.90, categoria: 'PORÇÕES HOT ROLL' },
        { nome: 'HOT EBI CAMARÃO 10 PEÇAS', preco: 34.90, categoria: 'PORÇÕES HOT ROLL' },
        { nome: 'HOT ROLL DOCE MORANGO/CHOCOLATE', preco: 24.90, categoria: 'PORÇÕES HOT ROLL' },
        { nome: 'HOT ROLL DOCE BANANA/CHOCOLATE', preco: 24.90, categoria: 'PORÇÕES HOT ROLL' },

        // --- CATEGORIA: BEBIDAS ---
        { nome: 'COCA COLA 2L', preco: 18.00, categoria: 'BEBIDAS' },
        { nome: 'COCA COLA ZERO 2L', preco: 18.00, categoria: 'BEBIDAS' },
        { nome: 'GUARANÁ 2L', preco: 13.00, categoria: 'BEBIDAS' },
        { nome: 'GUARANÁ ZERO 2L', preco: 13.00, categoria: 'BEBIDAS' },
        { nome: 'COCA COLA LATA', preco: 6.00, categoria: 'BEBIDAS' },
        { nome: 'GUARANÁ LATA', preco: 5.00, categoria: 'BEBIDAS' },
        { nome: 'GUARANÁ ZERO LATA', preco: 5.00, categoria: 'BEBIDAS' },
        { nome: 'ÁGUA SEM GÁS 500ML', preco: 5.00, categoria: 'BEBIDAS' },
        { nome: 'ÁGUA COM GÁS 500ML', preco: 5.00, categoria: 'BEBIDAS' },

        // --- CATEGORIA: ACOMPANHAMENTOS ---
        { nome: 'Geleia de pimenta potinho', preco: 5.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'Salada sunomono potinho', preco: 5.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'Shoyu mitsuwa 5 unidades', preco: 5.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'Tarê mitsuwa 5 unidades', preco: 5.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'Shoyu mitsuwa light 5 unidades', preco: 5.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'GENGIBRE/WASABI GRÁTIS', preco: 0.00, categoria: 'ACOMPANHAMENTOS' },
        { nome: 'PAR DE HASHI', preco: 1.00, categoria: 'ACOMPANHAMENTOS' },
    ];

    console.log(`🍣 Criando ${produtos.length} produtos...`);
    for (const prod of produtos) {
        await prisma.produto.create({
            data: {
                nome: prod.nome,
                preco: prod.preco,
                categoria: prod.categoria
            }
        });
    }

    console.log('✅ Dados inseridos com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });