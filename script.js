// Preços dos adicionais
const adicionais = {
  hamburguer160g: { nome: "Hambúrguer 160g", preco: 8.5 },
  picles: { nome: "Picles", preco: 7.0 },
  queijoCheddar: { nome: "Queijo Cheddar", preco: 4.0 },
  bacon: { nome: "Bacon", preco: 8.0 },
  cebolaCaramelizada: { nome: "Cebola Caramelizada", preco: 7.0 },
  alfaceAmericana: { nome: "Alface Americana", preco: 2.0 },
  tomate: { nome: "Tomate", preco: 2.0 },
  cebolaRoxa: { nome: "Cebola Roxa", preco: 2.5 },
  catupiry: { nome: "Catupiry", preco: 6.5 },
  doritos: { nome: "Doritos", preco: 5.0 },
};

// Armazenar itens do carrinho
const carrinho = {
  itens: {},
  total: 0,
  contador: 0, // Contador para gerar IDs únicos para cada item adicionado
  itemAtual: null, // Referência para o item sendo editado atualmente
  nomeCliente: "", // Nome do cliente para o pedido
};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("Documento carregado!");

  // Criar o modal de adicionais
  criarModalAdicionais();

  // Configurar eventos para os botões de adicionar e remover
  const botoesAdicionar = document.querySelectorAll(".btn-increase");
  const botoesRemover = document.querySelectorAll(".btn-decrease");

  botoesAdicionar.forEach((botao) => {
    botao.addEventListener("click", adicionarItem);
  });

  botoesRemover.forEach((botao) => {
    botao.addEventListener("click", removerItem);
  });

  // Adicionar evento para o botão de limpar carrinho
  const btnLimparCarrinho = document.getElementById("btnLimparCarrinho");
  if (btnLimparCarrinho) {
    btnLimparCarrinho.addEventListener("click", limparCarrinho);
  }

  // Configurar pesquisa
  configurarPesquisa();

  // Adicionar evento para atualizar o nome do cliente
  const nomeClienteInput = document.getElementById("nomeCliente");
  if (nomeClienteInput) {
    nomeClienteInput.addEventListener("input", function () {
      carrinho.nomeCliente = this.value.trim();
    });

    // Verificar se há um nome salvo no localStorage
    const nomeSalvo = localStorage.getItem("nomeCliente");
    if (nomeSalvo) {
      nomeClienteInput.value = nomeSalvo;
      carrinho.nomeCliente = nomeSalvo;
    }
  }
});

// Configurar a funcionalidade de pesquisa
function configurarPesquisa() {
  const pesquisaInput = document.getElementById("pesquisaInput");
  const btnPesquisar = document.getElementById("btnPesquisar");
  const searchResultsCount = document.getElementById("searchResultsCount");

  // Função para realizar a pesquisa
  function realizarPesquisa() {
    const termoPesquisa = pesquisaInput.value.trim().toLowerCase();

    if (termoPesquisa.length < 2) {
      // Remover destaques anteriores
      document.querySelectorAll(".item").forEach((item) => {
        item.classList.remove("destaque");
        item.style.display = "";
      });

      // Mostrar todas as seções
      document.querySelectorAll("section").forEach((section) => {
        section.style.display = "";
      });

      searchResultsCount.textContent = "";
      return;
    }

    let itensEncontrados = 0;
    const sections = document.querySelectorAll("section");

    // Para cada seção, verificar os itens
    sections.forEach((section) => {
      let itensVisiveis = 0;
      const itens = section.querySelectorAll(".item");

      itens.forEach((item) => {
        const nomeItem = item
          .querySelector(".item-name")
          .textContent.toLowerCase();
        const descricaoItem = item.querySelector(".item-desc")
          ? item.querySelector(".item-desc").textContent.toLowerCase()
          : "";

        // Verificar se o termo de pesquisa está presente no nome ou na descrição
        if (
          nomeItem.includes(termoPesquisa) ||
          descricaoItem.includes(termoPesquisa)
        ) {
          item.classList.add("destaque");
          item.style.display = "";
          itensVisiveis++;
          itensEncontrados++;
        } else {
          item.classList.remove("destaque");
          item.style.display = "none";
        }
      });

      // Mostrar ou ocultar a seção dependendo se há itens visíveis
      section.style.display = itensVisiveis > 0 ? "" : "none";
    });

    // Atualizar contador de resultados
    if (itensEncontrados === 0) {
      searchResultsCount.textContent = "Nenhum item encontrado";
    } else {
      searchResultsCount.textContent = `${itensEncontrados} ${
        itensEncontrados === 1 ? "item encontrado" : "itens encontrados"
      }`;
    }

    // Fazer scroll para o primeiro item encontrado
    const primeiroEncontrado = document.querySelector(".destaque");
    if (primeiroEncontrado) {
      primeiroEncontrado.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  // Vincular eventos
  btnPesquisar.addEventListener("click", realizarPesquisa);

  // Pesquisar ao pressionar Enter
  pesquisaInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      realizarPesquisa();
    } else if (e.key === "Escape") {
      pesquisaInput.value = "";
      realizarPesquisa();
    } else if (pesquisaInput.value.trim().length >= 2) {
      // Pesquisa automática enquanto digita (após 2 caracteres)
      setTimeout(realizarPesquisa, 300);
    }
  });

  // Adicionar evento de input para detectar quando o campo é limpo
  pesquisaInput.addEventListener("input", () => {
    // Se o campo estiver vazio, resetar a pesquisa imediatamente
    if (pesquisaInput.value.trim() === "") {
      realizarPesquisa();
    }
  });

  // Limpar pesquisa ao clicar no X do input (somente em navegadores que suportam)
  pesquisaInput.addEventListener("search", realizarPesquisa);
}

