"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var insumos, _i, insumos_1, item, produtos, _a, produtos_1, prod;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Iniciando a população FINAL (80 Itens) do Banco de Dados...');
                    // 1. LIMPEZA TOTAL
                    return [4 /*yield*/, prisma.itemPedido.deleteMany({})];
                case 1:
                    // 1. LIMPEZA TOTAL
                    _b.sent();
                    return [4 /*yield*/, prisma.pedido.deleteMany({})];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, prisma.fichaTecnica.deleteMany({})];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, prisma.produto.deleteMany({})];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, prisma.insumo.deleteMany({})];
                case 5:
                    _b.sent();
                    console.log('🧹 Banco limpo.');
                    insumos = [
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
                    console.log("\uD83D\uDCE6 Criando ".concat(insumos.length, " insumos..."));
                    _i = 0, insumos_1 = insumos;
                    _b.label = 6;
                case 6:
                    if (!(_i < insumos_1.length)) return [3 /*break*/, 9];
                    item = insumos_1[_i];
                    return [4 /*yield*/, prisma.insumo.create({
                            data: {
                                nome: item.nome,
                                categoria: item.categoria,
                                unidade: item.unidade,
                                estoque: 0,
                                estoqueMinimo: 5
                            }
                        })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    produtos = [
                        // --- LINHA TAKASHI (6) ---
                        { nome: 'TAKASHI 68', preco: 99.90, categoria: 'Combos' },
                        { nome: 'TAKASHI 104', preco: 154.90, categoria: 'Combos' },
                        { nome: 'TAKASHI 110 (FAMILIA)', preco: 169.90, categoria: 'Combos' },
                        { nome: 'TAKASHI 38', preco: 119.90, categoria: 'Combos' },
                        { nome: 'TAKASHI 30 (+1 TEMAKI)', preco: 99.90, categoria: 'Combos' },
                        { nome: 'TAKASHI 40', preco: 119.90, categoria: 'Combos' },
                        // --- DESCARTÁVEIS (5) ---
                        { nome: 'Sachê tarê', preco: 1.25, categoria: 'Descartáveis' },
                        { nome: 'Molho shoyuo', preco: 1.25, categoria: 'Descartáveis' },
                        { nome: 'Whasabi (Extra)', preco: 1.00, categoria: 'Descartáveis' },
                        { nome: 'Gengibre (Extra)', preco: 1.00, categoria: 'Descartáveis' },
                        { nome: 'Hashi (Extra)', preco: 0.50, categoria: 'Descartáveis' },
                        // --- PRATOS QUENTES (10) - Estavam no HTML ---
                        { nome: 'Yakisoba mista grande', preco: 29.90, categoria: 'Pratos Quentes' },
                        { nome: 'Yakisoba mista pequeno', preco: 25.00, categoria: 'Pratos Quentes' },
                        { nome: 'Yakisoba de carne grande', preco: 28.00, categoria: 'Pratos Quentes' },
                        { nome: 'Yakisoba de carne pequena', preco: 26.00, categoria: 'Pratos Quentes' },
                        { nome: 'Yakisoba pequeno de frango', preco: 24.00, categoria: 'Pratos Quentes' },
                        { nome: 'Yakisoba grande de frango', preco: 27.90, categoria: 'Pratos Quentes' },
                        { nome: 'Berinjela recheada', preco: 10.00, categoria: 'Pratos Quentes' },
                        { nome: 'Filé de salmão grelhado', preco: 40.00, categoria: 'Pratos Quentes' },
                        { nome: 'Porção de shimeji', preco: 28.00, categoria: 'Pratos Quentes' },
                        { nome: 'Sopa de missô', preco: 14.00, categoria: 'Pratos Quentes' },
                        // --- COMBOS (15) ---
                        { nome: 'Combo 1 (1 Temaki + 12 Hot)', preco: 49.00, categoria: 'Combos' },
                        { nome: 'Combo 2 (2 Temaki + 12 Hot)', preco: 68.00, categoria: 'Combos' },
                        { nome: 'Combo 3 (28 unidades)', preco: 74.90, categoria: 'Combos' },
                        { nome: 'Combo 4 (32 unidades)', preco: 70.00, categoria: 'Combos' },
                        { nome: 'Combo 5 (20 unidades)', preco: 50.00, categoria: 'Combos' },
                        { nome: 'Combo 6', preco: 75.00, categoria: 'Combos' },
                        { nome: 'Combo 7 Executivo', preco: 66.00, categoria: 'Combos' },
                        { nome: 'Combo 9 (18 un + 2 Temaki)', preco: 65.00, categoria: 'Combos' },
                        { nome: 'Combo 10 (32 un + 2 Temaki)', preco: 95.00, categoria: 'Combos' },
                        { nome: 'Combo de 80 unidades', preco: 130.00, categoria: 'Combos' },
                        { nome: 'Combo 16 unidades', preco: 35.00, categoria: 'Combos' },
                        { nome: 'Combo economico 20 unidades', preco: 39.90, categoria: 'Combos' },
                        { nome: 'Combo 28 unidades', preco: 60.00, categoria: 'Combos' },
                        { nome: 'Combo 52 unidades', preco: 89.90, categoria: 'Combos' },
                        { nome: 'Mini barca + 2 temaki', preco: 67.00, categoria: 'Combos' },
                        // --- TEMAKIS (12) ---
                        { nome: 'Temaki skin', preco: 27.00, categoria: 'Temakis' },
                        { nome: 'Temaki de salmão crú completo', preco: 31.00, categoria: 'Temakis' },
                        { nome: 'Temaki de camarão cozido', preco: 37.00, categoria: 'Temakis' },
                        { nome: 'Temaki de camarão empanado', preco: 38.00, categoria: 'Temakis' },
                        { nome: 'Temaki de salmão empanado', preco: 30.00, categoria: 'Temakis' },
                        { nome: 'Temaki de salmão grelhado', preco: 31.00, categoria: 'Temakis' },
                        { nome: 'Temaki Califórnia', preco: 28.00, categoria: 'Temakis' },
                        { nome: 'Temaki hot holl', preco: 29.90, categoria: 'Temakis' },
                        { nome: 'Temaki mexicano', preco: 33.00, categoria: 'Temakis' },
                        { nome: 'Temaki no copo', preco: 34.90, categoria: 'Temakis' },
                        { nome: 'Temaki de salmão com shimeji', preco: 33.00, categoria: 'Temakis' },
                        { nome: 'Temaki de shimeji', preco: 28.00, categoria: 'Temakis' },
                        // --- POKES (4) ---
                        { nome: 'Poke misto', preco: 35.00, categoria: 'Pokes' },
                        { nome: 'Poke abacate', preco: 43.00, categoria: 'Pokes' },
                        { nome: 'Poke de camarão', preco: 45.00, categoria: 'Pokes' },
                        { nome: 'Poke cream cheese', preco: 43.00, categoria: 'Pokes' },
                        // --- PORÇÕES (4) ---
                        { nome: 'Porção de ceviche de salmão', preco: 45.00, categoria: 'Porções' },
                        { nome: 'Porção de carpaccio de salmão', preco: 39.90, categoria: 'Porções' },
                        { nome: 'Sashimi de salmão (12 un)', preco: 39.90, categoria: 'Porções' },
                        { nome: 'Sashimi de salmão (6 un)', preco: 36.00, categoria: 'Porções' },
                        // --- HOT HOLL (8) - Recuperados ---
                        { nome: 'Hot Eby Roll (4 un)', preco: 29.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Mix (10 un)', preco: 29.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Philadelfia (10 un)', preco: 29.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Philadelphia Especial (10 un)', preco: 34.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Shake (6 un)', preco: 34.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Shiromi (6 un)', preco: 34.00, categoria: 'Hot Holl' },
                        { nome: 'Hot Uramaki (10 un)', preco: 29.00, categoria: 'Hot Holl' },
                        { nome: 'Shake Aguê (4 un)', preco: 29.00, categoria: 'Hot Holl' },
                        // --- HARUMAKI (2) - Recuperados ---
                        { nome: 'Harumaki Peixe (2 un)', preco: 15.00, categoria: 'Entradas' },
                        { nome: 'Harumaki Queijo (2 un)', preco: 15.00, categoria: 'Entradas' },
                        // --- GUIOZA (1) - Recuperado ---
                        { nome: 'Guioza de Lombo (4 un)', preco: 25.00, categoria: 'Entradas' },
                        // --- ENTRADAS EXTRAS (3) - Recuperados ---
                        { nome: 'Sunomono', preco: 18.00, categoria: 'Entradas' },
                        { nome: 'Isca de Peixe', preco: 35.00, categoria: 'Entradas' },
                        { nome: 'Garrafa Saquê Nacional', preco: 45.00, categoria: 'Bebidas' },
                        // --- BEBIDAS (10) ---
                        { nome: 'Água com gás', preco: 5.00, categoria: 'Bebidas' },
                        { nome: 'Águas sem gás', preco: 5.00, categoria: 'Bebidas' },
                        { nome: 'Coca lata', preco: 7.00, categoria: 'Bebidas' },
                        { nome: 'Coca lata zero', preco: 7.00, categoria: 'Bebidas' },
                        { nome: 'Guaraná lata', preco: 7.00, categoria: 'Bebidas' },
                        { nome: 'Guaraná lata zero', preco: 7.00, categoria: 'Bebidas' },
                        { nome: 'Coca 2 litros', preco: 18.00, categoria: 'Bebidas' },
                        { nome: 'Coca zero 2 litros', preco: 18.00, categoria: 'Bebidas' },
                        { nome: 'Guaraná 2 litros', preco: 16.00, categoria: 'Bebidas' },
                        { nome: 'Guaraná zero 2 litros', preco: 16.00, categoria: 'Bebidas' },
                    ];
                    console.log("\uD83C\uDF63 Criando ".concat(produtos.length, " produtos..."));
                    _a = 0, produtos_1 = produtos;
                    _b.label = 10;
                case 10:
                    if (!(_a < produtos_1.length)) return [3 /*break*/, 13];
                    prod = produtos_1[_a];
                    return [4 /*yield*/, prisma.produto.create({
                            data: {
                                nome: prod.nome,
                                preco: prod.preco,
                                categoria: prod.categoria
                            }
                        })];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log('✅ Dados inseridos com sucesso!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
