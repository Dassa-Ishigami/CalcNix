require("dotenv").config();
console.log("SESSION_SECRET carregada:", Boolean(process.env.SESSION_SECRET));

const exp = require("express");
const path = require("path");
const session = require("express-session");
const fs = require("fs");
const FileStore = require("session-file-store")(session);
const funcoes = require("./js/funcoes");
const rotaPro = require("./backend/produtosServ");
const rotaCard = require("./backend/cardapiosServ");
const rotaCalc = require("./backend/calculadoraServ");

const app = exp();

const bcrypt = require("bcrypt");

const newSession = path.join(__dirname, "dados", "sessoes");

fs.mkdirSync(newSession, {recursive: true});


app.use(session({
    store: new FileStore({
        path: newSession
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            autenticado: false,
            msg: "Faça login."
        });
    }

    next();
};
app.use(exp.json({ limit: "5mb"})); // envia os dados do formulário de cadastro para o json

app.use("/api/produtos", rotaPro(exigirLogin));
app.use("/api/cardapios", rotaCard(exigirLogin));
app.use("/api/calculadora", rotaCalc(exigirLogin));

app.use("/styles", exp.static(path.join(__dirname, "styles")));
app.use("/js", exp.static(path.join(__dirname, "js")));
app.use("/assets", exp.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Todos os campos"
            });
        }

        if (typeof nome !== "string" ||
            typeof email !== "string" ||
            typeof senha !== "string") {
            return res.status(400).json({
                erro: "Dados inválidos"
            });
        }

        const newNome = nome.trim();
        const newEmail = email.trim().toLowerCase();

        const usuario = funcoes.readUser();

        const userExist = usuario.find(
            user => user.email.toLowerCase() === newEmail
        );

        if (userExist) {
            return res.status(409).json({
                msg: "Email já cadastrado."
            });
        }

        const newUser = {
            id: require("crypto").randomUUID(),
            nome: newNome,
            email: newEmail,
            senha: await bcrypt.hash(senha, 12)
        };

        usuario.push(newUser);
        funcoes.saveUsers(usuario);

        return res.status(201).json({
            msg: "Cadastro"
        });

    } catch (error) {
        console.error("Errouu", error);

        return res.status(500).json({
            error: "Sem conclusão."
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        if (typeof email !== "string" || typeof senha !== "string") {
            return res.status(400).json({
                erro: "Dados inválidos"
            });
        }

        const checkEmail = email.trim().toLowerCase();
        const usuario = funcoes.readUser();

        const userExist = usuario.find(
            user => user.email.toLowerCase() === checkEmail
        );

        if (!userExist) {
            return res.status(401).json({
                msg: "Usuário não cadastrado."
            });
        }

        const rightPassw = await bcrypt.compare(
            senha, 
            userExist.senha
        );

        if (!rightPassw) {
            return res.status(401).json({
                msg: "Email ou senha incorretos."
            });
        }

        req.session.usuario = {
            id: userExist.id,
            nome: userExist.nome,
            email: userExist.email
        };

        req.session.save((erro) => {
            if (erro) {
                console.error("Erro ao salvar sessão:", erro);

                return res.status(500).json({
                    error: "Erro ao iniciar sessão."
                });
            }
        })

        return res.status(200).json({
            msg: "Usuário logado!",
            usuario: req.session.usuario
        });


    } catch (error) {
        console.error("Erro", error);

        return res.status(500).json({
            error: "Erro do servidor."
        });
    }
});

app.get("/usuario-log", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            aut: false,
            msg: "Nenhum usuário logado."
        });
    }

    return res.status(200).json({
        aut: true,
        usuario: req.session.usuario
    });
});

app.get("/calcnix.html", exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "calcnix.html"));
});

app.listen(3000, () => {
    console.log("Servidor iniciado!");
}); // inicia o servidor