// Criar o modal de adicionais (uma única vez)
function criarModalAdicionais() {
  // Verificar se o modal já existe
  if (document.querySelector(".adicionais-modal-overlay")) {
    return;
  }

  // Criar o overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "adicionais-modal-overlay";

  // Criar container de adicionais
  const adicionaisContainer = document.createElement("div");
  adicionaisContainer.className = "adicionais-container";
  modalOverlay.appendChild(adicionaisContainer);

  // Adicionar título
  const titulo = document.createElement("h3");
  titulo.textContent = "Escolha seus adicionais:";
  adicionaisContainer.appendChild(titulo);

  // Adicionar botão para fechar
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close-adicionais";
  closeButton.innerHTML = "×";
  closeButton.addEventListener("click", fecharModalAdicionais);
  adicionaisContainer.appendChild(closeButton);

  // Criar lista de adicionais
  const adicionaisList = document.createElement("div");
  adicionaisList.className = "adicionais-list-select";
  adicionaisContainer.appendChild(adicionaisList);

  // Adicionar cada adicional à lista
  for (const [key, adicional] of Object.entries(adicionais)) {
    const adicionalItem = document.createElement("div");
    adicionalItem.className = "adicional-item";

    // Informações do adicional
    const adicionalInfo = document.createElement("div");
    adicionalInfo.className = "adicional-info";
    adicionalInfo.innerHTML = `
      <span class="adicional-nome">${adicional.nome}</span>
      <span class="adicional-preco">R$ ${adicional.preco.toFixed(2)}</span>
    `;

    // Controles de quantidade
    const quantidadeControle = document.createElement("div");
    quantidadeControle.className = "quantidade-controle";
    quantidadeControle.innerHTML = `
      <button type="button" class="btn-decrease-adicional" data-id="${key}">-</button>
      <span class="adicional-qty" data-id="${key}">0</span>
      <button type="button" class="btn-increase-adicional" data-id="${key}">+</button>
    `;

    // Adicionar eventos aos botões
    const btnDecrease = quantidadeControle.querySelector(
      ".btn-decrease-adicional"
    );
    const btnIncrease = quantidadeControle.querySelector(
      ".btn-increase-adicional"
    );

    btnDecrease.addEventListener("click", function () {
      const qtySpan = this.parentNode.querySelector(
        `.adicional-qty[data-id="${key}"]`
      );
      let quantidade = parseInt(qtySpan.textContent);
      if (quantidade > 0) {
        quantidade--;
        qtySpan.textContent = quantidade;
        atualizarResumoAdicionais();
      }
    });

    btnIncrease.addEventListener("click", function () {
      const qtySpan = this.parentNode.querySelector(
        `.adicional-qty[data-id="${key}"]`
      );
      let quantidade = parseInt(qtySpan.textContent) + 1;
      qtySpan.textContent = quantidade;
      atualizarResumoAdicionais();
    });

    adicionalItem.appendChild(adicionalInfo);
    adicionalItem.appendChild(quantidadeControle);
    adicionaisList.appendChild(adicionalItem);
  }

  // Resumo dos adicionais selecionados
  const selecionadosDiv = document.createElement("div");
  selecionadosDiv.className = "adicionais-selecionados";
  selecionadosDiv.innerHTML = "<p>Adicionais selecionados:</p><ul></ul>";
  adicionaisContainer.appendChild(selecionadosDiv);

  // Botão confirmar
  const btnConfirmar = document.createElement("button");
  btnConfirmar.type = "button";
  btnConfirmar.className = "btn-confirmar-adicionais";
  btnConfirmar.textContent = "Confirmar";
  btnConfirmar.addEventListener("click", confirmarAdicionais);
  adicionaisContainer.appendChild(btnConfirmar);

  // Adicionar o modal ao body
  document.body.appendChild(modalOverlay);
}

