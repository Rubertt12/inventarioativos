// api/login.js
let usuarios = [
  { usuario: "admin", senha: "admin" }
];

// Função handler padrão para Vercel Serverless
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Método não permitido" });
    return;
  }
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  }
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha inválidos" });
  }
  return res.status(200).json({ usuario: user.usuario });
}
