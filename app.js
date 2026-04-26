// ==========================
// UTILITÁRIOS
// ==========================
const formatCurrency = (value) => {
  if (isNaN(value) || value === null) value = 0;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const parseNumber = (value) => {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
};

const formatPercent = (value) => {
  if (isNaN(value) || value === null) value = 0;
  return value.toFixed(1).replace(".", ",") + "%";
};

const getCurrentDateString = () => {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const pad2 = (n) => (n < 10 ? "0" + n : "" + n);

// ==========================
// ESTADO GLOBAL
// ==========================
let state = {
  data: "",
  mes: "",
  ano: "",
  auxDinheiro: 0,
  auxCombustivel: 0,
  descricao: "",
  rotas: {
    curvelo: {
      alunosIntegrais: 0,
      alunosDesconto: 0,
      percDesconto: 0,
      passagens: 0,
      veiculos: [],
    },
    sete: {
      alunosIntegrais: 0,
      alunosDesconto: 0,
      percDesconto: 0,
      passagens: 0,
      veiculos: [],
    },
  },
  calculo: {
    brutoCurvelo: 0,
    brutoSete: 0,
    totalBruto: 0,
    percCurvelo: 0,
    percSete: 0,
    auxTotal: 0,
    auxCurvelo: 0,
    auxSete: 0,
    liquidoCurvelo: 0,
    liquidoSete: 0,
    alunosEqCurvelo: 0,
    alunosEqSete: 0,
    valorAlunoCurvelo: 0,
    valorAlunoSete: 0,
    totalRateado: 0,
    totalAlunosEq: 0,
    veiculosAtivos: 0,
  },
};

const STORAGE_KEY = "rateio_transporte_universitario";

// ==========================
// INICIALIZAÇÃO
// ==========================
const init = () => {
  document.getElementById("topbar-date").textContent = getCurrentDateString();
  initAnoSelects();
  initSidebarNavigation();
  initVeiculosButtons();
  initActions();
  loadFromStorageForCurrentPeriod();
  renderAll();
};

const initAnoSelects = () => {
  const anos = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear + 2; y++) anos.push(y);

  const inputAno = document.getElementById("input-ano");
  const filtroAno = document.getElementById("filtro-ano");
  anos.forEach((y) => {
    const opt1 = document.createElement("option");
    opt1.value = y;
    opt1.textContent = y;
    inputAno.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = y;
    opt2.textContent = y;
    filtroAno.appendChild(opt2);
  });

  const now = new Date();
  document.getElementById("input-mes").value = now.getMonth() + 1;
  document.getElementById("input-ano").value = now.getFullYear();
  document.getElementById("filtro-mes").value = now.getMonth() + 1;
  document.getElementById("filtro-ano").value = now.getFullYear();
  document.getElementById("input-data").value = now.toISOString().slice(0, 10);
  updateTopbarPeriod();
};

const updateTopbarPeriod = () => {
  const mes = document.getElementById("filtro-mes").value;
  const ano = document.getElementById("filtro-ano").value;
  const labelMes = [
    "",
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const text = mes && ano ? `${labelMes[mes]}/${ano}` : "Sem período selecionado";
  document.getElementById("topbar-current-period").textContent = text;
};

// ==========================
// NAVEGAÇÃO SIDEBAR
// ==========================
const initSidebarNavigation = () => {
  const links = document.querySelectorAll(".sidebar-link[data-section]");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const sectionId = link.getAttribute("data-section");
      showSection(sectionId);
    });
  });
};

const showSection = (id) => {
  const sections = [
    "section-dashboard",
    "section-rateio",
    "section-relatorio",
    "section-historico",
  ];
  sections.forEach((sid) => {
    document.getElementById(sid).style.display =
      sid === "section-" + id ? "block" : "none";
  });
};

// ==========================
// VEÍCULOS
// ==========================
const initVeiculosButtons = () => {
  document.querySelectorAll("button[data-add-veiculo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rota = btn.getAttribute("data-add-veiculo");
      addVeiculo(rota);
    });
  });
};

const addVeiculo = (rota) => {
  const nome = prompt("Nome do veículo (ex: Ônibus 01):");
  if (!nome) return;
  const diaria = parseNumber(prompt("Diária (R$):"));
  const dias = parseNumber(prompt("Dias:"));
  const veiculo = { id: Date.now(), nome, diaria, dias };
  state.rotas[rota].veiculos.push(veiculo);
  calcular();
  renderAll();
};

const removeVeiculo = (rota, id) => {
  state.rotas[rota].veiculos = state.rotas[rota].veiculos.filter((v) => v.id !== id);
  calcular();
  renderAll();
};