// Atualizar o resumo dos adicionais selecionados
function atualizarResumoAdicionais() {
  const selecionadosDiv = document.querySelector(".adicionais-selecionados");
  const selecionadosLista = selecionadosDiv.querySelector("ul");
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");

  // Obter todos os spans de quantidade
  const qtySpans = modalOverlay.querySelectorAll(".adicional-qty");

  // Limpar lista atual
  selecionadosLista.innerHTML = "";

  // Verificar se há adicionais selecionados
  let temSelecionados = false;
  let totalAdicionais = 0;

  qtySpans.forEach((span) => {
    const quantidade = parseInt(span.textContent);
    if (quantidade > 0) {
      temSelecionados = true;
      const adicionalId = span.dataset.id;
      const adicional = adicionais[adicionalId];
      const subtotal = adicional.preco * quantidade;
      totalAdicionais += subtotal;

      const li = document.createElement("li");
      li.textContent = `${quantidade}x ${adicional.nome} (R$ ${subtotal.toFixed(
        2
      )})`;
      selecionadosLista.appendChild(li);
    }
  });

  // Mostrar ou esconder o resumo
  selecionadosDiv.style.display = temSelecionados ? "block" : "none";

  // Adicionar total dos adicionais
  if (temSelecionados) {
    const totalLi = document.createElement("li");
    totalLi.className = "adicionais-total";
    totalLi.textContent = `Total adicionais: R$ ${totalAdicionais.toFixed(2)}`;
    selecionadosLista.appendChild(totalLi);
  }
}

// Função para abrir o modal de adicionais
function abrirModalAdicionais(itemDiv, id, nome, valor, tipo) {
  // Guardar referência ao item atual
  carrinho.itemAtual = { itemDiv, id, nome, valor, tipo };

  // Resetar todas as quantidades de adicionais
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  const qtySpans = modalOverlay.querySelectorAll(".adicional-qty");
  qtySpans.forEach((span) => {
    span.textContent = "0";
  });

  // Esconder o resumo
  const selecionadosDiv = modalOverlay.querySelector(
    ".adicionais-selecionados"
  );
  selecionadosDiv.style.display = "none";

  // Atualizar o título do modal
  modalOverlay.querySelector(
    "h3"
  ).textContent = `Escolha adicionais para: ${nome}`;

  // Mostrar o modal
  modalOverlay.classList.add("show");

  // Impedir o scroll da página
  document.body.style.overflow = "hidden";
}

// Função para fechar o modal de adicionais
function fecharModalAdicionais() {
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  modalOverlay.classList.remove("show");

  // Permitir o scroll da página
  document.body.style.overflow = "";

  // Limpar item atual
  carrinho.itemAtual = null;
}

// Função para confirmar adicionais e adicionar ao carrinho
function confirmarAdicionais() {
  if (!carrinho.itemAtual) return;

  const { id, nome, valor, tipo } = carrinho.itemAtual;

  // Obter adicionais selecionados
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  const qtySpans = modalOverlay.querySelectorAll(".adicional-qty");
  const adicionaisSelecionados = [];

  qtySpans.forEach((span) => {
    const quantidade = parseInt(span.textContent);
    if (quantidade > 0) {
      const adicionalId = span.dataset.id;

      for (let i = 0; i < quantidade; i++) {
        adicionaisSelecionados.push({
          id: adicionalId,
          nome: adicionais[adicionalId].nome,
          preco: adicionais[adicionalId].preco,
        });
      }
    }
  });

  // Adicionar item ao carrinho com os adicionais selecionados
  adicionarItemAoCarrinho(id, nome, valor, tipo, adicionaisSelecionados);

  // Fechar o modal
  fecharModalAdicionais();
}

