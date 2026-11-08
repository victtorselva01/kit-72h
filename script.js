// 1. DADOS: agora cada item tem um id fixo
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

// 2. ARMAZENAMENTO
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

// 3. RENDERIZAÇÃO
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
      });

      rotulo.appendChild(caixa);
      rotulo.appendChild(document.createTextNode(" " + item.texto));
      secao.appendChild(rotulo);
    });

    container.appendChild(secao);
  });
}

renderizar();