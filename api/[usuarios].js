let usuarios = [
  { usuario: "admin", senha: "admin" }
];

export default function handler(req, res) {
  const {
    query: { usuario },
    method,
  } = req;

  if (method === "DELETE") {
    if (usuario === "admin") {
      return res.status(403).json({ message: "Não pode excluir o usuário admin" });
    }
    const index = usuarios.findIndex(u => u.usuario === usuario);
    if (index === -1) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    usuarios.splice(index, 1);
    return res.status(200).json({ message: "Usuário excluído" });
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