// Função para mostrar pergunta sobre adicionais dentro do item
function mostrarPerguntaAdicionais(itemDiv, id, nome, valor, tipo) {
  // Remover pergunta anterior se existir
  const perguntaAnterior = itemDiv.querySelector(".pergunta-adicionais");
  if (perguntaAnterior) {
    perguntaAnterior.remove();
  }

  // Criar elemento da pergunta
  const perguntaDiv = document.createElement("div");
  perguntaDiv.className = "pergunta-adicionais";
  perguntaDiv.innerHTML = `
    <p>Deseja adicionar adicionais?</p>
    <div class="pergunta-botoes">
      <button type="button" class="btn-nao">Não</button>
      <button type="button" class="btn-sim">Sim</button>
    </div>
  `;

  // Adicionar após os controles de quantidade
  const itemActions = itemDiv.querySelector(".item-actions");
  itemActions.insertAdjacentElement("afterend", perguntaDiv);

  // Adicionar eventos aos botões
  const btnNao = perguntaDiv.querySelector(".btn-nao");
  const btnSim = perguntaDiv.querySelector(".btn-sim");

  btnNao.addEventListener("click", function () {
    // Remover a pergunta
    perguntaDiv.remove();

    // Adicionar o item diretamente ao carrinho sem adicionais
    adicionarItemAoCarrinho(id, nome, valor, tipo);
  });

  btnSim.addEventListener("click", function () {
    // Remover a pergunta
    perguntaDiv.remove();

    // Mostrar o modal de adicionais
    abrirModalAdicionais(itemDiv, id, nome, valor, tipo);
  });

  // Fazer scroll para a pergunta em telas pequenas
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      perguntaDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}

// Função para adicionar um item ao carrinho
function adicionarItem(event) {
  const itemDiv = event.target.closest(".item");
  const id = itemDiv.dataset.id;
  const nome = itemDiv.dataset.nome;
  const valor = parseFloat(itemDiv.dataset.valor);
  const tipo = itemDiv.dataset.tipo;

  // Atualizar quantidade na interface
  const qtySpan = itemDiv.querySelector(".item-qty");
  let quantidade = parseInt(qtySpan.textContent) + 1;
  qtySpan.textContent = quantidade;

  // Se for hambúrguer, perguntar se deseja adicionar adicionais
  if (tipo === "hamburguer") {
    // Mostrar a pergunta sobre adicionais dentro do item
    mostrarPerguntaAdicionais(itemDiv, id, nome, valor, tipo);
    return;
  }

  // Para itens que não são hambúrgueres, adicionar diretamente ao carrinho
  adicionarItemAoCarrinho(id, nome, valor, tipo);
}

// Função para adicionar um item ao carrinho (com ou sem adicionais)
function adicionarItemAoCarrinho(id, nome, valor, tipo, adicionaisList = []) {
  console.log("Adicionando ao carrinho:", nome, adicionaisList);

  // Gerar um ID único para este item específico
  carrinho.contador++;
  const itemUniqueKey = `item_${carrinho.contador}`;

  // Calcular preço total dos adicionais
  let adicionaisTotal = 0;

  adicionaisList.forEach((adicional) => {
    adicionaisTotal += adicional.preco;
  });

  // Adicionar novo item ao carrinho
  carrinho.itens[itemUniqueKey] = {
    id,
    nome,
    valor,
    quantidade: 1,
    adicionais: adicionaisList,
    adicionaisTotal,
    uniqueId: itemUniqueKey,
  };

  // Atualizar carrinho e total
  atualizarCarrinho();

  // Mostrar notificação de item adicionado
  mostrarNotificacao(`${nome} adicionado ao carrinho!`);
}

// Função para remover um item do carrinho
function removerItem(event) {
  const itemDiv = event.target.closest(".item");
  const id = itemDiv.dataset.id;

  // Atualizar quantidade na interface
  const qtySpan = itemDiv.querySelector(".item-qty");
  let quantidade = parseInt(qtySpan.textContent);

  if (quantidade > 0) {
    quantidade -= 1;
    qtySpan.textContent = quantidade;

    // Encontrar e remover o último item adicionado que corresponda ao id
    const itemsToRemove = [];
    for (const key in carrinho.itens) {
      const item = carrinho.itens[key];
      if (item.id === id) {
        itemsToRemove.push(key);
      }
    }

    if (itemsToRemove.length > 0) {
      // Remover o último item adicionado
      const itemToRemove = itemsToRemove[itemsToRemove.length - 1];
      const itemNome = carrinho.itens[itemToRemove].nome;
      delete carrinho.itens[itemToRemove];

      // Mostrar notificação de remoção
      mostrarNotificacao(`${itemNome} removido do carrinho`);
    }

    // Atualizar carrinho e total
    atualizarCarrinho();
  }
}

