const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados em memória
let usuarios = [
  { usuario: "admin", senha: "admin123" }, // admin padrão
];

// Servir frontend estático (sua pasta public deve conter index.html, app.js, styles.css, /img etc)
app.use(express.static(path.join(__dirname, "public")));

// Rota login
app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha inválidos." });
  }
  // Pode retornar dados do usuário (menos a senha)
  res.json({ usuario: user.usuario });
});

// Listar usuários
app.get("/api/usuarios", (req, res) => {
  // Retorna só nomes dos usuários (sem senha)
  res.json(usuarios.map(u => ({ usuario: u.usuario })));
});

// Criar usuário
app.post("/api/usuarios", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }
  if (usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
    return res.status(409).json({ message: "Usuário já existe." });
  }
  usuarios.push({ usuario, senha });
  res.status(201).json({ message: "Usuário criado." });
});

// Excluir usuário
app.delete("/api/usuarios/:usuario", (req, res) => {
  const usuarioParam = req.params.usuario;
  if (usuarioParam.toLowerCase() === "admin") {
    return res.status(403).json({ message: "Não pode excluir o usuário admin." });
  }
  const index = usuarios.findIndex(u => u.usuario === usuarioParam);
  if (index === -1) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }
  usuarios.splice(index, 1);
  res.json({ message: "Usuário excluído." });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
