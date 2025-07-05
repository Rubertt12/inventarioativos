// server.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public')); // pasta com seu HTML, CSS, JS
app.use(express.json()); // para receber JSON do front-end

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