// ==========================
// AÇÕES PRINCIPAIS
// ==========================
const initActions = () => {
  document.getElementById("btn-calcular").addEventListener("click", () => {
    readFormToState();
    calcular();
    renderAll();
  });

  document.getElementById("btn-salvar").addEventListener("click", () => {
    readFormToState();
    calcular();
    saveToStorage();
    renderAll();
    alert("Rateio salvo com sucesso no localStorage.");
  });

  document.getElementById("btn-aplicar-filtro").addEventListener("click", () => {
    updateTopbarPeriod();
    loadFromStorageForCurrentPeriod();
    renderAll();
  });

  document
    .getElementById("btn-recarregar-historico")
    .addEventListener("click", () => {
      renderHistorico();
    });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
      localStorage.removeItem(STORAGE_KEY);
      loadFromStorageForCurrentPeriod();
      renderAll();
    }
  });

  document.getElementById("btn-export-pdf").addEventListener("click", exportPDF);
};

// ==========================
// FORM -> STATE
// ==========================
const readFormToState = () => {
  state.data = document.getElementById("input-data").value;
  state.mes = document.getElementById("input-mes").value;
  state.ano = document.getElementById("input-ano").value;
  state.auxDinheiro = parseNumber(
    document.getElementById("input-aux-dinheiro").value
  );
  state.auxCombustivel = parseNumber(
    document.getElementById("input-aux-combustivel").value
  );
  state.descricao = document.getElementById("input-descricao").value;

  // Curvelo
  state.rotas.curvelo.alunosIntegrais = parseNumber(
    document.getElementById("curvelo-alunos-integrais").value
  );
  state.rotas.curvelo.alunosDesconto = parseNumber(
    document.getElementById("curvelo-alunos-desconto").value
  );
  state.rotas.curvelo.percDesconto = parseNumber(
    document.getElementById("curvelo-perc-desconto").value
  );
  state.rotas.curvelo.passagens = parseNumber(
    document.getElementById("curvelo-passagens").value
  );

  // Sete Lagoas
  state.rotas.sete.alunosIntegrais = parseNumber(
    document.getElementById("sete-alunos-integrais").value
  );
  state.rotas.sete.alunosDesconto = parseNumber(
    document.getElementById("sete-alunos-desconto").value
  );
  state.rotas.sete.percDesconto = parseNumber(
    document.getElementById("sete-perc-desconto").value
  );
  state.rotas.sete.passagens = parseNumber(
    document.getElementById("sete-passagens").value
  );
};

const writeStateToForm = () => {
  document.getElementById("input-data").value = state.data || "";
  document.getElementById("input-mes").value = state.mes || "";
  document.getElementById("input-ano").value = state.ano || "";
  document.getElementById("input-aux-dinheiro").value = state.auxDinheiro || "";
  document.getElementById("input-aux-combustivel").value =
    state.auxCombustivel || "";
  document.getElementById("input-descricao").value = state.descricao || "";

  document.getElementById("curvelo-alunos-integrais").value =
    state.rotas.curvelo.alunosIntegrais || "";
  document.getElementById("curvelo-alunos-desconto").value =
    state.rotas.curvelo.alunosDesconto || "";
  document.getElementById("curvelo-perc-desconto").value =
    state.rotas.curvelo.percDesconto || "";
  document.getElementById("curvelo-passagens").value =
    state.rotas.curvelo.passagens || "";

  document.getElementById("sete-alunos-integrais").value =
    state.rotas.sete.alunosIntegrais || "";
  document.getElementById("sete-alunos-desconto").value =
    state.rotas.sete.alunosDesconto || "";
  document.getElementById("sete-perc-desconto").value =
    state.rotas.sete.percDesconto || "";
  document.getElementById("sete-passagens").value =
    state.rotas.sete.passagens || "";
};

