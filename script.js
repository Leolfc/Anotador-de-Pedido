// Preços dos adicionais (mantenha sua lista original)
const adicionais = {
  hamburguer160g: { nome: "Hambúrguer 160g", preco: 8.5 },
  picles: { nome: "Picles", preco: 7.0 },
  queijoCheddar: { nome: "Queijo Cheddar", preco: 4.0 },
  queijoMussarela: { nome: "Queijo Mussarela", preco: 3.0 },
  bacon: { nome: "Bacon", preco: 8.0 },
  cebolaCaramelizada: { nome: "Cebola Caramelizada", preco: 7.0 },
  alfaceAmericana: { nome: "Alface Americana", preco: 2.0 },
  tomate: { nome: "Tomate", preco: 2.0 },
  cebolaRoxa: { nome: "Cebola Roxa", preco: 2.5 },
  catupiry: { nome: "Catupiry", preco: 6.5 },
  doritos: { nome: "Doritos", preco: 5.0 },
};

// NOVO: Taxas de Entrega por Bairro (mesma do projeto anterior)
const taxasDeEntrega = {
  Centro: 7.0,
  "Dom Pedro Filipack": 7.0,
  "Bairro Aeroporto": 12.0,
  "Vila Leão": 10.0,
  "Parque dos Mirantes": 7.0,
  "Novo Aeroporto": 14.00,
  "Jardim São Luis 1": 8.0,
  "Jardim São Luis 2": 8.0,
  "Nova Jacarezinho": 8.0,
  "Vila Setti": 8.0,
  "Vila São Pedro": 7.0,
  "Vila Rondon": 7.0,
  "Residencial Pompeia I": 8.0,
  "Residencial Pompeia II": 8.0,
  "Residencial Pompeia III": 8.0,
  "Parque Bela Vista": 6.0,
  "Jardim Europa": 7.0,
  "Jardim Canada": 7.0,
  "Jardim Panorama": 10.0,
  "Jardim Morada do Sol": 8.0,
  "Outro Bairro (Consultar)": 0,
};

// Armazenar itens do pedido
const carrinho = {
  itens: {},
  total: 0,
  contador: 0,
  itemAtual: null,
  nomeCliente: "",
  enderecoCliente: "", // Agora usado principalmente para entrega
  formaPagamento: "",
  // NOVAS PROPRIEDADES PARA ENTREGA
  tipoServico: "entrega", // Valor padrão
  bairroSelecionado: "",
  taxaEntrega: 0,
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Documento de Impressão de Pedidos Carregado!");

  criarModalAdicionais();
  adicionarEstruturaObservacaoCardapio(); 

  const botoesAdicionar = document.querySelectorAll(".btn-increase");
  botoesAdicionar.forEach((botao) => {
    botao.textContent = "Adicionar";
    botao.addEventListener("click", adicionarItem);
  });

  const botoesRemover = document.querySelectorAll(".btn-decrease");
  botoesRemover.forEach((botao) => {
    botao.textContent = "Remover";
    botao.addEventListener("click", removerItem);
  });

  const btnLimparCarrinho = document.getElementById("btnLimparCarrinho");
  if (btnLimparCarrinho) {
    btnLimparCarrinho.addEventListener("click", limparCarrinho);
  }

  configurarPesquisa();

  // --- INÍCIO: LÓGICA DE ENTREGA/RETIRADA ---
  const radioEntrega = document.getElementById("tipoServicoEntrega");
  const radioRetirada = document.getElementById("tipoServicoRetirada");
  const camposEntregaDiv = document.getElementById("camposEntrega"); // Div que agrupa endereço e bairro
  const bairroSelect = document.getElementById("bairroSelect");
  const taxaEntregaInfoDiv = document.getElementById("taxaEntregaInfo"); // Para mostrar a taxa do bairro
  const enderecoClienteTextarea = document.getElementById("enderecoCliente"); // Já existe

  if (bairroSelect) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione o bairro";
    bairroSelect.appendChild(defaultOption);
    for (const bairro in taxasDeEntrega) {
      const option = document.createElement("option");
      option.value = bairro;
      option.textContent = bairro;
      bairroSelect.appendChild(option);
    }
  }

  function gerenciarCamposEntrega() {
    if (!radioEntrega || !camposEntregaDiv) return; // Segurança
    if (radioEntrega.checked) {
      camposEntregaDiv.style.display = "block";
      carrinho.tipoServico = "entrega";
      // Se já havia um bairro selecionado, recalcula a taxa
      if(bairroSelect.value) atualizarTaxaSelecionada(); else taxaEntregaInfoDiv.textContent = "Selecione um bairro para ver a taxa.";
    } else { // Retirada selecionada
      camposEntregaDiv.style.display = "none";
      carrinho.tipoServico = "retirada";
      carrinho.bairroSelecionado = "";
      carrinho.taxaEntrega = 0;
      if(taxaEntregaInfoDiv) taxaEntregaInfoDiv.textContent = "";
      if(bairroSelect) bairroSelect.value = ""; // Reseta o select de bairro
    }
    localStorage.setItem("impressao_tipoServico", carrinho.tipoServico);
    atualizarCarrinho();
  }

  function atualizarTaxaSelecionada() {
    if (!bairroSelect || !taxaEntregaInfoDiv) return; // Segurança
    const bairro = bairroSelect.value;
    if (bairro && carrinho.tipoServico === "entrega") {
      carrinho.bairroSelecionado = bairro;
      carrinho.taxaEntrega = taxasDeEntrega[bairro] !== undefined ? taxasDeEntrega[bairro] : 0;
      if (taxasDeEntrega[bairro] !== undefined) {
        taxaEntregaInfoDiv.textContent = bairro === "Outro Bairro (Consultar)" ? "Taxa: A consultar" : `Taxa de Entrega: R$ ${carrinho.taxaEntrega.toFixed(2)}`;
      } else {
        taxaEntregaInfoDiv.textContent = "Selecione um bairro válido";
        carrinho.taxaEntrega = 0;
      }
    } else {
      carrinho.bairroSelecionado = "";
      carrinho.taxaEntrega = 0;
      taxaEntregaInfoDiv.textContent = carrinho.tipoServico === "entrega" ? "Selecione um bairro para ver a taxa." : "";
    }
    localStorage.setItem("impressao_bairroSelecionado", carrinho.bairroSelecionado);
    atualizarCarrinho();
  }

  if (radioEntrega) radioEntrega.addEventListener("change", gerenciarCamposEntrega);
  if (radioRetirada) radioRetirada.addEventListener("change", gerenciarCamposEntrega);
  if (bairroSelect) bairroSelect.addEventListener("change", atualizarTaxaSelecionada);
  // --- FIM: LÓGICA DE ENTREGA/RETIRADA ---

  const nomeClienteInput = document.getElementById("nomeCliente");
  if (nomeClienteInput) {
    nomeClienteInput.addEventListener("input", function () {
      carrinho.nomeCliente = this.value.trim();
      localStorage.setItem("impressao_nomeCliente", carrinho.nomeCliente);
    });
    const nomeSalvo = localStorage.getItem("impressao_nomeCliente");
    if (nomeSalvo) {
      nomeClienteInput.value = nomeSalvo;
      carrinho.nomeCliente = nomeSalvo;
    }
  }

  if (enderecoClienteTextarea) { // Usando a referência já declarada
    enderecoClienteTextarea.addEventListener("input", function () {
      carrinho.enderecoCliente = this.value.trim();
      localStorage.setItem("impressao_enderecoCliente", carrinho.enderecoCliente);
    });
    const enderecoSalvo = localStorage.getItem("impressao_enderecoCliente");
    if (enderecoSalvo) {
      enderecoClienteTextarea.value = enderecoSalvo;
      carrinho.enderecoCliente = enderecoSalvo;
    }
  }

  const formaPagamentoSelect = document.getElementById("formaPagamento");
  if (formaPagamentoSelect) {
    formaPagamentoSelect.addEventListener("change", function () {
      carrinho.formaPagamento = this.value;
      if (this.value) {
        localStorage.setItem("impressao_formaPagamento", this.value);
      }
    });
    const formaPagamentoSalva = localStorage.getItem("impressao_formaPagamento");
    if (formaPagamentoSalva) {
      formaPagamentoSelect.value = formaPagamentoSalva;
      carrinho.formaPagamento = formaPagamentoSalva;
    }
  }
  
  // Carregar dados de entrega/retirada do localStorage
  const tipoServicoSalvo = localStorage.getItem("impressao_tipoServico");
  if (tipoServicoSalvo) {
    if (tipoServicoSalvo === "retirada" && radioRetirada) {
      radioRetirada.checked = true;
    } else if (radioEntrega) { // Default para entrega
      radioEntrega.checked = true;
    }
    carrinho.tipoServico = tipoServicoSalvo;
  }

  gerenciarCamposEntrega(); // Chamar para definir o estado inicial dos campos de entrega

  const bairroSalvo = localStorage.getItem("impressao_bairroSelecionado");
  if (bairroSalvo && carrinho.tipoServico === "entrega" && bairroSelect) {
    const existeOpcao = Array.from(bairroSelect.options).some(opt => opt.value === bairroSalvo);
    if (existeOpcao) {
        bairroSelect.value = bairroSalvo;
        // carrinho.bairroSelecionado já foi setado por atualizarTaxaSelecionada ou será setado agora
        atualizarTaxaSelecionada(); // Garante que a taxa seja carregada
    } else {
        bairroSelect.value = "";
        localStorage.removeItem("impressao_bairroSelecionado");
    }
  } else if (carrinho.tipoServico === "entrega" && taxaEntregaInfoDiv) {
     taxaEntregaInfoDiv.textContent = "Selecione um bairro para ver a taxa.";
  }


  configurarAlternadorTema();
  configurarBotoesFlutuantes();
  
  const btnImprimirPedido = document.getElementById("btnImprimirPedido");
  if (btnImprimirPedido) {
    btnImprimirPedido.addEventListener("click", imprimirPedido);
  }
  atualizarCarrinho(); // Atualiza o carrinho ao carregar (inclusive o contador)
});

