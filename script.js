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
};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  // Preencher selects de adicionais para hambúrgueres
  const selects = document.querySelectorAll(".adicional-selector select");
  selects.forEach((select) => {
    for (const [key, adicional] of Object.entries(adicionais)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${adicional.nome} - R$ ${adicional.preco.toFixed(
        2
      )}`;
      select.appendChild(option);
    }
  });

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
});

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

  // Mostrar seletor de adicional se for hambúrguer e primeira adição
  if (tipo === "hamburguer" && quantidade === 1) {
    const adicionalSelector = itemDiv.querySelector(".adicional-selector");
    if (adicionalSelector) {
      adicionalSelector.style.display = "block";
    }
  }

  // Verificar se há adicional selecionado (apenas para hambúrgueres)
  let adicionalId = "";
  let adicionalNome = "";
  let adicionalPreco = 0;

  if (tipo === "hamburguer") {
    const adicionalSelect = itemDiv.querySelector(".adicional-selector select");
    if (adicionalSelect && adicionalSelect.value) {
      adicionalId = adicionalSelect.value;
      adicionalNome = adicionais[adicionalId].nome;
      adicionalPreco = adicionais[adicionalId].preco;
    }
  }

  // Gerar um ID único para este item específico
  carrinho.contador++;
  const itemUniqueKey = `item_${carrinho.contador}`;

  // Adicionar novo item ao carrinho (cada adição é um item separado)
  carrinho.itens[itemUniqueKey] = {
    id,
    nome,
    valor,
    quantidade: 1,
    adicionalId,
    adicionalNome,
    adicionalPreco,
    uniqueId: itemUniqueKey
  };

  // Atualizar carrinho e total
  atualizarCarrinho();
}

// Função para remover um item do carrinho
function removerItem(event) {
  const itemDiv = event.target.closest(".item");
  const id = itemDiv.dataset.id;
  const tipo = itemDiv.dataset.tipo;

  // Atualizar quantidade na interface
  const qtySpan = itemDiv.querySelector(".item-qty");
  let quantidade = parseInt(qtySpan.textContent);

  if (quantidade > 0) {
    quantidade -= 1;
    qtySpan.textContent = quantidade;

    // Esconder seletor de adicional se quantidade chegar a zero
    if (tipo === "hamburguer" && quantidade === 0) {
      const adicionalSelector = itemDiv.querySelector(".adicional-selector");
      if (adicionalSelector) {
        adicionalSelector.style.display = "none";
        const select = adicionalSelector.querySelector("select");
        if (select) {
          select.selectedIndex = 0;
        }
      }
    }

    // Verificar se há adicional selecionado (para hambúrgueres)
    let adicionalId = "";

    if (tipo === "hamburguer") {
      const adicionalSelect = itemDiv.querySelector(
        ".adicional-selector select"
      );
      if (adicionalSelect && adicionalSelect.value) {
        adicionalId = adicionalSelect.value;
      }
    }

    // Encontrar e remover o último item adicionado que corresponda ao id e adicional
    const itemsToRemove = [];
    for (const key in carrinho.itens) {
      const item = carrinho.itens[key];
      if (item.id === id && item.adicionalId === adicionalId) {
        itemsToRemove.push(key);
      }
    }

    if (itemsToRemove.length > 0) {
      // Remover o último item adicionado
      delete carrinho.itens[itemsToRemove[itemsToRemove.length - 1]];
    }

    // Atualizar carrinho e total
    atualizarCarrinho();
  }
}

// Função para limpar todo o carrinho
function limparCarrinho() {
  // Limpar todos os itens do carrinho
  carrinho.itens = {};
  carrinho.total = 0;
  
  // Resetar todas as quantidades na interface
  const qtySpans = document.querySelectorAll(".item-qty");
  qtySpans.forEach(span => {
    span.textContent = "0";
  });
  
  // Esconder todos os seletores de adicionais
  const adicionaisSelectors = document.querySelectorAll(".adicional-selector");
  adicionaisSelectors.forEach(selector => {
    selector.style.display = "none";
    const select = selector.querySelector("select");
    if (select) {
      select.selectedIndex = 0;
    }
  });
  
  // Atualizar a interface do carrinho
  atualizarCarrinho();
}

// Função para remover um item específico do carrinho (pelo botão X no carrinho)
function removerItemDoCarrinho(uniqueId) {
  if (carrinho.itens[uniqueId]) {
    const item = carrinho.itens[uniqueId];
    const id = item.id;
    
    // Decrementar a quantidade exibida na interface
    const itemDivs = document.querySelectorAll(`.item[data-id="${id}"]`);
    itemDivs.forEach(itemDiv => {
      const qtySpan = itemDiv.querySelector(".item-qty");
      let quantidade = parseInt(qtySpan.textContent);
      if (quantidade > 0) {
        quantidade -= 1;
        qtySpan.textContent = quantidade;
        
        // Esconder seletor de adicional se quantidade chegar a zero
        if (quantidade === 0) {
          const adicionalSelector = itemDiv.querySelector(".adicional-selector");
          if (adicionalSelector) {
            adicionalSelector.style.display = "none";
            const select = adicionalSelector.querySelector("select");
            if (select) {
              select.selectedIndex = 0;
            }
          }
        }
      }
    });
    
    // Remover item do carrinho
    delete carrinho.itens[uniqueId];
    
    // Atualizar carrinho
    atualizarCarrinho();
  }
}

// Função para atualizar o carrinho e o total
function atualizarCarrinho() {
  const itensCarrinho = document.getElementById("itens-carrinho");
  const valorTotal = document.getElementById("valorTotal");

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
    const valorAdicional = item.adicionalPreco || 0;
    const subtotal = (valorItem + valorAdicional) * item.quantidade;

    // Adicionar ao total
    total += subtotal;

    // Criar elemento de item no carrinho
    const divItem = document.createElement("div");
    divItem.className = "cart-item";
    divItem.dataset.uniqueId = item.uniqueId;

    // Texto do item (com ou sem adicional)
    let itemNome = `${item.nome}`;
    if (item.adicionalNome) {
      itemNome += `<br><small>+ ${item.adicionalNome}</small>`;
    }

    divItem.innerHTML = `
      <div class="cart-item-name">${itemNome}</div>
      <div class="cart-item-actions">
        <div class="cart-item-price">R$ ${subtotal.toFixed(2)}</div>
        <button type="button" class="btn-remove-item" onclick="removerItemDoCarrinho('${item.uniqueId}')">×</button>
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

// Atualizar seleção de adicional
document.addEventListener("change", function (event) {
  if (
    event.target.tagName === "SELECT" &&
    event.target.closest(".adicional-selector")
  ) {
    const itemDiv = event.target.closest(".item");
    const id = itemDiv.dataset.id;
    const nome = itemDiv.dataset.nome;
    const valor = parseFloat(itemDiv.dataset.valor);
    const quantidade = parseInt(itemDiv.querySelector(".item-qty").textContent);

    if (quantidade > 0) {
      // Gerar um novo ID único para este item
      carrinho.contador++;
      const itemUniqueKey = `item_${carrinho.contador}`;
      
      // Adicionar o novo item com o adicional selecionado
      const adicionalId = event.target.value;
      
      if (adicionalId) {
        carrinho.itens[itemUniqueKey] = {
          id,
          nome,
          valor,
          quantidade: 1,
          adicionalId,
          adicionalNome: adicionais[adicionalId].nome,
          adicionalPreco: adicionais[adicionalId].preco,
          uniqueId: itemUniqueKey
        };
      } else {
        carrinho.itens[itemUniqueKey] = {
          id,
          nome,
          valor,
          quantidade: 1,
          adicionalId: "",
          adicionalNome: "",
          adicionalPreco: 0,
          uniqueId: itemUniqueKey
        };
      }

      atualizarCarrinho();
    }
  }
});

function imprimirPedido() {
  const printWindow = window.open("", "", "height=600,width=800");

  // Criar conteúdo HTML para impressão
  let conteudo = `
    <html>
    <head>
      <title>Imprimir Pedido</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; }
        h1 { color: #FF5722; text-align: center; margin-bottom: 20px; }
        h2 { color: #FF5722; margin-top: 30px; border-bottom: 1px solid #FF5722; padding-bottom: 5px; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .item-nome { font-weight: bold; }
        .adicional { font-size: 0.9em; color: #666; margin-left: 20px; }
        .total { margin-top: 30px; font-weight: bold; text-align: right; font-size: 1.2em; }
        .data { margin-top: 40px; font-size: 0.8em; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Pedido Hamburgueria</h1>
      <div class="pedido">
        <h2>Itens do Pedido</h2>
  `;

  // Adicionar itens ao conteúdo
  for (const itemKey in carrinho.itens) {
    const item = carrinho.itens[itemKey];
    const valorItem = item.valor;
    const valorAdicional = item.adicionalPreco || 0;
    const subtotal = (valorItem + valorAdicional) * item.quantidade;

    conteudo += `<div class="item">`;
    conteudo += `<div class="item-nome">${item.nome}`;

    if (item.adicionalNome) {
      conteudo += `<div class="adicional">+ ${item.adicionalNome}</div>`;
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