// ==========================
// LÓGICA DE CÁLCULO
// ==========================
const calcular = () => {
  const c = state.rotas.curvelo;
  const s = state.rotas.sete;

  const brutoCurvelo = c.veiculos.reduce(
    (sum, v) => sum + v.diaria * v.dias,
    0
  );
  const brutoSete = s.veiculos.reduce(
    (sum, v) => sum + v.diaria * v.dias,
    0
  );
  const totalBruto = brutoCurvelo + brutoSete;

  const percCurvelo = totalBruto ? (brutoCurvelo / totalBruto) * 100 : 0;
  const percSete = totalBruto ? (brutoSete / totalBruto) * 100 : 0;

  const auxTotal = state.auxDinheiro + state.auxCombustivel;
  const auxCurvelo = (auxTotal * brutoCurvelo) / (totalBruto || 1);
  const auxSete = (auxTotal * brutoSete) / (totalBruto || 1);

  const liquidoCurvelo = brutoCurvelo - auxCurvelo - (c.passagens || 0);
  const liquidoSete = brutoSete - auxSete - (s.passagens || 0);

  const alunosEqCurvelo =
    c.alunosIntegrais +
    c.alunosDesconto * (1 - (c.percDesconto || 0) / 100);
  const alunosEqSete =
    s.alunosIntegrais +
    s.alunosDesconto * (1 - (s.percDesconto || 0) / 100);

  const valorAlunoCurvelo =
    alunosEqCurvelo > 0 ? liquidoCurvelo / alunosEqCurvelo : 0;
  const valorAlunoSete =
    alunosEqSete > 0 ? liquidoSete / alunosEqSete : 0;

  const totalRateado = liquidoCurvelo + liquidoSete;
  const totalAlunosEq = alunosEqCurvelo + alunosEqSete;
  const veiculosAtivos = c.veiculos.length + s.veiculos.length;

  state.calculo = {
    brutoCurvelo,
    brutoSete,
    totalBruto,
    percCurvelo,
    percSete,
    auxTotal,
    auxCurvelo,
    auxSete,
    liquidoCurvelo,
    liquidoSete,
    alunosEqCurvelo,
    alunosEqSete,
    valorAlunoCurvelo,
    valorAlunoSete,
    totalRateado,
    totalAlunosEq,
    veiculosAtivos,
  };
};

// ==========================
// LOCALSTORAGE
// ==========================
const loadAllFromStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
};

const saveAllToStorage = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const saveToStorage = () => {
  const list = loadAllFromStorage();
  const key = `${state.ano}-${pad2(parseInt(state.mes || 0))}`;
  const existingIndex = list.findIndex((r) => r.key === key);
  const record = {
    key,
    createdAt: new Date().toISOString(),
    state,
  };
  if (existingIndex >= 0) {
    list[existingIndex] = record;
  } else {
    list.push(record);
  }
  saveAllToStorage(list);
};

const loadFromStorageForCurrentPeriod = () => {
  const mes = document.getElementById("filtro-mes").value;
  const ano = document.getElementById("filtro-ano").value;
  const key = `${ano}-${pad2(parseInt(mes || 0))}`;
  const list = loadAllFromStorage();
  const found = list.find((r) => r.key === key);
  if (found) {
    state = found.state;
    calcular();
    writeStateToForm();
  } else {
    const now = new Date();
    state = {
      data: "",
      mes: mes || (now.getMonth() + 1).toString(),
      ano: ano || now.getFullYear().toString(),
      auxDinheiro: 0,
      auxCombustivel: 0,
      descricao: "",
      rotas: {
        curvelo: {
          alunosIntegrais: 0,
          alunosDesconto: 0,
          percDesconto: 0,
          passagens: 0,
          veiculos: [],
        },
        sete: {
          alunosIntegrais: 0,
          alunosDesconto: 0,
          percDesconto: 0,
          passagens: 0,
          veiculos: [],
        },
      },
      calculo: state.calculo,
    };
    writeStateToForm();
    calcular();
  }
  renderHistorico();
};

// ==========================
// RENDERIZAÇÃO
// ==========================
let chartLine, chartPie, chartBar;
let chartLinePdf, chartPiePdf;

const renderAll = () => {
  renderVeiculosTables();
  renderDashboardCards();
  renderResumoDashboard();
  renderRelatorioTabela();
  renderRelatorioVeiculos();
  renderHistorico();
  renderCharts();
};

const renderVeiculosTables = () => {
  const curBody = document.getElementById("curvelo-veiculos-body");
  const seteBody = document.getElementById("sete-veiculos-body");
  curBody.innerHTML = "";
  seteBody.innerHTML = "";

  state.rotas.curvelo.veiculos.forEach((v) => {
    const tr = document.createElement("tr");
    const subtotal = v.diaria * v.dias;
    tr.innerHTML = `
      <td>${v.nome}</td>
      <td>${formatCurrency(v.diaria)}</td>
      <td>${v.dias}</td>
      <td>${formatCurrency(subtotal)}</td>
      <td><button class="btn btn-danger btn-sm">x</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () =>
      removeVeiculo("curvelo", v.id)
    );
    curBody.appendChild(tr);
  });

  state.rotas.sete.veiculos.forEach((v) => {
    const tr = document.createElement("tr");
    const subtotal = v.diaria * v.dias;
    tr.innerHTML = `
      <td>Sete Lagoas</td>
      <td>${v.nome}</td>
      <td>${formatCurrency(v.diaria)}</td>
      <td>${v.dias}</td>
      <td>${formatCurrency(subtotal)}</td>
      <td><button class="btn btn-danger btn-sm">x</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () =>
      removeVeiculo("sete", v.id)
    );
    seteBody.appendChild(tr);
  });

  document.getElementById("curvelo-bruto").textContent = formatCurrency(
    state.calculo.brutoCurvelo
  );
  document.getElementById("sete-bruto").textContent = formatCurrency(
    state.calculo.brutoSete
  );
};