// Função simplificada, observação principal virá do modal
function adicionarEstruturaObservacaoCardapio() {
    const itensComObservacao = document.querySelectorAll('.item[data-tipo="hamburguer"], .item[data-tipo="combo"]');
    itensComObservacao.forEach((item) => {
        if (!item.querySelector(".item-observacao-placeholder")) {
            const placeholderDiv = document.createElement("div");
            placeholderDiv.className = "item-observacao-placeholder";
            placeholderDiv.style.display = "none"; 
        }
    });
}

function configurarPesquisa() {
  const pesquisaInput = document.getElementById("pesquisaInput");
  const btnPesquisar = document.getElementById("btnPesquisar");
  const searchResultsCount = document.getElementById("searchResultsCount");

  function realizarPesquisa() {
    const termoPesquisa = pesquisaInput.value.trim().toLowerCase();
    if (termoPesquisa.length < 2) {
      document.querySelectorAll(".item").forEach((item) => {
        item.classList.remove("destaque");
        item.style.display = "";
      });
      document.querySelectorAll("section").forEach((section) => {
        section.style.display = "";
      });
      searchResultsCount.textContent = "";
      return;
    }
    let itensEncontrados = 0;
    const sections = document.querySelectorAll("section");
    sections.forEach((section) => {
      let itensVisiveis = 0;
      const itens = section.querySelectorAll(".item");
      itens.forEach((item) => {
        const nomeItem = item.querySelector(".item-name").textContent.toLowerCase();
        const descricaoItem = item.querySelector(".item-desc") ? item.querySelector(".item-desc").textContent.toLowerCase() : "";
        if (nomeItem.includes(termoPesquisa) || descricaoItem.includes(termoPesquisa)) {
          item.classList.add("destaque");
          item.style.display = "";
          itensVisiveis++;
          itensEncontrados++;
        } else {
          item.classList.remove("destaque");
          item.style.display = "none";
        }
      });
      section.style.display = itensVisiveis > 0 ? "" : "none";
    });
    searchResultsCount.textContent = itensEncontrados === 0 ? "Nenhum item encontrado" : `${itensEncontrados} ${itensEncontrados === 1 ? "item encontrado" : "itens encontrados"}`;
    const primeiroEncontrado = document.querySelector(".destaque");
    if (primeiroEncontrado) {
      primeiroEncontrado.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  if (btnPesquisar) btnPesquisar.addEventListener("click", realizarPesquisa);
  if (pesquisaInput) {
    pesquisaInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") realizarPesquisa();
      else if (e.key === "Escape") { pesquisaInput.value = ""; realizarPesquisa(); }
      else if (pesquisaInput.value.trim().length >= 2) setTimeout(realizarPesquisa, 300);
    });
    pesquisaInput.addEventListener("input", () => { if (pesquisaInput.value.trim() === "") realizarPesquisa(); });
    pesquisaInput.addEventListener("search", realizarPesquisa);
  }
}

