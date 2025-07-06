// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); // para evitar problemas de CORS no frontend
app.use(express.json()); // para receber JSON do front-end
app.use(express.static('public')); // serve HTML, CSS, JS estático

// Simulação do banco em memória
let usuarios = [
  { usuario: "admin", senha: "1234" },
];

// Rota para servir a página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API: listar usuários (sem senha)
app.get('/api/usuarios', (req, res) => {
  const lista = usuarios.map(u => ({ usuario: u.usuario }));
  res.json(lista);
});

// API: criar usuário
app.post('/api/usuarios', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
  }
  if (usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
    return res.status(409).json({ message: 'Usuário já existe' });
  }
  usuarios.push({ usuario, senha });
  res.status(201).json({ message: 'Usuário criado' });
});

// API: deletar usuário
app.delete('/api/usuarios/:usuario', (req, res) => {
  const usuarioParam = req.params.usuario.toLowerCase();
  if (usuarioParam === 'admin') {
    return res.status(403).json({ message: 'Não pode excluir usuário admin' });
  }
  const index = usuarios.findIndex(u => u.usuario.toLowerCase() === usuarioParam);
  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  usuarios.splice(index, 1);
  res.json({ message: 'Usuário excluído' });
});

// API: login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!user) {
    return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  }
  res.json({ usuario: user.usuario });
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
