
const funcoes = require("../js/funcoes");
const produtos = require("../dados/produtos.json");

const API_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json";

async function calcular(idProduto) {
    try {
        // Busca valor da API do Banco Central
        const anwserAPI = await fetch(API_URL);

        if (!anwserAPI.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const dadosAPI = await anwserAPI.json();

        if (!dadosAPI.length) {
            throw new Error("A API não retornou nenhum valor.");
        }

        const valorAPI = Number(dadosAPI[0].valor);

        if (!Number.isFinite(valorAPI) || valorAPI === 0) {
            throw new Error("O valor recebido da API é inválido.");
        }

        // Busca os alimentos cadastrados
        const produtos = funcoes.readPro();

        // Localiza o produto pelo ID
        const produto = produtos.find(
            item => item.id === idProduto
        );

        if (!produto) {
            throw new Error("Produto não encontrado.");
        }

        const precoOriginal = produto.custo;
        const pesoOriginal = produto.peso;

        const preco = Number(
            String(precoOriginal ?? "").trim().replace(",", ".")
        );

        const peso = Number(
            String(pesoOriginal ?? "").trim().replace(",", ".")
        );

        if (
            !Number.isFinite(preco) ||
            !Number.isFinite(peso)
        ) {
            throw new Error("Preço ou peso inválido.");
        }

        // Calcula o resultado
        const resultado = (preco * peso) + (valorAPI**2);

        console.log("Produto:", produto.nome);
        console.log("Inflação:", valorAPI);
        console.log("Preço por kg:", `R$ ${Number(produto.custo).toFixed(2)}`);
        console.log("Peso:", peso, "kg");
        console.log("Preço Ideal:", `R$ ${Number(resultado).toFixed(2)}`);

        return resultado;

    } catch (erro) {
        console.error("Erro na calculadora:", erro.message);
    }
}

module.exports = calcular;

calcular("38eb233d-5003-4caf-99c4-ebee3bdeebb9");