function criarModalAdicionais() {
  if (document.querySelector(".adicionais-modal-overlay")) return;
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "adicionais-modal-overlay";
  const adicionaisContainer = document.createElement("div");
  adicionaisContainer.className = "adicionais-container";
  modalOverlay.appendChild(adicionaisContainer);
  const titulo = document.createElement("h3");
  titulo.textContent = "Escolha seus adicionais:";
  titulo.style.paddingRight = "40px";
  adicionaisContainer.appendChild(titulo);
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close-adicionais";
  closeButton.innerHTML = "×";
  closeButton.style.cssText = "position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;background-color:#f44336;color:white;font-size:24px;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;border:none;";
  closeButton.addEventListener("click", fecharModalAdicionais);
  adicionaisContainer.appendChild(closeButton);
  const adicionaisList = document.createElement("div");
  adicionaisList.className = "adicionais-list-select";
  adicionaisContainer.appendChild(adicionaisList);
  for (const [key, adicional] of Object.entries(adicionais)) {
    const adicionalItem = document.createElement("div");
    adicionalItem.className = "adicional-item";
    adicionalItem.dataset.id = key;
    adicionalItem.style.border = "1px solid #ff5722";
    adicionalItem.style.marginBottom = "10px";
    const adicionalInfo = document.createElement("div");
    adicionalInfo.className = "adicional-info";
    const adicionalNome = document.createElement("span");
    adicionalNome.className = "adicional-nome";
    adicionalNome.textContent = adicional.nome;
    adicionalNome.style.cssText = "font-weight:bold;font-size:16px;color:#333;";
    adicionalInfo.appendChild(adicionalNome);
    const adicionalPreco = document.createElement("span");
    adicionalPreco.className = "adicional-preco";
    adicionalPreco.textContent = `R$ ${adicional.preco.toFixed(2)}`;
    adicionalPreco.style.cssText = "font-weight:bold;color:#ff5722;";
    adicionalInfo.appendChild(adicionalPreco);
    const quantidadeControle = document.createElement("div");
    quantidadeControle.className = "quantidade-controle";
    const btnDecrease = document.createElement("button");
    btnDecrease.type = "button";
    btnDecrease.className = "btn-decrease-adicional";
    btnDecrease.textContent = "-";
    btnDecrease.dataset.id = key;
    btnDecrease.addEventListener("click", function () {
      const qtySpan = this.parentElement.querySelector(`.adicional-qty[data-id="${key}"]`);
      let quantidade = parseInt(qtySpan.textContent);
      if (quantidade > 0) { qtySpan.textContent = --quantidade; atualizarResumoAdicionais(); }
    });
    quantidadeControle.appendChild(btnDecrease);
    const qtySpan = document.createElement("span");
    qtySpan.className = "adicional-qty";
    qtySpan.dataset.id = key;
    qtySpan.textContent = "0";
    quantidadeControle.appendChild(qtySpan);
    const btnIncrease = document.createElement("button");
    btnIncrease.type = "button";
    btnIncrease.className = "btn-increase-adicional";
    btnIncrease.textContent = "+";
    btnIncrease.dataset.id = key;
    btnIncrease.addEventListener("click", function () {
      const qtySpan = this.parentElement.querySelector(`.adicional-qty[data-id="${key}"]`);
      qtySpan.textContent = parseInt(qtySpan.textContent) + 1;
      atualizarResumoAdicionais();
    });
    quantidadeControle.appendChild(btnIncrease);
    adicionalItem.appendChild(adicionalInfo);
    adicionalItem.appendChild(quantidadeControle);
    adicionaisList.appendChild(adicionalItem);
  }
  const observacoesDiv = document.createElement("div");
  observacoesDiv.className = "observacoes-container"; 
  observacoesDiv.innerHTML = `
    <h4 style="margin-top:15px; margin-bottom:5px;">Observações do Item</h4>
    <textarea id="observacoes-pedido" placeholder="Ex: sem cebola, ponto da carne, etc." style="width:100%; min-height:60px; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></textarea>
    <div class="opcoes-rapidas" style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">
        <button type="button" class="opcao-rapida" data-texto="Sem tomate">Sem tomate</button>
        <button type="button" class="opcao-rapida" data-texto="Sem cebola">Sem cebola</button>
        <button type="button" class="opcao-rapida" data-texto="Sem alface">Sem alface</button>
        <button type="button" class="opcao-rapida" data-texto="Bem passado">Bem passado</button>
        <button type="button" class="opcao-rapida" data-texto="Ao ponto">Ao ponto</button>
    </div>
  `;
  adicionaisContainer.appendChild(observacoesDiv);
  
  observacoesDiv.querySelectorAll(".opcao-rapida").forEach(opcao => {
    opcao.addEventListener("click", function () {
        const texto = this.dataset.texto;
        const textarea = document.getElementById("observacoes-pedido"); 
        textarea.value += (textarea.value ? ", " + texto : texto);
    });
  });

  const selecionadosDiv = document.createElement("div");
  selecionadosDiv.className = "adicionais-selecionados";
  selecionadosDiv.innerHTML = "<p>Adicionais selecionados:</p><ul></ul>";
  adicionaisContainer.appendChild(selecionadosDiv);
  const btnConfirmar = document.createElement("button");
  btnConfirmar.type = "button";
  btnConfirmar.className = "btn-confirmar-adicionais";
  btnConfirmar.textContent = "Confirmar";
  btnConfirmar.addEventListener("click", confirmarAdicionais);
  adicionaisContainer.appendChild(btnConfirmar);
  document.body.appendChild(modalOverlay);
}

