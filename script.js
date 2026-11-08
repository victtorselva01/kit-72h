// ============================================
// 1. DADOS
// - id: fixo, nunca mude depois de publicar
// - porPessoa: opcional, só onde há fonte para o número
//   (água: 2 litros por pessoa por dia x 3 dias = 6 litros)
// - ideias: opcional, sugestões do site (não oficiais)
// ============================================
const categorias = [
  {
    nome: "Água e alimentos",
    itens: [
      {
        id: "agua",
        texto: "Água potável",
        porPessoa: { quantidade: 6, unidade: "litros" }
      },
      {
        id: "alimentos",
        texto: "Alimentos não perecíveis (frutas secas, barras de cereais, biscoitos, enlatados)",
        ideias: {
          lista: [
            "Atum ou sardinha em lata, de preferência com abertura fácil",
            "Feijão, milho ou grão-de-bico em lata",
            "Pasta de amendoim e castanhas",
            "Bolachas de água e sal",
            "Goiabada ou geleia",
            "Leite longa vida e suco em caixinha",
            "Barras de cereais e frutas secas"
          ],
          nota: "Sugestões do site, que não fazem parte da lista oficial da Defesa Civil. Prefira itens que não precisem de geladeira nem de cozimento e considere alergias, restrições alimentares e as necessidades de bebês e idosos."
        }
      },
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
// 2. ARMAZENAMENTO (funções genéricas, servem para qualquer chave)
// ============================================
const CHAVE_PROGRESSO = "kit72h-progresso";
const CHAVE_PESSOAS = "kit72h-pessoas";
const MAX_PESSOAS = 20;

function carregar(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch (erro) {
    return padrao; // dado corrompido ou storage indisponível
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    // se não der para salvar, o site continua funcionando
  }
}

// ============================================
// 3. PROGRESSO
// O total é calculado a partir do estado, nunca guardado separadamente
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
// 4. QUANTIDADES POR PESSOA
// ============================================
// Referências aos elementos que mostram quantidades,
// para atualizá-los sem refazer a página inteira
const quantidades = [];

function normalizarPessoas(valor) {
  const n = parseInt(valor, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(n, MAX_PESSOAS);
}

function atualizarQuantidades(pessoas) {
  quantidades.forEach(function (q) {
    const total = q.item.porPessoa.quantidade * pessoas;
    q.elemento.textContent = total + " " + q.item.porPessoa.unidade;
  });
}

function configurarPessoas() {
  const campo = document.getElementById("pessoas-input");
  let pessoas = normalizarPessoas(carregar(CHAVE_PESSOAS, 1));

  campo.value = pessoas;
  atualizarQuantidades(pessoas);

  // "input": dispara a cada tecla digitada
  campo.addEventListener("input", function () {
    pessoas = normalizarPessoas(campo.value);
    atualizarQuantidades(pessoas);
    salvar(CHAVE_PESSOAS, pessoas);
  });

  // "change": dispara ao sair do campo; corrige o valor exibido
  campo.addEventListener("change", function () {
    campo.value = pessoas;
  });
}

// ============================================
// 5. IDEIAS (bloco que abre e fecha, sem JavaScript de interação)
// ============================================
function criarIdeias(item) {
  const detalhes = document.createElement("details");
  detalhes.className = "ideias";

  const resumo = document.createElement("summary");
  resumo.textContent = "Ideias para este item";
  detalhes.appendChild(resumo);

  const lista = document.createElement("ul");
  item.ideias.lista.forEach(function (ideia) {
    const li = document.createElement("li");
    li.textContent = ideia;
    lista.appendChild(li);
  });
  detalhes.appendChild(lista);

  const nota = document.createElement("p");
  nota.className = "ideias-nota";
  nota.textContent = item.ideias.nota;
  detalhes.appendChild(nota);

  return detalhes;
}

// ============================================
// 6. RENDERIZAÇÃO
// ============================================
function renderizar() {
  const container = document.getElementById("checklist");
  const progresso = carregar(CHAVE_PROGRESSO, {});

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
        salvar(CHAVE_PROGRESSO, progresso);
        atualizarProgresso(progresso);
      });

      const texto = document.createElement("span");
      texto.textContent = item.texto;

      rotulo.appendChild(caixa);
      rotulo.appendChild(texto);

      // Só mostra quantidade se o item tiver essa informação
      if (item.porPessoa) {
        const detalhe = document.createElement("span");
        detalhe.className = "detalhe";
        rotulo.appendChild(detalhe);
        quantidades.push({ item: item, elemento: detalhe });
      }

      secao.appendChild(rotulo);

      // As ideias ficam FORA do label, para não acionar o checkbox
      if (item.ideias) {
        secao.appendChild(criarIdeias(item));
      }
    });

    container.appendChild(secao);
  });

  atualizarProgresso(progresso); // mostra o valor certo ao abrir a página
}

// ============================================
// 7. INICIALIZAÇÃO
// A ordem importa: primeiro renderizar (cria os elementos),
// depois configurar as pessoas (atualiza as quantidades)
// ============================================
renderizar();
configurarPessoas();