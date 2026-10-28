const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const funcoes = require("../js/funcoes");

module.exports = function (exigirLogin) {
    const router = express.Router();

    router.get("/", exigirLogin, (req, res) => {
        const card = funcoes.readCard();

        const myCard = card.filter(
            card => card.usuarioId === req.session.usuario.id
        );

        res.status(200).json(myCard);
    });

    router.post("/", exigirLogin, (req, res) => {
        const { nome } = req.body;

        if (
            typeof nome !== "string" ||
            !nome.trim()
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        const cardapios = funcoes.readCard();

        const newCard = {
            id: crypto.randomUUID(),
            usuarioId: req.session.usuario.id,
            nome: nome.trim(),
            criadoEm: new Date().toISOString()
        };

        cardapios.push(newCard);
        funcoes.saveCard(cardapios);

        res.status(201).json({
            msg: "Cardápio cadastrado!",
            cardapios: newCard
        });
    });

    return router;
};