function atualizarResumoAdicionais() {
  const selecionadosDiv = document.querySelector(".adicionais-selecionados");
  if (!selecionadosDiv) return;
  const selecionadosLista = selecionadosDiv.querySelector("ul");
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  if (!modalOverlay || !selecionadosLista) return;
  const qtySpans = modalOverlay.querySelectorAll(".adicional-qty");
  selecionadosLista.innerHTML = "";
  let temSelecionados = false;
  let totalAdicionaisValor = 0; 
  let totalItensAdicionais = 0; 
  qtySpans.forEach((span) => {
    const quantidade = parseInt(span.textContent);
    if (quantidade > 0) {
      temSelecionados = true;
      totalItensAdicionais += quantidade;
      const adicionalId = span.dataset.id;
      const adicional = adicionais[adicionalId];
      if (!adicional) return;
      const subtotal = adicional.preco * quantidade;
      totalAdicionaisValor += subtotal;
      const li = document.createElement("li");
      li.style.cssText = "padding:8px;margin-bottom:8px;background-color:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.1);";
      li.dataset.id = adicionalId;
      const itemDiv = document.createElement("div");
      itemDiv.className = "adicional-resumo";
      itemDiv.style.cssText = "display:flex;align-items:center;gap:10px;position:relative;";
      const qtySpanResumo = document.createElement("span");
      qtySpanResumo.className = "adicional-resumo-quantidade";
      qtySpanResumo.textContent = `${quantidade}x`;
      qtySpanResumo.style.cssText = "background-color:#ffebee;color:#e53935;border-radius:12px;padding:2px 8px;font-weight:bold;";
      itemDiv.appendChild(qtySpanResumo);
      const nomeSpan = document.createElement("span");
      nomeSpan.className = "adicional-resumo-nome";
      nomeSpan.textContent = adicional.nome;
      nomeSpan.style.cssText = "flex:1;font-weight:600;";
      itemDiv.appendChild(nomeSpan);
      const precoSpan = document.createElement("span");
      precoSpan.className = "adicional-resumo-preco";
      precoSpan.textContent = `R$ ${subtotal.toFixed(2)}`;
      precoSpan.style.cssText = "color:#ff5722;font-weight:700;";
      itemDiv.appendChild(precoSpan);
      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "btn-remover-adicional";
      btnRemover.textContent = "×";
      btnRemover.style.cssText = "background-color:#f44336;color:white;border:none;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;cursor:pointer;margin-left:5px;";
      btnRemover.addEventListener("click", function () {
        const qtySpanOriginal = modalOverlay.querySelector(`.adicional-qty[data-id="${adicionalId}"]`);
        if (qtySpanOriginal) { qtySpanOriginal.textContent = "0"; atualizarResumoAdicionais(); }
      });
      itemDiv.appendChild(btnRemover);
      li.appendChild(itemDiv);
      selecionadosLista.appendChild(li);
    }
  });
  selecionadosDiv.style.display = temSelecionados ? "block" : "none";
  if (temSelecionados) {
    selecionadosDiv.querySelector("p").textContent = `Adicionais selecionados (${totalItensAdicionais} ${totalItensAdicionais === 1 ? "item" : "itens"}):`;
    const totalLi = document.createElement("li");
    totalLi.className = "adicionais-total";
    totalLi.style.cssText = "margin-top:10px;padding-top:8px;border-top:1px dashed #ffccbc;";
    const totalDiv = document.createElement("div");
    totalDiv.className = "adicional-resumo-total";
    totalDiv.style.cssText = "display:flex;justify-content:space-between;align-items:center;font-weight:700;";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Total dos adicionais:";
    totalDiv.appendChild(labelSpan);
    const valorSpan = document.createElement("span");
    valorSpan.className = "adicional-resumo-valor";
    valorSpan.textContent = `R$ ${totalAdicionaisValor.toFixed(2)}`;
    valorSpan.style.cssText = "color:#ff5722;font-size:1.1rem;";
    totalDiv.appendChild(valorSpan);
    totalLi.appendChild(totalDiv);
    selecionadosLista.appendChild(totalLi);
  }
}

function mostrarPerguntaAdicionais(itemDiv, id, nome, valor, tipo, observacaoParaModal = "") {
    if (tipo !== "hamburguer" && tipo !== "combo") {
        adicionarItemAoCarrinho(id, nome, valor, tipo, [], observacaoParaModal);
        return;
    }
    const perguntaAnterior = itemDiv.querySelector(".pergunta-adicionais");
    if (perguntaAnterior) perguntaAnterior.remove();
    
    let perguntaTexto = tipo === "combo" ? "Personalizar combo?" : "Adicionais ou observação?";
    let btnNaoTexto = tipo === "combo" ? "Não personalizar" : "Adicionar direto";
    let btnSimTexto = tipo === "combo" ? "Sim, personalizar" : "Configurar item";

    const perguntaDiv = document.createElement("div");
    perguntaDiv.className = "pergunta-adicionais";
    perguntaDiv.innerHTML = `<p>${perguntaTexto}</p><div class="pergunta-botoes"><button type="button" class="btn-nao">${btnNaoTexto}</button><button type="button" class="btn-sim">${btnSimTexto}</button></div>`;
    const itemActions = itemDiv.querySelector(".item-actions");
    itemActions.insertAdjacentElement("afterend", perguntaDiv);

    perguntaDiv.querySelector(".btn-nao").addEventListener("click", function () {
        perguntaDiv.remove();
        adicionarItemAoCarrinho(id, nome, valor, tipo, [], observacaoParaModal); // Observação passada será a inicial (vazia para novos)
    });
    perguntaDiv.querySelector(".btn-sim").addEventListener("click", function () {
        perguntaDiv.remove();
        abrirModalAdicionais(itemDiv, id, nome, valor, tipo, observacaoParaModal);
    });

    if (window.innerWidth <= 768) {
        setTimeout(() => { perguntaDiv.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 100);
    }
}

function abrirModalAdicionais(itemDiv, id, nome, valor, tipo, observacaoParaModal = "") {
  const obsInicialModal = carrinho.itemAtual && carrinho.itemAtual.uniqueId ? carrinho.itemAtual.observacao : observacaoParaModal;

  carrinho.itemAtual = { 
      itemDiv, 
      id, 
      nome, 
      valor, 
      tipo: itemDiv ? itemDiv.dataset.tipo : tipo, // Garante que tipo seja pego do itemDiv se disponível
      observacao: obsInicialModal 
  };
  
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  if (!modalOverlay) {
    criarModalAdicionais(); 
    setTimeout(() => abrirModalAdicionais(itemDiv, id, nome, valor, tipo, obsInicialModal), 100); 
    return;
  }

  modalOverlay.querySelectorAll(".adicional-qty").forEach(span => span.textContent = "0");
  
  const observacoesInputModal = modalOverlay.querySelector("#observacoes-pedido");
  if (observacoesInputModal) observacoesInputModal.value = obsInicialModal; 
  
  const selecionadosDiv = modalOverlay.querySelector(".adicionais-selecionados");
  if (selecionadosDiv) selecionadosDiv.style.display = "none";
  
  const tituloModal = modalOverlay.querySelector("h3");
  const btnConfirmar = modalOverlay.querySelector(".btn-confirmar-adicionais");

  if (carrinho.itemAtual.uniqueId && carrinho.itens[carrinho.itemAtual.uniqueId]) { // Modo Edição
      const itemEditando = carrinho.itens[carrinho.itemAtual.uniqueId];
      if (tituloModal) tituloModal.textContent = `Editando: ${itemEditando.nome}`;
      if (btnConfirmar) btnConfirmar.textContent = "Confirmar Edição";
      if (observacoesInputModal) observacoesInputModal.value = itemEditando.observacoes || ""; // Carrega obs do item no carrinho

      if (itemEditando.adicionais && itemEditando.adicionais.length > 0) {
          const contagemAdicionais = {};
          itemEditando.adicionais.forEach(ad => {
              contagemAdicionais[ad.id] = (contagemAdicionais[ad.id] || 0) + 1;
          });
          for (const adicionalId in contagemAdicionais) {
              const spanQty = modalOverlay.querySelector(`.adicional-qty[data-id="${adicionalId}"]`);
              if (spanQty) spanQty.textContent = contagemAdicionais[adicionalId];
          }
      }
  } else { // Modo Novo Item
      if (tituloModal) tituloModal.textContent = `Configurar: ${nome}`;
      if (btnConfirmar) btnConfirmar.textContent = "Adicionar ao Pedido";
      // Observação inicial (obsInicialModal) já foi setada no input
  }

  configurarBotoesModal(); 
  modalOverlay.classList.add("show");
  modalOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  atualizarResumoAdicionais(); 
}

function fecharModalAdicionais() {
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("show");
    modalOverlay.style.display = "none";
    document.body.style.overflow = "";
    // carrinho.itemAtual = null; // Limpado em confirmarAdicionais ou se fechar sem confirmar
  }
}

