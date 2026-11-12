const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const funcoes = require("../js/funcoes");
const pool = require("../db");

module.exports = function (exigirLogin) {
    const router = express.Router();

    // const pathProduct = path.join(__dirname, "..", "dados", "produtos.json");

    router.get("/", exigirLogin, async (req, res) => {
        // const prod = funcoes.readPro();

        // const myPro = prod.filter(
        //     prod => prod.usuarioId === req.session.usuario.id
        // );
        try {
            
            const result = await pool.query(
                `SELECT
                    id, 
                    usuario_id AS "usuarioId",
                    nome, 
                    peso, 
                    custo, 
                    caloria, 
                    image
                FROM produtos
                WHERE usuario_id = $1`,
                [req.session.usuario.id]
            );
    
            const produtos = result.rows.map(produ => ({
                ...produ,
                custo: Number(produ.custo),
                caloria: Number(produ.caloria)
            }));
    
            res.status(200).json(produtos);

        } catch (error) {
            console.error("Erro ao buscar produtos.", error);

            return res.status(500).json({
                erro: "Erro ao buscar produtos."
            });  
        }
    });

    router.post("/", exigirLogin, async (req, res) => {
        try {
            
            const { nome, peso, custo, caloria, image } = req.body;
    
            if (
                typeof nome !== "string" || !nome.trim() ||
                typeof peso !== "string" ||
                !peso.trim() ||
                custo === "" ||
                custo === null ||
                custo === undefined ||
                !Number.isFinite(Number(custo)) ||
                Number(custo) < 0 || 
                caloria === "" ||
                caloria === null ||
                caloria === undefined ||
                !Number.isFinite(Number(caloria)) ||
                Number(caloria) < 0
            ) {
                return res.status(400).json({
                    erro: "Preencha todos os campos."
                });
            }
    
            const newProd = {
                id: crypto.randomUUID(),
                usuarioId: req.session.usuario.id,
                nome: nome.trim(),
                peso: peso.trim(),
                custo: Number(custo),
                caloria: Number(caloria),
                image: image || ""
            };
    
            await pool.query(
                `INSERT INTO produtos
                    (id, usuario_id, nome, peso, custo, caloria, image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    newProd.id,
                    newProd.usuarioId,
                    newProd.nome,
                    newProd.peso,
                    newProd.custo,
                    newProd.caloria,
                    newProd.image
                ]
            );
    
            res.status(201).json({
                msg: "Produto cadastrado!",
                produtos: newProd
            });
        } catch (error) {
            console.error("Erro ao cadastrar produto:", error);

            return res.status(500).json({
                erro: "Erro ao cadastrar produto."
            });
        }
    });

    return router;
};