// Função para remover um item específico do carrinho (pelo botão X no carrinho)
function removerItemDoCarrinho(uniqueId) {
  if (carrinho.itens[uniqueId]) {
    const item = carrinho.itens[uniqueId];
    const id = item.id;
    const nome = item.nome;

    // Decrementar a quantidade exibida na interface
    const itemDivs = document.querySelectorAll(`.item[data-id="${id}"]`);
    itemDivs.forEach((itemDiv) => {
      const qtySpan = itemDiv.querySelector(".item-qty");
      let quantidade = parseInt(qtySpan.textContent);
      if (quantidade > 0) {
        quantidade -= 1;
        qtySpan.textContent = quantidade;
      }
    });

    // Remover item do carrinho
    delete carrinho.itens[uniqueId];

    // Mostrar notificação de item removido
    mostrarNotificacao(`${nome} removido do carrinho`);

    // Atualizar carrinho
    atualizarCarrinho();
  }
}

// Função para limpar todo o carrinho
function limparCarrinho() {
  // Verificar se há itens para limpar
  if (Object.keys(carrinho.itens).length > 0) {
    // Limpar todos os itens do carrinho
    carrinho.itens = {};
    carrinho.total = 0;

    // Resetar todas as quantidades na interface
    const qtySpans = document.querySelectorAll(".item-qty");
    qtySpans.forEach((span) => {
      span.textContent = "0";
    });

    // Mostrar notificação
    mostrarNotificacao("Carrinho limpo com sucesso!");

    // Atualizar a interface do carrinho
    atualizarCarrinho();

    // Não limpa o nome do cliente ao limpar o carrinho
  }
}

// Função para atualizar o carrinho e o total
function atualizarCarrinho() {
  console.log("Atualizando carrinho:", carrinho);

  const itensCarrinho = document.getElementById("itens-carrinho");
  const valorTotal = document.getElementById("valorTotal");

  if (!itensCarrinho || !valorTotal) {
    console.error("Elementos do carrinho não encontrados");
    return;
  }

  // Limpar o conteúdo atual do carrinho
  itensCarrinho.innerHTML = "";

  // Calcular novo total
  let total = 0;
  let temItens = false;

  for (const itemKey in carrinho.itens) {
    const item = carrinho.itens[itemKey];
    temItens = true;

    // Calcular subtotal do item
    const valorItem = item.valor;
    const valorAdicionais = item.adicionaisTotal || 0;
    const subtotal = valorItem + valorAdicionais;

    // Adicionar ao total
    total += subtotal;

    // Criar elemento de item no carrinho
    const divItem = document.createElement("div");
    divItem.className = "cart-item";
    divItem.dataset.uniqueId = item.uniqueId;

    // Texto do item (com ou sem adicional)
    let itemNome = `${item.nome}`;
    let adicionaisHtml = "";

    if (item.adicionais && item.adicionais.length > 0) {
      adicionaisHtml = '<div class="adicionais-list">';

      // Criar um mapa para contar ocorrências de cada adicional
      const adicionaisContagem = {};

      item.adicionais.forEach((adicional) => {
        if (!adicionaisContagem[adicional.id]) {
          adicionaisContagem[adicional.id] = {
            nome: adicional.nome,
            preco: adicional.preco,
            quantidade: 1,
          };
        } else {
          adicionaisContagem[adicional.id].quantidade++;
        }
      });

      // Gerar HTML para cada adicional com sua contagem
      for (const [id, info] of Object.entries(adicionaisContagem)) {
        adicionaisHtml += `<small>${info.quantidade}x ${info.nome} (R$ ${(
          info.preco * info.quantidade
        ).toFixed(2)})</small>`;
      }

      adicionaisHtml += "</div>";
    }

    divItem.innerHTML = `
      <div class="cart-item-name">
        ${itemNome}
        ${adicionaisHtml}
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-price">R$ ${subtotal.toFixed(2)}</div>
        <button type="button" class="btn-remove-item" onclick="removerItemDoCarrinho('${
          item.uniqueId
        }')">×</button>
      </div>
    `;

    itensCarrinho.appendChild(divItem);
  }

  // Mostrar mensagem se não houver itens
  if (!temItens) {
    itensCarrinho.innerHTML =
      '<p class="empty-cart">Seu carrinho está vazio</p>';
  }

  // Atualizar total
  carrinho.total = total;
  valorTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem) {
  // Remover notificação anterior se existir
  const notificacaoAnterior = document.querySelector(".notificacao");
  if (notificacaoAnterior) {
    notificacaoAnterior.remove();
  }

  // Criar elemento de notificação
  const notificacaoDiv = document.createElement("div");
  notificacaoDiv.className = "notificacao";
  notificacaoDiv.textContent = mensagem;

  // Adicionar ao body
  document.body.appendChild(notificacaoDiv);

  // Adicionar classe para animar a entrada
  setTimeout(() => {
    notificacaoDiv.classList.add("mostrar");
  }, 10);

  // Remover após alguns segundos
  setTimeout(() => {
    notificacaoDiv.classList.remove("mostrar");
    setTimeout(() => {
      notificacaoDiv.remove();
    }, 500);
  }, 3000);
}