function confirmarAdicionais() {
  if (!carrinho.itemAtual) {
    fecharModalAdicionais(); 
    return;
  }

  const { id, nome, valor, tipo, uniqueId } = carrinho.itemAtual; 
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  if (!modalOverlay) return;

  const adicionaisSelecionados = [];
  let adicionaisTotalValor = 0;
  modalOverlay.querySelectorAll(".adicional-qty").forEach(span => {
    const quantidade = parseInt(span.textContent);
    if (quantidade > 0) {
      const adicionalId = span.dataset.id;
      const adicionalInfo = adicionais[adicionalId];
      if (adicionalInfo) {
        for (let i = 0; i < quantidade; i++) {
          adicionaisSelecionados.push({ id: adicionalId, nome: adicionalInfo.nome, preco: adicionalInfo.preco });
          adicionaisTotalValor += adicionalInfo.preco;
        }
      }
    }
  });

  const observacoesInputModal = modalOverlay.querySelector("#observacoes-pedido");
  const observacaoFinalDoModal = observacoesInputModal ? observacoesInputModal.value.trim() : "";

  if (uniqueId && carrinho.itens[uniqueId]) { 
    carrinho.itens[uniqueId].adicionais = adicionaisSelecionados;
    carrinho.itens[uniqueId].adicionaisTotal = adicionaisTotalValor;
    carrinho.itens[uniqueId].observacoes = observacaoFinalDoModal; 
    mostrarNotificacao(`${nome} atualizado no pedido!`);
  } else { 
    adicionarItemAoCarrinho(id, nome, valor, tipo, adicionaisSelecionados, observacaoFinalDoModal);
  }

  fecharModalAdicionais();
  carrinho.itemAtual = null; 
  atualizarCarrinho();
}

function editarItemDoCarrinho(uniqueId) {
  const itemNoCarrinho = carrinho.itens[uniqueId];
  if (!itemNoCarrinho) return;

  const itemOriginalCardapio = document.querySelector(`.item[data-id="${itemNoCarrinho.id}"]`);
  const tipoItem = itemOriginalCardapio ? itemOriginalCardapio.dataset.tipo : 'hamburguer';

  carrinho.itemAtual = {
    id: itemNoCarrinho.id,
    nome: itemNoCarrinho.nome,
    valor: itemNoCarrinho.valor,
    tipo: tipoItem, 
    observacao: itemNoCarrinho.observacoes || "", 
    uniqueId: uniqueId, 
  };
  
  abrirModalAdicionais(itemOriginalCardapio, itemNoCarrinho.id, itemNoCarrinho.nome, itemNoCarrinho.valor, tipoItem, itemNoCarrinho.observacoes);
}


function adicionarItem(event) {
  const itemDiv = event.target.closest(".item");
  if (!itemDiv) return;
  const id = itemDiv.dataset.id;
  const nome = itemDiv.dataset.nome;
  const valor = parseFloat(itemDiv.dataset.valor);
  const tipo = itemDiv.dataset.tipo;
  const observacaoInicialParaModal = ""; // Para novos itens, modal de observação começa vazio

  const qtySpan = itemDiv.querySelector(".item-qty");
  qtySpan.textContent = parseInt(qtySpan.textContent) + 1;

  if (tipo === "hamburguer" || tipo === "combo") {
    mostrarPerguntaAdicionais(itemDiv, id, nome, valor, tipo, observacaoInicialParaModal); 
  } else { // Bebidas, porções, etc.
    adicionarItemAoCarrinho(id, nome, valor, tipo, [], observacaoInicialParaModal);
  }
}

function adicionarItemAoCarrinho(id, nome, valor, tipo, adicionaisList = [], observacoes = "") {
  carrinho.contador++;
  const itemUniqueKey = `item_pedido_${carrinho.contador}`;
  let adicionaisTotalValor = 0;
  adicionaisList.forEach(ad => adicionaisTotalValor += ad.preco);
  carrinho.itens[itemUniqueKey] = {
    id, nome, valor, quantidade: 1, 
    adicionais: adicionaisList,
    adicionaisTotal: adicionaisTotalValor,
    observacoes,
    uniqueId: itemUniqueKey,
  };
  atualizarCarrinho();
  mostrarNotificacao(`${nome} adicionado ao pedido!`);
}

