const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simula banco de dados em memória
let usuarios = [
  { usuario: "admin", senha: "admin" },
  { usuario: "user", senha: "1234" },
];

let inventario = [
  { nome: "Notebook Dell", quantidade: 10, descricao: "Core i7, 16GB RAM" },
  { nome: "Mouse Logitech", quantidade: 25, descricao: "Wireless" },
];

let movimentacoes = [
  { id: 1, item: "Notebook Dell", tipo: "entrada", quantidade: 10, data: Date.now(), entreguePara: "" },
  { id: 2, item: "Mouse Logitech", tipo: "entrada", quantidade: 25, data: Date.now(), entreguePara: "" },
];

// Para gerar ids únicos para movimentacoes
let nextMovId = movimentacoes.length + 1;

// --- Rotas ---

// Login simples (sem token)
app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body;
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });
  res.json({ usuario: user.usuario });
});

// Usuários

app.get("/api/usuarios", (req, res) => {
  // Não retorna senha por segurança
  res.json(usuarios.map(u => ({ usuario: u.usuario })));
});

app.post("/api/usuarios", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  if (usuarios.find(u => u.usuario === usuario)) {
    return res.status(409).json({ message: "Usuário já existe" });
  }
  usuarios.push({ usuario, senha });
  res.status(201).json({ message: "Usuário criado" });
});

app.delete("/api/usuarios/:usuario", (req, res) => {
  const usuario = req.params.usuario;
  if (usuario === "admin") {
    return res.status(403).json({ message: "Não pode excluir o usuário admin" });
  }
  const index = usuarios.findIndex(u => u.usuario === usuario);
  if (index === -1) return res.status(404).json({ message: "Usuário não encontrado" });
  usuarios.splice(index, 1);
  res.json({ message: "Usuário excluído" });
});

// Inventário

app.get("/api/inventario", (req, res) => {
  res.json(inventario);
});

app.post("/api/inventario", (req, res) => {
  const { nome, quantidade, descricao } = req.body;
  if (!nome || quantidade == null) return res.status(400).json({ message: "Nome e quantidade obrigatórios" });
  if (inventario.find(i => i.nome === nome)) {
    return res.status(409).json({ message: "Item já cadastrado" });
  }
  inventario.push({ nome, quantidade, descricao: descricao || "" });
  res.status(201).json({ message: "Item adicionado" });
});

app.delete("/api/inventario/:nome", (req, res) => {
  const nome = req.params.nome;
  const index = inventario.findIndex(i => i.nome === nome);
  if (index === -1) return res.status(404).json({ message: "Item não encontrado" });
  inventario.splice(index, 1);
  res.json({ message: "Item excluído" });
});

// Movimentações

app.get("/api/movimentacoes", (req, res) => {
  res.json(movimentacoes);
});

app.post("/api/movimentacoes", (req, res) => {
  const { item, tipo, quantidade, data, entreguePara } = req.body;
  if (!item || !tipo || quantidade == null) {
    return res.status(400).json({ message: "Campos obrigatórios: item, tipo, quantidade" });
  }
  const mov = {
    id: nextMovId++,
    item,
    tipo,
    quantidade,
    data: data || Date.now(),
    entreguePara: entreguePara || "",
  };
  movimentacoes.push(mov);

  // Atualiza estoque no inventário conforme tipo movimentação
  const estoqueItem = inventario.find(i => i.nome === item);
  if (estoqueItem) {
    if (tipo === "entrada") estoqueItem.quantidade += quantidade;
    else if (tipo === "saida") estoqueItem.quantidade -= quantidade;
  }

  res.status(201).json({ message: "Movimentação adicionada" });
});

app.delete("/api/movimentacoes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = movimentacoes.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ message: "Movimentação não encontrada" });

  const mov = movimentacoes[index];
  // Reverter estoque
  const estoqueItem = inventario.find(i => i.nome === mov.item);
  if (estoqueItem) {
    if (mov.tipo === "entrada") estoqueItem.quantidade -= mov.quantidade;
    else if (mov.tipo === "saida") estoqueItem.quantidade += mov.quantidade;
  }

  movimentacoes.splice(index, 1);
  res.json({ message: "Movimentação excluída" });
});

// Serve seu frontend estático (se quiser, coloque os arquivos html/css/js numa pasta public)
// app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