const renderDashboardCards = () => {
  document.getElementById("card-total-rateado").textContent =
    formatCurrency(state.calculo.totalRateado);
  document.getElementById("card-total-alunos").textContent =
    state.calculo.totalAlunosEq.toFixed(2).replace(".", ",");
  document.getElementById("card-veiculos-ativos").textContent =
    state.calculo.veiculosAtivos;
  document.getElementById("card-auxilio-total").textContent =
    formatCurrency(state.calculo.auxTotal);
};

const renderResumoDashboard = () => {
  document.getElementById("resumo-bruto-curvelo").textContent =
    formatCurrency(state.calculo.brutoCurvelo);
  document.getElementById("resumo-bruto-sete").textContent =
    formatCurrency(state.calculo.brutoSete);
  document.getElementById("resumo-perc-curvelo").textContent =
    formatPercent(state.calculo.percCurvelo);
  document.getElementById("resumo-perc-sete").textContent =
    formatPercent(state.calculo.percSete);
  document.getElementById("resumo-aux-curvelo").textContent =
    formatCurrency(state.calculo.auxCurvelo);
  document.getElementById("resumo-aux-sete").textContent =
    formatCurrency(state.calculo.auxSete);
  document.getElementById("resumo-aluno-curvelo").textContent =
    formatCurrency(state.calculo.valorAlunoCurvelo);
  document.getElementById("resumo-aluno-sete").textContent =
    formatCurrency(state.calculo.valorAlunoSete);
};

const renderRelatorioTabela = () => {
  const tbody = document.getElementById("relatorio-body");
  tbody.innerHTML = "";

  const addRow = (descricao, cur, sete, obs = "") => {
    const tr = document.createElement("tr");
    const total = (cur || 0) + (sete || 0);
    tr.innerHTML = `
      <td>${descricao}</td>
      <td>${formatCurrency(cur || 0)}</td>
      <td>${formatCurrency(sete || 0)}</td>
      <td>${formatCurrency(total)}</td>
      <td>${obs}</td>
    `;
    tbody.appendChild(tr);
  };

  addRow("Bruto por rota", state.calculo.brutoCurvelo, state.calculo.brutoSete);
  addRow(
    "Passagens arrecadadas",
    state.rotas.curvelo.passagens,
    state.rotas.sete.passagens
  );
  addRow(
    "Auxílio distribuído",
    state.calculo.auxCurvelo,
    state.calculo.auxSete,
    "Proporcional ao bruto"
  );
  addRow(
    "Líquido após auxílio e passagens",
    state.calculo.liquidoCurvelo,
    state.calculo.liquidoSete
  );
  addRow(
    "Valor por aluno",
    state.calculo.valorAlunoCurvelo,
    state.calculo.valorAlunoSete,
    "Alunos equivalentes"
  );
  addRow(
    "Total rateado",
    state.calculo.liquidoCurvelo,
    state.calculo.liquidoSete,
    "Soma das rotas"
  );
};

const renderRelatorioVeiculos = () => {
  const tbody = document.getElementById("relatorio-veiculos-body");
  tbody.innerHTML = "";

  state.rotas.curvelo.veiculos.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Curvelo</td>
      <td>${v.nome}</td>
      <td>${formatCurrency(v.diaria)}</td>
      <td>${v.dias}</td>
      <td>${formatCurrency(v.diaria * v.dias)}</td>
    `;
    tbody.appendChild(tr);
  });

  state.rotas.sete.veiculos.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Sete Lagoas</td>
      <td>${v.nome}</td>
      <td>${formatCurrency(v.diaria)}</td>
      <td>${v.dias}</td>
      <td>${formatCurrency(v.diaria * v.dias)}</td>
    `;
    tbody.appendChild(tr);
  });
};