function removerItem(event) {
  const itemDiv = event.target.closest(".item");
  if (!itemDiv) return;
  const id = itemDiv.dataset.id;
  const qtySpan = itemDiv.querySelector(".item-qty");
  let quantidade = parseInt(qtySpan.textContent);
  if (quantidade > 0) {
    qtySpan.textContent = --quantidade;
    const chavesItens = Object.keys(carrinho.itens);
    for (let i = chavesItens.length - 1; i >= 0; i--) {
        const key = chavesItens[i];
        if (carrinho.itens[key].id === id && !carrinho.itens[key].adicionais.length && !carrinho.itens[key].observacoes) { // Remove apenas se não tiver personalização
            const nomeItemRemovido = carrinho.itens[key].nome;
            delete carrinho.itens[key];
            mostrarNotificacao(`${nomeItemRemovido} removido do pedido.`);
            atualizarCarrinho();
            return; 
        }
    }
     // Se chegou aqui, ou não encontrou item simples para remover, ou todos têm personalização.
     // Neste caso, o usuário deve remover pelo 'x' no carrinho se quiser remover um item personalizado.
     if(quantidade === 0 && chavesItens.some(key => carrinho.itens[key].id === id)){
        // Apenas alerta que itens personalizados devem ser removidos do carrinho.
        // Não remove automaticamente para evitar perda de personalização.
     } else if (quantidade > 0 && chavesItens.some(key => carrinho.itens[key].id === id && (carrinho.itens[key].adicionais.length > 0 || carrinho.itens[key].observacoes))) {
        // Se ainda há quantidade no cardápio e existem versões personalizadas no carrinho.
     }

  }
}

function removerItemDoCarrinho(uniqueId) {
  if (carrinho.itens[uniqueId]) {
    const itemRemovido = carrinho.itens[uniqueId];
    const nomeItemRemovido = itemRemovido.nome;
    const itemCardapioDiv = document.querySelector(`.item[data-id="${itemRemovido.id}"]`);
    if (itemCardapioDiv) {
        const qtySpanCardapio = itemCardapioDiv.querySelector(".item-qty");
        let qtdCardapio = parseInt(qtySpanCardapio.textContent);
        if (qtdCardapio > 0) {
            qtySpanCardapio.textContent = --qtdCardapio;
        }
    }
    delete carrinho.itens[uniqueId];
    mostrarNotificacao(`${nomeItemRemovido} removido do pedido.`);
    atualizarCarrinho();
  }
}

function limparCarrinho() {
  if (Object.keys(carrinho.itens).length > 0) {
    carrinho.itens = {};
    // Não resetar nome, endereço, forma de pagamento, tipoServiço, bairro para conveniência
    // A taxa será recalculada em atualizarCarrinho.
    carrinho.total = 0;
    
    // Resetar taxa e bairro se não for para manter
    // carrinho.taxaEntrega = 0;
    // carrinho.bairroSelecionado = "";
    // if(document.getElementById("bairroSelect")) document.getElementById("bairroSelect").value = "";
    // if(document.getElementById("taxaEntregaInfo")) document.getElementById("taxaEntregaInfo").textContent = "";

    document.querySelectorAll(".item-qty").forEach(span => span.textContent = "0");
    mostrarNotificacao("Pedido limpo!");
    atualizarCarrinho(); 
  }
}

// MODIFICADO: atualizarCarrinho para incluir taxa de entrega
function atualizarCarrinho() {
  const itensCarrinhoDiv = document.getElementById("itens-carrinho");
  const valorTotalSpan = document.getElementById("valorTotal");
  const carrinhoContadorBadge = document.getElementById("carrinho-contador");
  const subtotalInfoDiv = document.getElementById("subtotal-info");
  const valorSubtotalItensSpan = document.getElementById("valorSubtotalItens");
  const entregaInfoCarrinhoDiv = document.getElementById("entrega-info-carrinho");
  const valorTaxaEntregaCarrinhoSpan = document.getElementById("valorTaxaEntregaCarrinho");


  if (!itensCarrinhoDiv || !valorTotalSpan) return;

  itensCarrinhoDiv.innerHTML = "";
  let subtotalItens = 0; // Total apenas dos itens e seus adicionais
  let temItens = false;

  for (const itemKey in carrinho.itens) {
    const item = carrinho.itens[itemKey];
    temItens = true;

    const valorItemBase = item.valor;
    const valorAdicionais = item.adicionaisTotal || 0;
    const subtotalCadaItem = valorItemBase + valorAdicionais; // Subtotal do item com seus adicionais
    subtotalItens += subtotalCadaItem * (item.quantidade || 1);

    const divItem = document.createElement("div");
    divItem.className = "cart-item";
    divItem.dataset.uniqueId = item.uniqueId;

    let itemNomeHtml = `<span class="item-nome-carrinho">${item.nome}</span>`;
    let adicionaisHtml = "";
    if (item.adicionais && item.adicionais.length > 0) {
      adicionaisHtml = '<div class="adicionais-list-carrinho">';
      const contagemAdicionais = {};
      item.adicionais.forEach(ad => { contagemAdicionais[ad.nome] = (contagemAdicionais[ad.nome] || 0) + 1; });
      adicionaisHtml += Object.entries(contagemAdicionais).map(([nome, qtd]) => {
        const adicionalOriginal = Object.values(adicionais).find(adOrig => adOrig.nome === nome);
        const precoAdicional = adicionalOriginal ? adicionalOriginal.preco : 0;
        return `<small><span class="adicional-badge-carrinho">${qtd}x</span> ${nome} (+R$ ${(precoAdicional * qtd).toFixed(2)})</small>`;
      }).join('');
      adicionaisHtml += "</div>";
    }
    let observacoesHtml = "";
    if (item.observacoes) {
      observacoesHtml = `<div class="observacoes-list-carrinho"><small>${item.observacoes}</small></div>`;
    }

    divItem.innerHTML = `
      <div class="cart-item-info">
        ${itemNomeHtml}
        ${adicionaisHtml}
        ${observacoesHtml}
      </div>
      <div class="cart-item-actions">
        <button type="button" class="btn-editar-item" data-item-id="${item.uniqueId}" title="Editar item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <div class="cart-item-price">R$ ${subtotalCadaItem.toFixed(2)}</div>
        <button type="button" class="btn-remove-item" data-item-id="${item.uniqueId}">×</button>
      </div>`;
    itensCarrinhoDiv.appendChild(divItem);

    divItem.querySelector(`.btn-remove-item`).addEventListener("click", function () { removerItemDoCarrinho(item.uniqueId); });
    divItem.querySelector(`.btn-editar-item`).addEventListener("click", function () { editarItemDoCarrinho(item.uniqueId); });
  }
  
  let totalFinalPedido = subtotalItens;

  if (carrinho.tipoServico === "entrega" && carrinho.taxaEntrega >= 0 && carrinho.bairroSelecionado) { // >=0 para "A Consultar"
    if(valorSubtotalItensSpan) valorSubtotalItensSpan.textContent = `R$ ${subtotalItens.toFixed(2)}`;
    if(subtotalInfoDiv) subtotalInfoDiv.style.display = temItens ? "flex" : "none";

    if(valorTaxaEntregaCarrinhoSpan) {
        valorTaxaEntregaCarrinhoSpan.textContent = carrinho.bairroSelecionado === "Outro Bairro (Consultar)" ? "A Consultar" : `R$ ${carrinho.taxaEntrega.toFixed(2)}`;
    }
    if(entregaInfoCarrinhoDiv) entregaInfoCarrinhoDiv.style.display = temItens ? "flex" : "none";
    
    if (carrinho.taxaEntrega > 0) { // Soma apenas se a taxa for positiva
        totalFinalPedido += carrinho.taxaEntrega;
    }
  } else {
    if(subtotalInfoDiv) subtotalInfoDiv.style.display = "none";
    if(entregaInfoCarrinhoDiv) entregaInfoCarrinhoDiv.style.display = "none";
  }


  if (carrinhoContadorBadge) {
    const numItensUnicos = Object.keys(carrinho.itens).length;
    carrinhoContadorBadge.textContent = numItensUnicos; 
    carrinhoContadorBadge.style.display = numItensUnicos > 0 ? "flex" : "none";
    if(numItensUnicos > 0 && !carrinhoContadorBadge.classList.contains("animate")){ // Evita re-animar desnecessariamente
        carrinhoContadorBadge.classList.remove("animate"); // Garante que a animação possa ser re-triggerada
        void carrinhoContadorBadge.offsetWidth; // Força reflow
        carrinhoContadorBadge.classList.add("animate");
    } else if (numItensUnicos === 0) {
        carrinhoContadorBadge.classList.remove("animate");
    }
  }

  if (!temItens) {
    itensCarrinhoDiv.innerHTML = '<p class="empty-cart">Nenhum item no pedido</p>';
  }
  carrinho.total = totalFinalPedido;
  valorTotalSpan.textContent = `R$ ${totalFinalPedido.toFixed(2)}`;

  // Salvar informações de entrega/retirada no localStorage
  localStorage.setItem("impressao_tipoServico", carrinho.tipoServico);
  if (carrinho.tipoServico === "entrega") {
    localStorage.setItem("impressao_bairroSelecionado", carrinho.bairroSelecionado);
  } else {
    localStorage.removeItem("impressao_bairroSelecionado");
  }
}