// Função para imprimir o pedido
function imprimirPedido() {
  // Salvar o nome do cliente para uso futuro
  if (carrinho.nomeCliente) {
    localStorage.setItem("nomeCliente", carrinho.nomeCliente);
  }

  const printWindow = window.open("", "", "height=600,width=800");

  // Criar conteúdo HTML para impressão
  let conteudo = `
    <html>
    <head>
      <title>Imprimir Pedido</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; }
        h1 { color: #FF5722; text-align: center; margin-bottom: 20px; }
        h2 { color: #FF5722; margin-top: 30px; border-bottom: 1px solid #FF5722; padding-bottom: 5px; }
        .cliente { font-size: 1.2em; font-weight: bold; margin-bottom: 20px; padding: 10px; background-color: #f8f8f8; border-left: 4px solid #FF5722; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .item-nome { font-weight: bold; }
        .adicional { font-size: 0.9em; color: #666; margin-left: 20px; }
        .total { margin-top: 30px; font-weight: bold; text-align: right; font-size: 1.2em; }
        .data { margin-top: 40px; font-size: 0.8em; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Pedido Hamburgueria</h1>
  `;

  // Adicionar nome do cliente se existir
  if (carrinho.nomeCliente) {
    conteudo += `<div class="cliente">Cliente: ${carrinho.nomeCliente}</div>`;
  }

  conteudo += `
      <div class="pedido">
        <h2>Itens do Pedido</h2>
  `;

  // Adicionar itens ao conteúdo
  for (const itemKey in carrinho.itens) {
    const item = carrinho.itens[itemKey];
    const valorItem = item.valor;
    const valorAdicionais = item.adicionaisTotal || 0;
    const subtotal = valorItem + valorAdicionais;

    conteudo += `<div class="item">`;
    conteudo += `<div class="item-nome">${item.nome}`;

    if (item.adicionais && item.adicionais.length > 0) {
      // Criar um mapa para contar ocorrências de cada adicional
      const adicionaisContagem = {};

      item.adicionais.forEach((adicional) => {
        if (!adicionaisContagem[adicional.id]) {
          adicionaisContagem[adicional.id] = {
            nome: adicional.nome,
            preco: adicional.preco,
            quantidade: 1,
          };
        } else {
          adicionaisContagem[adicional.id].quantidade++;
        }
      });

      // Adicionar cada adicional com sua contagem
      for (const [id, info] of Object.entries(adicionaisContagem)) {
        conteudo += `<div class="adicional">${info.quantidade}x ${
          info.nome
        } (R$ ${(info.preco * info.quantidade).toFixed(2)})</div>`;
      }
    }

    conteudo += `</div>`;
    conteudo += `<div class="item-preco">R$ ${subtotal.toFixed(2)}</div>`;
    conteudo += `</div>`;
  }

  // Adicionar total e data
  const data = new Date().toLocaleString("pt-BR");
  conteudo += `
        <div class="total">Total: R$ ${carrinho.total.toFixed(2)}</div>
        <div class="data">Pedido realizado em: ${data}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(conteudo);
  printWindow.document.close();
  printWindow.print();
}
