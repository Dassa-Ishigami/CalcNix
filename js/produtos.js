const cNome = document.getElementById("nomeAlimento"); // nome
const cPeso = document.getElementById("inputpeso"); // Peso
const cCusto = document.getElementById("inputpreco"); // preço
const cCaloria = document.getElementById("inputcalorias");  // calorias
const cImage = document.querySelector('.inputFoto input[type="file"]'); //imagem
const cadastrarBtn = document.querySelector(".novoAlimento .btn"); //botão
const listaProdu = document.querySelector(".placeAlimentos"); //lista 


cadastrarBtn.addEventListener("click", async () => {
    const nome = cNome.value.trim();
    const peso = cPeso.value.trim();
    const custo = cCusto.value;
    const caloria = cCaloria.value;

    if (!nome || !peso || custo === "" || caloria === "") {
        alert("Preencha todos os campos.")
        return;
    }

    try {
        const arquivo = cImage.files[0];
        let image = ""; 

        if (arquivo) {
            image = await new Promise((resolve, rejec) => {
                const leitor = new FileReader();

                leitor.onload = ()  => resolve(leitor.result);
                leitor.onerror = () => rejec(leitor.error);

                leitor.readAsDataURL(arquivo);
            });
        }

        const resposta = await fetch("/api/produtos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nome,
                peso,
                custo,
                caloria,
                image
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || "Não foi possível cadastrarBtn o produto.");
            return;
        }

        alert("Produto cadastrado com sucesso!");

        cNome.value = "";
        cPeso.value = "";
        cCusto.value = "";
        cCaloria.value = "";

        await carregarPro();

    } catch (erro) {
        console.error("Erro ao cadastrar produto:", erro);
        alert("Sem conexão com o servidor");
    }
});

function exibePro(produtos) {
    listaProdu.querySelectorAll(".produto-item").forEach(item => {
        item.remove();
    });

    const model = document.getElementById("modelProd");

    produtos.forEach(produto => {
        const copia = model.content.cloneNode(true);

        copia.querySelector(".produto-nome").textContent = produto.nome;
        copia.querySelector(".produto-peso").textContent = `Peso: ${produto.peso}`;
        copia.querySelector(".produto-custo").textContent = `Custo: R$ ${Number(produto.custo).toFixed(2)}`;
        copia.querySelector(".produto-caloria").textContent = `Caloria: ${Number(produto.caloria)}`;

        const img = copia.querySelector(".produto-imagem");

        if (produto.image) {
            img.src = produto.image;
            img.hidden = false;
        }

        listaProdu.appendChild(copia);
    });
}

async function carregarPro() {
    try {
        const resposta = await fetch("/api/produtos", {
            credentials: "include"
        });

        if (!resposta.ok) {
            throw new Error("Falha ao carregar produtos.");
        }

        const produtos = await resposta.json();
        exibePro(produtos);

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

carregarPro();