function mostrarNotificacao(mensagem) {
  const notificacaoAnterior = document.querySelector(".notificacao");
  if (notificacaoAnterior) notificacaoAnterior.remove();
  const notificacaoDiv = document.createElement("div");
  notificacaoDiv.className = "notificacao";
  notificacaoDiv.textContent = mensagem;
  document.body.appendChild(notificacaoDiv);
  setTimeout(() => { notificacaoDiv.classList.add("mostrar"); }, 10);
  setTimeout(() => {
    notificacaoDiv.classList.remove("mostrar");
    setTimeout(() => { notificacaoDiv.remove(); }, 500);
  }, 3000);
}

function configurarAlternadorTema() {
  const botaoTema = document.getElementById("theme-toggle-btn");
  if (!botaoTema) return;
  const body = document.body;
  const temaAtual = localStorage.getItem("tema");
  if (temaAtual === "dark") { body.classList.add("dark-mode"); botaoTema.textContent = "☀️ Modo Claro"; }
  else if (temaAtual === "light") { body.classList.remove("dark-mode"); botaoTema.textContent = "🌙 Modo Escuro"; }
  else {
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefereEscuro) { body.classList.add("dark-mode"); botaoTema.textContent = "☀️ Modo Claro"; localStorage.setItem("tema", "dark"); }
    else localStorage.setItem("tema", "light");
  }
  botaoTema.addEventListener("click", function () {
    if (body.classList.contains("dark-mode")) { body.classList.remove("dark-mode"); botaoTema.textContent = "🌙 Modo Escuro"; localStorage.setItem("tema", "light"); }
    else { body.classList.add("dark-mode"); botaoTema.textContent = "☀️ Modo Claro"; localStorage.setItem("tema", "dark"); }
  });
}

function configurarBotoesModal() {
  const modalOverlay = document.querySelector(".adicionais-modal-overlay");
  if (!modalOverlay) return;
  const btnFechar = modalOverlay.querySelector(".btn-close-adicionais");
  if (btnFechar) {
    const novoBtnFechar = btnFechar.cloneNode(true); 
    btnFechar.parentNode.replaceChild(novoBtnFechar, btnFechar);
    novoBtnFechar.addEventListener("click", fecharModalAdicionais);
  }
  const btnConfirmar = modalOverlay.querySelector(".btn-confirmar-adicionais");
  if (btnConfirmar) {
     const novoBtnConfirmar = btnConfirmar.cloneNode(true); 
     btnConfirmar.parentNode.replaceChild(novoBtnConfirmar, btnConfirmar);
     novoBtnConfirmar.addEventListener("click", confirmarAdicionais);
  }
}

function configurarBotoesFlutuantes() {
  const btnIrCarrinho = document.getElementById("btn-ir-carrinho");
  const btnVoltarTopo = document.getElementById("btn-voltar-topo");
  const resumoPedidoDiv = document.getElementById("resumoPedido"); 

  if (btnIrCarrinho && resumoPedidoDiv) {
    btnIrCarrinho.addEventListener("click", function () {
      const carrinhoPos = resumoPedidoDiv.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: carrinhoPos - 20, behavior: "smooth" });
      const nomeClienteInput = document.getElementById("nomeCliente");
      if (nomeClienteInput) setTimeout(() => nomeClienteInput.focus(), 500);
    });
  }
  if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () {
      btnVoltarTopo.classList.toggle("visivel", window.pageYOffset > 300);
    });
    btnVoltarTopo.classList.toggle("visivel", window.pageYOffset > 300);
  }
}

