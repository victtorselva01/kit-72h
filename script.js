// ============================================
// 1. DADOS
// - id: fixo, nunca mude depois de publicar
// - icone: emoji da categoria
// - porPessoa: opcional, só onde há fonte para o número
//   (água: 2 litros por pessoa por dia x 3 dias = 6 litros)
// - dica: opcional, frase curta de bom senso (sugestão do site)
// - ideias: opcional, sugestões do site (não oficiais)
// ============================================
const categorias = [
  {
    nome: "Água e alimentos",
    icone: "💧",
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
      {
        id: "abridor",
        texto: "Abridor de latas",
        dica: "Sem ele, as latas ficam inúteis. Prefira latas com abertura fácil como reserva."
      }
    ]
  },
  {
    nome: "Saúde e higiene",
    icone: "🩹",
    itens: [
      { id: "primeiros-socorros", texto: "Kit de primeiros socorros" },
      {
        id: "medicamentos",
        texto: "Medicamentos de uso contínuo",
        dica: "Confira as validades e, em caso de dúvida, pergunte ao seu médico ou farmacêutico."
      },
      { id: "higiene", texto: "Itens de higiene pessoal" }
    ]
  },
  {
    nome: "Energia e comunicação",
    icone: "🔦",
    itens: [
      {
        id: "lanterna",
        texto: "Lanterna",
        dica: "Prefira lanterna a velas, que oferecem risco de incêndio."
      },
      {
        id: "pilhas",
        texto: "Pilhas extras",
        dica: "Confira se o tamanho serve para a lanterna e para o rádio."
      },
      {
        id: "radio",
        texto: "Rádio a pilha",
        dica: "Funciona sem internet e sem energia elétrica."
      },
      {
        id: "power-bank",
        texto: "Carregador portátil (power bank)",
        dica: "Deixe sempre carregado para manter o celular funcionando."
      }
    ]
  },
  {
    nome: "Documentos e contatos",
    icone: "📄",
    itens: [
      {
        id: "documentos",
        texto: "Cópias de documentos",
        dica: "Guarde em saco plástico bem fechado, para proteger da umidade."
      },
      {
        id: "contatos",
        texto: "Lista de telefones em papel (199 Defesa Civil, 193 Bombeiros)",
        dica: "O celular pode ficar sem bateria ou sem sinal."
      }
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
// Totais são calculados a partir do estado, nunca guardados
// ============================================
function contarFeitos(itens, progresso) {
  return itens.filter(function (item) {
    return progresso[item.id];
  }).length;
}
 
function atualizarProgresso(progresso) {
  const texto = document.getElementById("progresso-texto");
  const barra = document.getElementById("progresso-barra");
 
  const total = todosOsItens.length;
  const feitos = contarFeitos(todosOsItens, progresso);
 
  barra.max = total;
  barra.value = feitos;
 
  texto.textContent = feitos === total
    ? "Kit completo! Lembre-se de revisar as validades de tempos em tempos."
    : feitos + " de " + total + " itens";
}
 
// Contador de cada categoria ("2/3") e estado de categoria completa
const contagens = [];
 
function atualizarContagens(progresso) {
  contagens.forEach(function (c) {
    const total = c.categoria.itens.length;
    const feitos = contarFeitos(c.categoria.itens, progresso);
    const completa = feitos === total;
 
    c.elemento.textContent = completa ? feitos + "/" + total + " ✓" : feitos + "/" + total;
    c.secao.classList.toggle("completa", completa);
  });
}
 
// Um único ponto de atualização: evita esquecer de atualizar alguma parte da tela
function atualizarTudo(progresso) {
  atualizarProgresso(progresso);
  atualizarContagens(progresso);
}
 
// ============================================
// 4. QUANTIDADES POR PESSOA
// ============================================
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
// 5. PEÇAS DA INTERFACE
// ============================================
function criarTituloCategoria(categoria, secao) {
  const titulo = document.createElement("h2");
 
  const icone = document.createElement("span");
  icone.className = "icone";
  icone.setAttribute("aria-hidden", "true"); // decorativo: leitores de tela ignoram
  icone.textContent = categoria.icone;
 
  const nome = document.createElement("span");
  nome.textContent = categoria.nome;
 
  const contagem = document.createElement("span");
  contagem.className = "contagem";
 
  titulo.appendChild(icone);
  titulo.appendChild(nome);
  titulo.appendChild(contagem);
 
  contagens.push({ categoria: categoria, secao: secao, elemento: contagem });
  return titulo;
}
 
function criarDica(item) {
  const dica = document.createElement("p");
  dica.className = "dica";
  dica.textContent = item.dica;
  return dica;
}
 
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
    secao.appendChild(criarTituloCategoria(categoria, secao));
 
    categoria.itens.forEach(function (item) {
      const rotulo = document.createElement("label");
 
      const caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.checked = Boolean(progresso[item.id]);
      caixa.addEventListener("change", function () {
        progresso[item.id] = caixa.checked;
        salvar(CHAVE_PROGRESSO, progresso);
        atualizarTudo(progresso);
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
 
      // Dica e ideias ficam FORA do label, para não acionar o checkbox
      if (item.dica) {
        secao.appendChild(criarDica(item));
      }
      if (item.ideias) {
        secao.appendChild(criarIdeias(item));
      }
    });
 
    container.appendChild(secao);
  });
 
  atualizarTudo(progresso); // mostra os valores certos ao abrir a página
}
 
// ============================================
// 7. INICIALIZAÇÃO
// A ordem importa: primeiro renderizar (cria os elementos),
// depois configurar as pessoas (atualiza as quantidades)
// ============================================
renderizar();
configurarPessoas();
 