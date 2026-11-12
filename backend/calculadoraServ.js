const express = require("express");
const crypto = require("crypto");
const funcoes = require("../js/funcoes");
const pool = require("../db");

module.exports = function (exigirLogin) {
    const router = express.Router();

    // Pratos da conta conectada
    router.get("/", exigirLogin, async (req, res) => {
        // const pratos = funcoes.readPlate();

        // const myPlates = pratos.filter(
        //     prato => prato.usuarioId === req.session.usuario.id
        // );
        try {
            const result = await pool.query(
                `SELECT
                    id, 
                    usuario_id AS "usuarioId",
                    nome,
                    porcoes,
                    lucro,
                    alimentos
                FROM pratos
                WHERE usuario_id = $1`,
                [req.session.usuario.id]
            );

            const pratos = result.rows.map(receita => ({
                ...receita,
                porcoes: Number(receita.porcoes),
                lucro: Number(receita.lucro)
            }));
            
            res.status(200).json(myPlates);
        
        } catch (error) {
            console.error("Erro ao buscar prato", error);

            return res.status(500).json({
                erro: "Erro ao buscar pratos."
            });
        }

    });

    // Add novo prato
    router.post("/", exigirLogin, async (req, res) => {
        try {
            
        } catch (error) {
            
            const { nome, porcoes, lucro, alimentos } = req.body;
    
            if (
                typeof nome !== "string" ||
                !nome.trim() ||
                !Number.isInteger(Number(porcoes)) ||
                Number(porcoes) < 1 ||
                !Number.isFinite(Number(lucro)) ||
                Number(lucro) <= 0 ||
                !Array.isArray(alimentos) ||
                alimentos.length === 0
            ) {
                return res.status(400).json({
                    erro: "Preencha os dados corretamente."
                });
            }
    
            const newPlate = {
                id: crypto.randomUUID(),
                usuarioId: req.session.usuario.id,
                nome: nome.trim(),
                porcoes: Number(porcoes),
                lucro: Number(lucro),
                alimentos: alimentos,
                valorFinal: req.body.valorFinal
            };
    
            await pool.query(
                `INSERT INTO pratos
                    (id, usuario_id, nome, porcoes, lucro, calorias)`
            )
    
            res.status(201).json({
                msg: "Prato cadastrado!",
                prato: newPlate
            });
        }

    });

    // Consulta o último INPC registrado
    router.get("/inpc", exigirLogin, async (req, res) => {
        try {
            const API_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1644/dados/ultimos/1?formato=json";

            const resp = await fetch(API_URL);

            if (!resp.ok) {
                throw new Error("Falha ao consultar o Banco Central.");
            }

            const dados = await resp.json();

            if (!dados.length) {
                throw new Error("A API não retornou dados.");
            }

            res.status(200).json({
                data: dados[0].data,
                valor: Number(dados[0].valor)
            });

        } catch (erro) {
            console.error("Erro ao consultar INPC:", erro.message);

            res.status(500).json({
                erro: "Não foi possível consultar o INPC."
            });
        }
    });

    return router;
};