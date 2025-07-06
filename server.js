const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // sua pasta com HTML, CSS, JS, imagens

// Dados em memória
let usuarios = [
  { usuario: "admin", senha: "admin" }
];
let inventario = [];
let movimentacoes = [];

// --- LOGIN ---
app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  }
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha inválidos" });
  }
  // Pode retornar o usuário sem senha para não expor
  return res.json({ usuario: user.usuario });
});

// --- USUÁRIOS ---
// GET lista de usuários (sem senha)
app.get("/api/usuarios", (req, res) => {
  const list = usuarios.map(u => ({ usuario: u.usuario }));
  res.json(list);
});

// POST criar usuário
app.post("/api/usuarios", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  }
  if (usuarios.find(u => u.usuario === usuario)) {
    return res.status(409).json({ message: "Usuário já existe" });
  }
  usuarios.push({ usuario, senha });
  res.status(201).json({ message: "Usuário criado" });
});

// DELETE usuário
app.delete("/api/usuarios/:usuario", (req, res) => {
  const usuario = req.params.usuario;
  if (usuario === "admin") {
    return res.status(403).json({ message: "Não pode excluir o usuário admin" });
  }
  const index = usuarios.findIndex(u => u.usuario === usuario);
  if (index === -1) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }
  usuarios.splice(index, 1);
  res.json({ message: "Usuário excluído" });
});

// --- INVENTÁRIO ---
// GET inventário
app.get("/api/inventario", (req, res) => {
  res.json(inventario);
});

// POST adicionar item
app.post("/api/inventario", (req, res) => {
  const { nome, quantidade, descricao } = req.body;
  if (!nome || typeof quantidade !== "number" || quantidade < 1) {
    return res.status(400).json({ message: "Nome e quantidade válidos são obrigatórios" });
  }
  if (inventario.find(i => i.nome === nome)) {
    return res.status(409).json({ message: "Item já cadastrado" });
  }
  inventario.push({ nome, quantidade, descricao });
  res.status(201).json({ message: "Item adicionado" });
});

// DELETE item
app.delete("/api/inventario/:nome", (req, res) => {
  const nome = req.params.nome;
  const index = inventario.findIndex(i => i.nome === nome);
  if (index === -1) {
    return res.status(404).json({ message: "Item não encontrado" });
  }
  inventario.splice(index, 1);
  res.json({ message: "Item excluído" });
});

// --- MOVIMENTAÇÕES ---
// GET movimentações
app.get("/api/movimentacoes", (req, res) => {
  res.json(movimentacoes);
});

// POST adicionar movimentação
app.post("/api/movimentacoes", (req, res) => {
  const { item, tipo, quantidade, data, entreguePara } = req.body;
  if (!item || !tipo || typeof quantidade !== "number" || quantidade < 1 || !data) {
    return res.status(400).json({ message: "Campos obrigatórios inválidos" });
  }
  // Atualiza estoque conforme movimentação
  const estoqueItem = inventario.find(i => i.nome === item);
  if (!estoqueItem) {
    return res.status(400).json({ message: "Item não existe no inventário" });
  }
  if (tipo === "saida" && estoqueItem.quantidade < quantidade) {
    return res.status(400).json({ message: "Estoque insuficiente" });
  }

  if (tipo === "entrada") {
    estoqueItem.quantidade += quantidade;
  } else if (tipo === "saida") {
    estoqueItem.quantidade -= quantidade;
  } else {
    return res.status(400).json({ message: "Tipo inválido" });
  }

  const newMov = {
    id: movimentacoes.length ? movimentacoes[movimentacoes.length - 1].id + 1 : 1,
    item,
    tipo,
    quantidade,
    data,
    entreguePara: entreguePara || ""
  };
  movimentacoes.push(newMov);

  res.status(201).json({ message: "Movimentação adicionada" });
});

// DELETE movimentação
app.delete("/api/movimentacoes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = movimentacoes.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Movimentação não encontrada" });
  }
  // Reverter o estoque ao remover movimentação (pra manter estoque correto)
  const mov = movimentacoes[index];
  const estoqueItem = inventario.find(i => i.nome === mov.item);
  if (estoqueItem) {
    if (mov.tipo === "entrada") {
      estoqueItem.quantidade -= mov.quantidade;
    } else if (mov.tipo === "saida") {
      estoqueItem.quantidade += mov.quantidade;
    }
  }

  movimentacoes.splice(index, 1);
  res.json({ message: "Movimentação excluída" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
