const fs = require("fs");
const path = require("path");

const pathUser = path.join(__dirname, "..", "dados", "usuarios.json");
const pathProduct = path.join(__dirname, "..", "dados", "produtos.json");
const pathCard = path.join(__dirname, "..", "dados", "cardapios.json");
const pathPlate = path.join(__dirname, "..", "dados", "pratos.json");

//Usuários
function readUser() {
    const info = fs.readFileSync(pathUser, "utf8");
    return JSON.parse(info);
}

function saveUsers(users) {
    fs.writeFileSync(
        pathUser,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

function findUserEmail(email) {
    const user = exports.readUser();
    
    return user.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );
};

// Produtos/Alimentos
function readPro() {
    const info = fs.readFileSync(pathProduct, "utf8");
    return JSON.parse(info);
}

function savePro(produto) {
    const info = JSON.stringify(produto, null, 2);

    fs.writeFileSync(pathProduct, info, "utf8");
}

// Cardápios
function readCard() {
    const info = fs.readFileSync(pathCard, "utf8");
    return JSON.parse(info);
}

function saveCard(cardapio) {
    const info = JSON.stringify(cardapio, null, 2);
    fs.writeFileSync(pathCard, info, "utf8");
}

// Calculadora/Pratos
function readPlate() {
    const info = fs.readFileSync(pathPlate, "utf8");
    return JSON.parse(info);
}

function savePlate(prato) {
    const info = JSON.stringify(prato, null, 2);
    fs.writeFileSync(pathPlate, info, "utf8");
}

// Exportar funções
module.exports = {
    readUser,
    saveUsers,
    findUserEmail,
    readPro,
    savePro,
    readCard,
    saveCard,
    readPlate,
    savePlate
};



