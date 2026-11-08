// ============================================
// 1. DADOS
// Cada item tem um id fixo (nunca mude um id depois de publicar)
// ============================================
const categorias = [
  {
    nome: "Água e alimentos",
    itens: [
      { id: "agua", texto: "Água potável" },
      { id: "alimentos", texto: "Alimentos não perecíveis" },
      { id: "abridor", texto: "Abridor de latas" }
    ]
  },
  {
    nome: "Saúde e higiene",
    itens: [
      { id: "primeiros-socorros", texto: "Kit de primeiros socorros" },
      { id: "medicamentos", texto: "Medicamentos de uso contínuo" },
      { id: "higiene", texto: "Itens de higiene pessoal" }
    ]
  },
  {
    nome: "Energia e comunicação",
    itens: [
      { id: "lanterna", texto: "Lanterna" },
      { id: "pilhas", texto: "Pilhas extras" },
      { id: "radio", texto: "Rádio a pilha" },
      { id: "power-bank", texto: "Carregador portátil (power bank)" }
    ]
  },
  {
    nome: "Documentos e contatos",
    itens: [
      { id: "documentos", texto: "Cópias de documentos" },
      { id: "contatos", texto: "Lista de telefones em papel (199 Defesa Civil, 193 Bombeiros)" }
    ]
  }
];

// Lista "achatada" com todos os itens, sem separar por categoria
const todosOsItens = categorias.flatMap(function (categoria) {
  return categoria.itens;
});

// ============================================
// 2. ARMAZENAMENTO (localStorage)
// ============================================
const CHAVE = "kit72h-progresso";

function carregarProgresso() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || {};
  } catch (erro) {
    return {}; // dado corrompido ou storage indisponível: começa do zero
  }
}

function salvarProgresso(progresso) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(progresso));
  } catch (erro) {
    // se não der para salvar, o site continua funcionando normalmente
  }
}

// ============================================
// 3. PROGRESSO
// O total de itens marcados é calculado a partir do estado,
// nunca guardado separadamente
// ============================================
function atualizarProgresso(progresso) {
  const texto = document.getElementById("progresso-texto");
  const barra = document.getElementById("progresso-barra");

  const total = todosOsItens.length;
  const feitos = todosOsItens.filter(function (item) {
    return progresso[item.id];
  }).length;

  barra.max = total;
  barra.value = feitos;

  texto.textContent = feitos === total
    ? "Kit completo! Lembre-se de revisar as validades de tempos em tempos."
    : feitos + " de " + total + " itens";
}

// ============================================
// 4. RENDERIZAÇÃO
// ============================================
function renderizar() {
  const container = document.getElementById("checklist");
  const progresso = carregarProgresso();

  categorias.forEach(function (categoria) {
    const secao = document.createElement("section");

    const titulo = document.createElement("h2");
    titulo.textContent = categoria.nome;
    secao.appendChild(titulo);

    categoria.itens.forEach(function (item) {
      const rotulo = document.createElement("label");

      const caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.checked = Boolean(progresso[item.id]);

      caixa.addEventListener("change", function () {
        progresso[item.id] = caixa.checked;
        salvarProgresso(progresso);
        atualizarProgresso(progresso);
      });

      rotulo.appendChild(caixa);
      rotulo.appendChild(document.createTextNode(" " + item.texto));
      secao.appendChild(rotulo);
    });

    container.appendChild(secao);
  });

  atualizarProgresso(progresso); // mostra o valor certo ao abrir a página
}

renderizar();