const renderHistorico = () => {
  const tbody = document.getElementById("historico-body");
  tbody.innerHTML = "";
  const list = loadAllFromStorage().sort((a, b) => a.key.localeCompare(b.key));

  const labelMes = [
    "",
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  list.forEach((r) => {
    const st = r.state;
    const tr = document.createElement("tr");
    const mesNum = parseInt(st.mes || 0);
    const periodo = (labelMes[mesNum] || "--") + "/" + (st.ano || "----");

    tr.innerHTML = `
      <td>${periodo}</td>
      <td>${st.data || "-"}</td>
      <td>${formatCurrency(st.calculo.brutoCurvelo)}</td>
      <td>${formatCurrency(st.calculo.brutoSete)}</td>
      <td>${formatCurrency(st.calculo.totalRateado)}</td>
      <td>${(st.calculo.totalAlunosEq || 0).toFixed(2).replace(".", ",")}</td>
      <td>${formatCurrency(st.calculo.auxTotal)}</td>
      <td>
        <button class="btn btn-outline btn-sm">Carregar</button>
      </td>
    `;
    tr.querySelector("button").addEventListener("click", () => {
      state = st;
      document.getElementById("input-mes").value = st.mes;
      document.getElementById("input-ano").value = st.ano;
      document.getElementById("filtro-mes").value = st.mes;
      document.getElementById("filtro-ano").value = st.ano;
      updateTopbarPeriod();
      writeStateToForm();
      calcular();
      renderAll();
      showSection("rateio");
      document
        .querySelectorAll(".sidebar-link")
        .forEach((l) => l.classList.remove("active"));
      document
        .querySelector('.sidebar-link[data-section="rateio"]')
        .classList.add("active");
    });
    tbody.appendChild(tr);
  });
};

// ==========================
// GRÁFICOS
// ==========================
const renderCharts = () => {
  const ctxLine = document.getElementById("chart-line").getContext("2d");
  const ctxPie = document.getElementById("chart-pie").getContext("2d");
  const ctxBar = document.getElementById("chart-bar").getContext("2d");

  const ctxLinePdf = document
    .getElementById("chart-line-pdf")
    .getContext("2d");
  const ctxPiePdf = document
    .getElementById("chart-pie-pdf")
    .getContext("2d");

  const list = loadAllFromStorage().sort((a, b) => a.key.localeCompare(b.key));
  const labelMes = [
    "",
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const labels = list.map((r) => {
    const st = r.state;
    const mesNum = parseInt(st.mes || 0);
    return (labelMes[mesNum] || "--") + "/" + (st.ano || "----");
  });
  const dataRateado = list.map((r) => r.state.calculo.totalRateado || 0);

  // Line
  if (chartLine) chartLine.destroy();
  chartLine = new Chart(ctxLine, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total rateado",
          data: dataRateado,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => "R$ " + v,
          },
        },
      },
    },
  });

  // Pie
  if (chartPie) chartPie.destroy();
  chartPie = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Curvelo", "Sete Lagoas"],
      datasets: [
        {
          data: [state.calculo.brutoCurvelo, state.calculo.brutoSete],
          backgroundColor: ["#4f46e5", "#06b6d4"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  // Bar
  if (chartBar) chartBar.destroy();
  chartBar = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: ["Curvelo", "Sete Lagoas"],
      datasets: [
        {
          label: "Bruto",
          data: [state.calculo.brutoCurvelo, state.calculo.brutoSete],
          backgroundColor: ["#4f46e5", "#06b6d4"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => "R$ " + v,
          },
        },
      },
    },
  });

  // Charts para PDF
  if (chartLinePdf) chartLinePdf.destroy();
  chartLinePdf = new Chart(ctxLinePdf, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total rateado",
          data: dataRateado,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => "R$ " + v,
          },
        },
      },
    },
  });

  if (chartPiePdf) chartPiePdf.destroy();
  chartPiePdf = new Chart(ctxPiePdf, {
    type: "pie",
    data: {
      labels: ["Curvelo", "Sete Lagoas"],
      datasets: [
        {
          data: [state.calculo.brutoCurvelo, state.calculo.brutoSete],
          backgroundColor: ["#4f46e5", "#06b6d4"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
};

// ==========================
// PDF (3 PÁGINAS)
// ==========================
const exportPDF = async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  await captureElementToPdfPage(pdf, "relatorio-tabela", 1);

  pdf.addPage();
  await captureElementToPdfPage(pdf, "relatorio-dashboard", 2);

  pdf.addPage();
  await captureElementToPdfPage(pdf, "relatorio-veiculos", 3);

  pdf.save("rateio-transporte.pdf");
};

const captureElementToPdfPage = async (pdf, elementId, pageNumber) => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.setFontSize(10);
  pdf.text(`Página ${pageNumber}`, 10, 10);
  pdf.addImage(imgData, "PNG", 10, 14, pdfWidth, pdfHeight);
};

// ==========================
// START
// ==========================
window.addEventListener("load", () => {
  init();
});
