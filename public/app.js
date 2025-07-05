(() => {
  // Elementos DOM
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

  let usuarios = [];
  let inventario = [];
  let movimentacoes = [];
  let usuarioLogado = null;
  let deleteCallback = null;

  // Toast helper
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // Dark mode toggle (sem duplicar evento)
  const darkToggle = document.getElementById('darkToggle');

  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      darkToggle.checked = true;
    } else {
      localStorage.removeItem("darkMode");
      darkToggle.checked = false;
    }
  }

  darkToggle.addEventListener("change", toggleDarkMode);

  // Carrega preferência do modo escuro ao iniciar
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkToggle.checked = true;
  }

  // LocalStorage para usuários
  function salvarUsuarios() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
  function carregarUsuarios() {
    const dados = localStorage.getItem("usuarios");
    usuarios = dados ? JSON.parse(dados) : [{ usuario: "admin", senha: "1234" }];
    if (!usuarios.find((u) => u.usuario === "admin")) {
      usuarios.push({ usuario: "admin", senha: "1234" });
      salvarUsuarios();
    }
  }

  // LocalStorage para inventário
  function salvarInventario() {
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }
  function carregarInventario() {
    const dados = localStorage.getItem("inventario");
    inventario = dados ? JSON.parse(dados) : [];
  }

  // LocalStorage para movimentações
  function salvarMovimentacoes() {
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
  }
  function carregarMovimentacoes() {
    const dados = localStorage.getItem("movimentacoes");
    movimentacoes = dados ? JSON.parse(dados) : [];
  }

  // Atualiza select de itens no form movimentação
  function atualizarSelectItens() {
    movItem.innerHTML = "";
    inventario.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.nome;
      option.textContent = item.nome;
      movItem.appendChild(option);
    });
  }

  // Atualiza os dados do dashboard
  function atualizarDashboard() {
    statTotalItens.textContent = inventario.length;
    statUsuarios.textContent = usuarios.length;
    statTotalQtd.textContent = inventario.reduce((acc, item) => acc + item.quantidade, 0);
    statBaixoEstoque.textContent = inventario.filter((i) => i.quantidade <= 5).length;
  }

  // Modal abrir e fechar
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
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) fecharModal();
  });

  // Renderiza tabela de usuários
  function renderUsuarios() {
    usuariosTabela.innerHTML = "";
    usuarios.forEach((u, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.usuario}</td><td><button class="btn-excluir" aria-label="Excluir usuário ${u.usuario}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        if (u.usuario === "admin") return alert("Não pode excluir o usuário admin");
        abrirModal(`Excluir usuário "${u.usuario}"?`, () => {
          usuarios.splice(i, 1);
          salvarUsuarios();
          renderUsuarios();
          showToast(`Usuário "${u.usuario}" excluído.`);
        });
      });
      usuariosTabela.appendChild(tr);
    });
  }

  // Renderiza tabela de inventário
  function renderInventario() {
    inventarioTabela.innerHTML = "";
    inventario.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>${item.descricao}</td>
        <td><button class="btn-excluir" aria-label="Excluir item ${item.nome}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        abrirModal(`Excluir item "${item.nome}"?`, () => {
          inventario.splice(i, 1);
          salvarInventario();
          atualizarSelectItens();
          renderInventario();
          atualizarDashboard();
          showToast(`Item "${item.nome}" excluído.`);
        });
      });
      inventarioTabela.appendChild(tr);
    });
  }

  // Renderiza tabela de movimentações
  function renderMovimentacoes() {
    movimentacoesTabela.innerHTML = "";
    movimentacoes.forEach((mov, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mov.item}</td>
        <td>${mov.tipo}</td>
        <td>${mov.quantidade}</td>
        <td>${new Date(mov.data).toLocaleString("pt-BR")}</td>
        <td>${mov.entreguePara || "—"}</td>
        <td><button class="btn-excluir" aria-label="Excluir movimentação ${mov.item}">Excluir</button></td>`;
      tr.querySelector("button").addEventListener("click", () => {
        abrirModal(`Excluir movimentação do item "${mov.item}"?`, () => {
          movimentacoes.splice(i, 1);
          salvarMovimentacoes();
          renderMovimentacoes();
          showToast("Movimentação excluída.");
        });
      });
      movimentacoesTabela.appendChild(tr);
    });
  }

  // Login
  loginBox.addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = usernameInput.value.trim();
    const senha = passwordInput.value;
    const user = usuarios.find((u) => u.usuario === usuario && u.senha === senha);
    if (!user) {
      loginError.textContent = "Usuário ou senha inválidos.";
      loginError.style.display = "block";
      return;
    }
    usuarioLogado = user;
    loginContainer.style.display = "none";
    app.style.display = "flex";
    app.setAttribute("aria-hidden", "false");
    loginError.style.display = "none";
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
    usernameInput.value = "";
    passwordInput.value = "";
  });

  // Navegação menu lateral
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const sec = link.dataset.section;
      for (const s in sections) sections[s].classList.add("hidden");
      sections[sec].classList.remove("hidden");
      sections[sec].focus();
    });
  });

  // Form inventário
  formInventario.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("itemNome").value.trim();
    const qtd = parseInt(document.getElementById("itemQtd").value);
    const desc = document.getElementById("itemDesc").value.trim();
    if (!nome || isNaN(qtd) || qtd < 1) {
      showToast("Preencha os campos corretamente.");
      return;
    }
    if (inventario.find((i) => i.nome.toLowerCase() === nome.toLowerCase())) {
      showToast("Item já cadastrado.");
      return;
    }
    inventario.push({ nome, quantidade: qtd, descricao: desc });
    salvarInventario();
    renderInventario();
    atualizarSelectItens();
    atualizarDashboard();
    formInventario.reset();
    showToast(`Item "${nome}" adicionado.`);
  });

  // Form movimentação
  formMovimentacao.addEventListener("submit", (e) => {
    e.preventDefault();
    const item = movItem.value;
    const tipo = movTipo.value;
    const qtd = parseInt(movQtd.value);
    const para = entreguePara.value.trim();
    const itemEstoque = inventario.find((i) => i.nome === item);
    if (!item || !tipo || isNaN(qtd) || qtd < 1 || !itemEstoque) return;
    if (tipo === "saida" && itemEstoque.quantidade < qtd) {
      showToast("Estoque insuficiente.");
      return;
    }
    if (tipo === "entrada") {
      itemEstoque.quantidade += qtd;
    } else {
      itemEstoque.quantidade -= qtd;
    }
    movimentacoes.push({
      item,
      tipo,
      quantidade: qtd,
      data: Date.now(),
      entreguePara: tipo === "saida" ? para : "",
    });
    salvarInventario();
    salvarMovimentacoes();
    renderInventario();
    renderMovimentacoes();
    atualizarDashboard();
    formMovimentacao.reset();
    showToast("Movimentação registrada.");
  });

  // Exporta movimentações para CSV
  document.getElementById("exportMovimentacoes").addEventListener("click", () => {
    if (movimentacoes.length === 0) {
      return showToast("Não há movimentações para exportar.");
    }
    const csvHeader = "item,tipo,quantidade,data,entreguePara\n";
    const csvRows = movimentacoes.map((mov) => {
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

  // Importa movimentações de CSV
  document.getElementById("importMovimentacoes").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
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

      lines.forEach((line) => {
        if (!line.trim()) return;
        const cols = line.match(/("([^"]|"")*"|[^,]+)/g);
        if (!cols || cols.length < 5) return;

        // Remove aspas e desescape
        const item = cols[0].replace(/^"|"$/g, "").replace(/""/g, '"');
        const tipo = cols[1];
        const quantidade = parseInt(cols[2]);

        // Converte data legível para timestamp
        const dataStr = cols[3].replace(/^"|"$/g, "").replace(/""/g, '"');
        const data = Date.parse(dataStr);
        if (isNaN(data)) return; // descarta linha se data inválida

        const entreguePara = cols[4].replace(/^"|"$/g, "").replace(/""/g, '"');

        if (!item || !tipo || isNaN(quantidade)) return;

        // Atualiza estoque
        let estoqueItem = inventario.find((i) => i.nome === item);
        if (!estoqueItem) {
          inventario.push({ nome: item, quantidade: 0, descricao: "" });
          estoqueItem = inventario[inventario.length - 1];
        }
        if (tipo === "entrada") {
          estoqueItem.quantidade += quantidade;
        } else if (tipo === "saida") {
          estoqueItem.quantidade -= quantidade;
          if (estoqueItem.quantidade < 0) estoqueItem.quantidade = 0;
        }

        movimentacoes.push({ item, tipo, quantidade, data, entreguePara });
        importedCount++;
      });

      salvarInventario();
      salvarMovimentacoes();
      renderInventario();
      renderMovimentacoes();
      atualizarDashboard();
      atualizarSelectItens();
      showToast(`Importadas ${importedCount} movimentações.`);
    };

    reader.readAsText(file);
    e.target.value = ""; // limpa input para nova importação
  });

  // Inicialização
  carregarUsuarios();
  carregarInventario();
  carregarMovimentacoes();

  // Inicializa UI após carregar dados
  if (usuarioLogado) {
    loginContainer.style.display = "none";
    app.style.display = "flex";
    app.setAttribute("aria-hidden", "false");
    renderUsuarios();
    renderInventario();
    renderMovimentacoes();
    atualizarDashboard();
    atualizarSelectItens();
  } else {
    loginContainer.style.display = "flex";
    app.style.display = "none";
    app.setAttribute("aria-hidden", "true");
  }
})();

// Toggle menu lateral fora do IIFE (assumindo que existe no DOM)
const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const sidebar = document.getElementById("sidebar");
btnToggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  if (sidebar.classList.contains("collapsed")) {
    btnToggleSidebar.setAttribute("aria-label", "Expandir menu lateral");
    btnToggleSidebar.setAttribute("title", "Expandir menu lateral");
  } else {
    btnToggleSidebar.setAttribute("aria-label", "Recolher menu lateral");
    btnToggleSidebar.setAttribute("title", "Recolher menu lateral");
  }
});
