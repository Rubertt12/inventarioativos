let usuarios = [
  { usuario: "admin", senha: "admin" }
];

export default function handler(req, res) {
  if (req.method === "GET") {
    // Retorna lista de usuários sem senha
    const list = usuarios.map(u => ({ usuario: u.usuario }));
    res.status(200).json(list);
  } else if (req.method === "POST") {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
    }
    if (usuarios.find(u => u.usuario === usuario)) {
      return res.status(409).json({ message: "Usuário já existe" });
    }
    usuarios.push({ usuario, senha });
    res.status(201).json({ message: "Usuário criado" });
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
