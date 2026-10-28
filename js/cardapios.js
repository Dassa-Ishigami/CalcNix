
const cNomeCard = document.getElementById("nomeCardapio");
const bCriar = document.getElementById("criarCardapio");
const pnnCardapios = document.getElementById("pannelCardapio");


bCriar.addEventListener("click", async () => {

    const nome = cNomeCard.value.trim();

    
    if (!nome) {
        alert("Nomeie o cardápio.")
        return;
    }

    try {
        const anwser = await fetch("/api/cardapios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nome
            })
        });

        const dadosCard = await anwser.json();

        if (!anwser.ok) {
            alert(dadosCard.erro || "Não foi possível criar o cardápio");
            return;
        }

        alert("Cardápio criado com sucesso!");

        cNomeCard.value = "";

        await carregarCardapios();

    } catch (erro) {
        console.error("Erro ao criar cardápio:", erro);
        alert("Sem conexão com o servidor");
    }
});

function exibeCard(cardapios) {
    pnnCardapios.querySelectorAll(".card-item").forEach(item => {
        item.remove();
    });

    const modelCard = document.getElementById("modelCardapio");

    if (!modelCard) {
        console.error("Template não encontrado.");
        return;
    }

    cardapios.forEach(cardapio => {
        const copiaCard = modelCard.content.cloneNode(true);

        copiaCard.querySelector(".cardapio-nome").textContent = cardapio.nome;

        pnnCardapios.appendChild(copiaCard);
    });
}

async function carregarCardapios() {
    try {
        const anwser = await fetch("/api/cardapios", {
            credentials: "include"
        });

        if (!anwser.ok) {
            throw new Error("Não foi possível carregar os cardápios.");
        }

        const cardapios = await anwser.json();
        exibeCard(cardapios);
    } catch (erro) {
        console.error("Erro ao carregar cardápios:", erro);
    }
}

carregarCardapios();