// Criando uma tabela para criar cardapios

const cNome = document.getElementById("nomeCardapio");
const bCriar = document.getElementById("criarCardapio");
const pnnCardapios = document.getElementById("pannelCardapio");

let cardapios = [];
let cardapioAtualId = null;

async function carregarCardapios() {
    try {
        const resposta = await fetch("/api/cardapios", {
            credentials: "include"
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os cardápios.");
        }

        cardapios = await resposta.json();
        showCard();

    } catch (erro) {
        console.error("Erro ao carregar cardápios:", erro);
    }
}

function showCard() {
    pnnCardapios.innerHTML = "";

    if (cardapios.length === 0) {
        pnnCardapios.textContent = "Nenhum cardápio cadastrado.";
        return;
    }

    cardapios.forEach(cardapio => {
        const item = document.createElement("div");
        const title = document.createElement("h3");
        const bSelect = document.createElement("button");
        const listaPratos = document.createElement("ul");

        title.textContent = cardapio.nome;
        bSelect.type = "button";
        bSelect.textContent = 
            cardapio.id === cardapioAtualId 
                ? "Cardápio atual" 
                : "Selecionar";
    
        bSelect.addEventListener("click", () => {
            cardapioAtualId = cardapio.id;
            showCard();
        });

        const pratos = cardapio.pratos || [];

        pratos.forEach(prato => {
            const linha = document.createElement("li");
            linha.textContent = prato.nome;
            listaPratos.appendChild(linha);
        });

        item.append(title.bSelect, listaPratos);
        pnnCardapios.appendChild(item);
    });
}

async function createCard() {
    const nome = cNome.value.trim();

    if (!nome) {
        alert("Digite o nome do cardápio.");
        cNome.focus();
        return;
    }

    try {
        const resposta = await fetch("/api/cardapios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nome,
                alimentos: []
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Não foi possível criar o cardápio."
            );
        }

        cardapios.push(dados.cardapio);
        cardapioAtualId = dados.cardapio.id;

        cNome.value = "";
        showCard();

    } catch (erro) {
        console.error("Erro ao criar cardápio:", erro);
        alert(erro.message);
    }
};

bCriar.addEventListener("click", createCard);


carregarCardapios();