// MODIFICADO: Função de impressão para incluir dados de entrega
function imprimirPedido() {
  if (Object.keys(carrinho.itens).length === 0) {
    mostrarNotificacao("Adicione itens ao pedido antes de imprimir.");
    return;
  }
  if (!carrinho.nomeCliente) {
    mostrarNotificacao("Por favor, informe o nome do cliente.");
    const nomeClienteInput = document.getElementById("nomeCliente");
    if (nomeClienteInput) nomeClienteInput.focus();
    return;
  }

  // Validação para entrega
  if (carrinho.tipoServico === "entrega") {
    if (!carrinho.enderecoCliente) {
      mostrarNotificacao("Por favor, informe o endereço para entrega.");
      const enderecoClienteTextarea = document.getElementById("enderecoCliente");
      if (enderecoClienteTextarea) enderecoClienteTextarea.focus();
      return;
    }
    if (!carrinho.bairroSelecionado || carrinho.bairroSelecionado === "") {
      mostrarNotificacao("Por favor, selecione o bairro para entrega.");
      const bairroSelect = document.getElementById("bairroSelect");
      if (bairroSelect) bairroSelect.focus();
      return;
    }
  }
  
  const dataHora = new Date();
  const dataFormatada = dataHora.toLocaleDateString('pt-BR');
  const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let htmlImpressao = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Pedido Space Burguer</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body { font-family: 'Courier New', Courier, monospace; font-size: 9pt; line-height: 1.2; width: 74mm; margin: 0 auto; background: #fff !important; color: #000 !important; }
        .header-impressao { text-align: center; margin-bottom: 10px; }
        .header-impressao h1 { margin: 0; font-size: 12pt; text-transform: uppercase; }
        .header-impressao p { margin: 2px 0; font-size: 8pt; }
        .info-pedido { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin-bottom: 10px; }
        .info-pedido div { margin-bottom: 2px; word-wrap: break-word; }
        .info-pedido strong { font-weight: bold; } /* Adicionado para destacar labels */
        table.itens { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.itens th, table.itens td { padding: 3px 1px; text-align: left; vertical-align: top; font-size: 8.5pt; }
        table.itens th { border-bottom: 1px solid #000; font-weight: bold; }
        .col-qtd { width: 12%; text-align: center; }
        .col-item { width: 60%; }
        .col-sub { width: 28%; text-align: right; }
        .item-nome-print { font-weight: bold; display: block; }
        .detalhes-item-print { font-size: 7.5pt; padding-left: 5px; color: #333; display: block; word-break: break-word; }
        .detalhes-item-print.obs::before { content: "Obs: "; font-style: italic; }
        .detalhes-item-print.ad::before { content: "+Ad: "; font-style: italic; }
        .resumo-financeiro { margin-top: 5px; padding-top: 5px; border-top: 1px dashed #555; }
        .resumo-financeiro div { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 2px; }
        .total-geral { text-align: right; font-size: 11pt; font-weight: bold; margin-top: 5px; padding-top: 5px; border-top: 1px solid #000;}
        .footer-impressao { text-align: center; font-size: 8pt; margin-top: 15px; border-top: 1px dashed #000; padding-top:5px; }
      </style>
    </head>
    <body>
      <div class="header-impressao">
        <h1>SPACE BURGUER</h1>
        <p>Data: ${dataFormatada} - Hora: ${horaFormatada}</p>
      </div>
      <div class="info-pedido">
        <div><strong>Cliente:</strong> ${carrinho.nomeCliente}</div>`;

  if (carrinho.tipoServico === "entrega") {
    htmlImpressao += `<div><strong>Serviço:</strong> Entrega</div>`;
    htmlImpressao += `<div><strong>Endereço:</strong> ${carrinho.enderecoCliente}</div>`;
    htmlImpressao += `<div><strong>Bairro:</strong> ${carrinho.bairroSelecionado}</div>`;
  } else {
    htmlImpressao += `<div><strong>Serviço:</strong> Retirada na Loja</div>`;
  }
  if (carrinho.formaPagamento) {
    htmlImpressao += `<div><strong>Pagamento:</strong> ${carrinho.formaPagamento}</div>`;
  }
  htmlImpressao += `</div> <table class="itens">
        <thead><tr><th class="col-qtd">Qtd</th><th class="col-item">Item/Detalhes</th><th class="col-sub">Subtotal</th></tr></thead>
        <tbody>`;

  let subtotalItensImpressao = 0;
  Object.values(carrinho.itens).forEach(item => {
    const valorItemComAdicionais = (item.valor + (item.adicionaisTotal || 0));
    subtotalItensImpressao += valorItemComAdicionais * (item.quantidade || 1);
    htmlImpressao += `
          <tr>
            <td class="col-qtd">${item.quantidade || 1}</td>
            <td class="col-item">
              <span class="item-nome-print">${item.nome}</span>`;
    if (item.adicionais && item.adicionais.length > 0) {
      const contagemAd = {};
      item.adicionais.forEach(ad => { contagemAd[ad.nome] = (contagemAd[ad.nome] || 0) + 1; });
      htmlImpressao += `<span class="detalhes-item-print ad">`;
      htmlImpressao += Object.entries(contagemAd).map(([nome, qtd]) => `${qtd}x ${nome}`).join(', ');
      htmlImpressao += `</span>`;
    }
    if (item.observacoes) {
      htmlImpressao += `<span class="detalhes-item-print obs">${item.observacoes}</span>`;
    }
    htmlImpressao += `</td>
            <td class="col-sub">R$ ${valorItemComAdicionais.toFixed(2).replace(".", ",")}</td>
          </tr>`;
  });

  htmlImpressao += `</tbody></table>`;
  
  // Seção de resumo financeiro
  htmlImpressao += `<div class="resumo-financeiro">`;
  htmlImpressao += `<div><span>Subtotal Itens:</span><span>R$ ${subtotalItensImpressao.toFixed(2).replace(".", ",")}</span></div>`;

  if (carrinho.tipoServico === "entrega" && carrinho.bairroSelecionado) {
    const taxaDisplay = carrinho.bairroSelecionado === "Outro Bairro (Consultar)" ? "A Consultar" : `R$ ${carrinho.taxaEntrega.toFixed(2).replace(".", ",")}`;
    htmlImpressao += `<div><span>Taxa de Entrega:</span><span>${taxaDisplay}</span></div>`;
  }
  htmlImpressao += `</div>`; // Fim resumo-financeiro

  htmlImpressao += `<div class="total-geral">TOTAL: R$ ${carrinho.total.toFixed(2).replace(".", ",")}</div>
      <div class="footer-impressao">Obrigado pela preferência!</div>
    </body></html>`;

  const printWindow = window.open('', '_blank', 'width=302,height=500'); 
  printWindow.document.write(htmlImpressao);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250); 
}
// FIM MODIFICADO