(() => {
  // --- DOM Elements ---
  const loginContainer = document.getElementById("login-container");
  const app = document.getElementById("app");
  const loginBox = document.getElementById("login-box");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const toast = document.getElementById("toast");

  const sidebarLinks = document.querySelectorAll("#sidebar nav a");
  const sections = {
    dashboard: document.getElementById("dashboard-section"),
    inventario: document.getElementById("inventario-section"),
    movimentacoes: document.getElementById("movimentacoes-section"),
    usuarios: document.getElementById("usuarios-section"),
  };
  const btnLogout = document.getElementById("btnLogout");

  const formInventario = document.getElementById("formInventario");
  const inventarioTabela = document.getElementById("inventarioTabela");

  const formMovimentacao = document.getElementById("formMovimentacao");
  const movItem = document.getElementById("movItem");
  const movTipo = document.getElementById("movTipo");
  const movQtd = document.getElementById("movQtd");
  const entreguePara = document.getElementById("entreguePara");
  const movimentacoesTabela = document.getElementById("movimentacoesTabela");

  const formUsuarios = document.getElementById("formUsuarios");
  const usuariosTabela = document.getElementById("usuariosTabela");

  const statTotalItens = document.getElementById("statTotalItens");
  const statTotalQtd = document.getElementById("statTotalQtd");
  const statBaixoEstoque = document.getElementById("statBaixoEstoque");
  const statUsuarios = document.getElementById("statUsuarios");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalMsg = document.getElementById("modalMsg");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");

  // --- Estado ---
  let usuarios = [];
  let inventario = [];
  let movimentacoes = [];
  let usuarioLogado = null;
  let deleteCallback = null;

  // --- Helpers ---
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // Modal abrir/fechar
  function abrirModal(msg, onConfirm) {
    modalMsg.textContent = msg;
    modalOverlay.classList.add("active");
    deleteCallback = onConfirm;
    modalConfirmBtn.focus();
  }
  function fecharModal() {
    modalOverlay.classList.remove("active");
    deleteCallback = null;
  }
  modalConfirmBtn.addEventListener("click", () => {
    if (deleteCallback) deleteCallback();
    fecharModal();
  });
  modalCancelBtn.addEventListener("click", fecharModal);
  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) fecharModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) fecharModal();
  });

  // --- API Fetches ---
  const headersJSON = { "Content-Type": "application/json" };

  async function loginAPI(usuario, senha) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: headersJSON,
        body: JSON.stringify({ usuario, senha }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Login error:", data.message);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error("Erro na requisição login:", err);
      return null;
    }
  }

  async function carregarUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      usuarios = await res.json();
    } catch (e) {
      showToast("Erro ao carregar usuários do servidor");
      usuarios = [];
    }
  }

  async function salvarUsuarioAPI(usuario, senha) {
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: headersJSON,
        body: JSON.stringify({ usuario, senha }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao criar usuário");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }

  async function excluirUsuarioAPI(usuario) {
    try {
      const res = await fetch(`/api/usuarios/${encodeURIComponent(usuario)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao excluir usuário");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }

  // Inventário API (você vai precisar implementar no server.js)
  async function carregarInventarioAPI() {
    try {
      const res = await fetch("/api/inventario");
      if (!res.ok) throw new Error("Erro ao carregar inventário");
      inventario = await res.json();
    } catch {
      inventario = [];
      showToast("Erro ao carregar inventário do servidor");
    }
  }
  async function adicionarItemAPI(item) {
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: headersJSON,
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao adicionar item");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }
  async function excluirItemAPI(nome) {
    try {
      const res = await fetch(`/api/inventario/${encodeURIComponent(nome)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao excluir item");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }

  // Movimentações API (também deve ter no server.js)
  async function carregarMovimentacoesAPI() {
    try {
      const res = await fetch("/api/movimentacoes");
      if (!res.ok) throw new Error("Erro ao carregar movimentações");
      movimentacoes = await res.json();
    } catch {
      movimentacoes = [];
      showToast("Erro ao carregar movimentações do servidor");
    }
  }
  async function adicionarMovimentacaoAPI(mov) {
    try {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: headersJSON,
        body: JSON.stringify(mov),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao adicionar movimentação");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }
  async function excluirMovimentacaoAPI(id) {
    try {
      const res = await fetch(`/api/movimentacoes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Erro ao excluir movimentação");
        return false;
      }
      return true;
    } catch {
      showToast("Erro de conexão com o servidor");
      return false;
    }
  }

  // --- Renderização ---
  function renderUsuarios() {
    usuariosTabela.innerHTML = "";
    usuarios.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.usuario}</td><td><button class="btn-excluir" aria-label="Excluir usuário ${u.usuario}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        if (u.usuario === "admin") return alert("Não pode excluir o usuário admin");
        abrirModal(`Excluir usuário "${u.usuario}"?`, async () => {
          const sucesso = await excluirUsuarioAPI(u.usuario);
          if (sucesso) {
            await carregarUsuarios();
            renderUsuarios();
            showToast(`Usuário "${u.usuario}" excluído.`);
          }
        });
      });
      usuariosTabela.appendChild(tr);
    });
  }

  function renderInventario() {
    inventarioTabela.innerHTML = "";
    inventario.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>${item.descricao || ""}</td>
        <td><button class="btn-excluir" aria-label="Excluir item ${item.nome}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        abrirModal(`Excluir item "${item.nome}"?`, async () => {
          const sucesso = await excluirItemAPI(item.nome);
          if (sucesso) {
            await carregarInventarioAPI();
            renderInventario();
            atualizarSelectItens();
            atualizarDashboard();
            showToast(`Item "${item.nome}" excluído.`);
          }
        });
      });
      inventarioTabela.appendChild(tr);
    });
  }

  function renderMovimentacoes() {
    movimentacoesTabela.innerHTML = "";
    movimentacoes.forEach((mov) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mov.item}</td>
        <td>${mov.tipo}</td>
        <td>${mov.quantidade}</td>
        <td>${new Date(mov.data).toLocaleString("pt-BR")}</td>
        <td>${mov.entreguePara || "—"}</td>
        <td><button class="btn-excluir" aria-label="Excluir movimentação ${mov.item}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        abrirModal(`Excluir movimentação do item "${mov.item}"?`, async () => {
          const sucesso = await excluirMovimentacaoAPI(mov._id || mov.id);
          if (sucesso) {
            await carregarMovimentacoesAPI();
            renderMovimentacoes();
            showToast("Movimentação excluída.");
          }
        });
      });
      movimentacoesTabela.appendChild(tr);
    });
  }

  function atualizarSelectItens() {
    movItem.innerHTML = "";
    inventario.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.nome;
      option.textContent = item.nome;
      movItem.appendChild(option);
    });
  }

  function atualizarDashboard() {
    statTotalItens.textContent = inventario.length;
    statUsuarios.textContent = usuarios.length;
    statTotalQtd.textContent = inventario.reduce((acc, i) => acc + i.quantidade, 0);
    statBaixoEstoque.textContent = inventario.filter(i => i.quantidade <= 5).length;
  }

  // --- Eventos ---

  // Navegação entre seções
  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = e.currentTarget.getAttribute("data-section");
      if (!sec) return;
      // ativa aba
      sidebarLinks.forEach(l => l.classList.remove("active"));
      e.currentTarget.classList.add("active");
      // mostra seção
      Object.entries(sections).forEach(([key, section]) => {
        section.classList.toggle("hidden", key !== sec);
      });
      sections[sec].focus();
    });
  });

  // Login
  loginBox.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const usuario = usernameInput.value.trim();
    const senha = passwordInput.value;
    if (!usuario || !senha) {
      loginError.textContent = "Preencha usuário e senha.";
      return;
    }
    const user = await loginAPI(usuario, senha);
    if (!user) {
      loginError.textContent = "Usuário ou senha inválidos.";
      return;
    }
    usuarioLogado = user;
    loginContainer.style.display = "none";
    app.style.display = "flex";
    app.setAttribute("aria-hidden", "false");

    // Carregar dados do backend
    await carregarUsuarios();
    await carregarInventarioAPI();
    await carregarMovimentacoesAPI();

    renderUsuarios();
    renderInventario();
    renderMovimentacoes();
    atualizarDashboard();
    atualizarSelectItens();
  });

  // Logout
  btnLogout.addEventListener("click", () => {
    usuarioLogado = null;
    loginContainer.style.display = "flex";
    app.style.display = "none";
    app.setAttribute("aria-hidden", "true");
    loginBox.reset();
    loginError.textContent = "";
    showToast("Você saiu do sistema.");
  });

  // Form Usuários (adicionar)
  formUsuarios.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = document.getElementById("usuarioNome").value.trim();
    const senha = document.getElementById("usuarioSenha").value;
    if (!usuario || !senha) {
      showToast("Preencha usuário e senha.");
      return;
    }
    if (usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
      showToast("Usuário já existe.");
      return;
    }
    const sucesso = await salvarUsuarioAPI(usuario, senha);
    if (sucesso) {
      await carregarUsuarios();
      renderUsuarios();
      showToast(`Usuário "${usuario}" criado.`);
      formUsuarios.reset();
    }
  });

  // Form Inventário (adicionar)
  formInventario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("itemNome").value.trim();
    const qtd = parseInt(document.getElementById("itemQtd").value);
    const desc = document.getElementById("itemDesc").value.trim();
    if (!nome || isNaN(qtd) || qtd < 1) {
      showToast("Preencha os campos corretamente.");
      return;
    }
    if (inventario.find(i => i.nome.toLowerCase() === nome.toLowerCase())) {
      showToast("Item já cadastrado.");
      return;
    }
    const sucesso = await adicionarItemAPI({ nome, quantidade: qtd, descricao: desc });
    if (sucesso) {
      await carregarInventarioAPI();
      renderInventario();
      atualizarSelectItens();
      atualizarDashboard();
      formInventario.reset();
      showToast(`Item "${nome}" adicionado.`);
    }
  });

  // Form Movimentação (adicionar)
  formMovimentacao.addEventListener("submit", async (e) => {
    e.preventDefault();
    const item = movItem.value;
    const tipo = movTipo.value;
    const qtd = parseInt(movQtd.value);
    const para = entreguePara.value.trim();
    const estoqueItem = inventario.find(i => i.nome === item);
    if (!item || !tipo || isNaN(qtd) || qtd < 1 || !estoqueItem) {
      showToast("Preencha os campos corretamente.");
      return;
    }
    if (tipo === "saida" && estoqueItem.quantidade < qtd) {
      showToast("Estoque insuficiente.");
      return;
    }

    // Atualiza estoque localmente antes do POST
    if (tipo === "entrada") {
      estoqueItem.quantidade += qtd;
    } else {
      estoqueItem.quantidade -= qtd;
    }

    const movimentacao = {
      item,
      tipo,
      quantidade: qtd,
      data: Date.now(),
      entreguePara: tipo === "saida" ? para : "",
    };

    const sucesso = await adicionarMovimentacaoAPI(movimentacao);
    if (sucesso) {
      await carregarInventarioAPI();
      await carregarMovimentacoesAPI();
      renderInventario();
      renderMovimentacoes();
      atualizarDashboard();
      atualizarSelectItens();
      formMovimentacao.reset();
      showToast("Movimentação registrada.");
    } else {
      // Reverter estoque local se falhou
      if (tipo === "entrada") {
        estoqueItem.quantidade -= qtd;
      } else {
        estoqueItem.quantidade += qtd;
      }
    }
  });

  // Exportar movimentações CSV (frontend)
  document.getElementById("exportMovimentacoes").addEventListener("click", () => {
    if (movimentacoes.length === 0) {
      return showToast("Não há movimentações para exportar.");
    }
    const csvHeader = "item,tipo,quantidade,data,entreguePara\n";
    const csvRows = movimentacoes.map(mov => {
      return [
        `"${mov.item.replace(/"/g, '""')}"`,
        mov.tipo,
        mov.quantidade,
        `"${new Date(mov.data).toLocaleString("pt-BR")}"`,
        `"${(mov.entreguePara || "").replace(/"/g, '""')}"`,
      ].join(",");
    });
    const csvContent = csvHeader + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movimentacoes.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Movimentações exportadas.");
  });

  // Importar movimentações CSV (frontend)
  document.getElementById("importMovimentacoes").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      const header = lines.shift().split(",");
      if (
        !header.includes("item") ||
        !header.includes("tipo") ||
        !header.includes("quantidade") ||
        !header.includes("data")
      ) {
        showToast("Arquivo CSV inválido.");
        return;
      }

      let importedCount = 0;

      for (const line of lines) {
        if (!line.trim()) continue;
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 4) continue;
        let [item, tipo, quantidade, data, entreguePara] = cols.map(c =>
          c.replace(/^"|"$/g, "")
        );
        quantidade = parseInt(quantidade);
        const timestamp = new Date(data).getTime() || Date.now();

        if (!item || !tipo || isNaN(quantidade)) continue;

        const mov = {
          item,
          tipo,
          quantidade,
          data: timestamp,
          entreguePara: entreguePara || "",
        };

        const sucesso = await adicionarMovimentacaoAPI(mov);
        if (sucesso) importedCount++;
      }
      showToast(`${importedCount} movimentações importadas.`);
      await carregarMovimentacoesAPI();
      renderMovimentacoes();
    };
    reader.readAsText(file);
  });

  // Inicializa exibição: oculta app e mostra login
  function init() {
    app.style.display = "none";
    loginContainer.style.display = "flex";
    app.setAttribute("aria-hidden", "true");

    // Default seção ativa: dashboard
    sidebarLinks.forEach(l => l.classList.remove("active"));
    sidebarLinks[0].classList.add("active");
    Object.values(sections).forEach(s => s.classList.add("hidden"));
    sections.dashboard.classList.remove("hidden");
  }
  init();

})();
