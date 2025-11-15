let attempts = 0;
let matchedPairs = 0; // Contador de pares encontrados

function flipCard() {
  // Se o tabuleiro estiver bloqueado ou a carta clicada for a mesma, ignora o clique
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip'); // Adiciona a classe 'flip' à carta clicada

  if (!hasFlippedCard) {
    // Primeiro clique
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  // Segundo clique
  secondCard = this;
  hasFlippedCard = false; // Reseta para o próximo turno

  checkForMatch();
}

function checkForMatch() {
  // Incrementa o contador de tentativas
  attempts++;
  attemptsSpan.textContent = attempts;

  // Verifica se os data-attributes das duas cartas são iguais
  let isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;

  // Se for um par, desabilita as cartas. Se não, vira-as de volta.
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  // Remove o ouvinte de evento para que as cartas não possam mais ser clicadas
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.dataset.matched = 'true';
  secondCard.dataset.matched = 'true'
  // Incrementa o contador de pares
  matchedPairs++;
  // Verifica se o jogo terminou (todos os pares encontrados)
  if (matchedPairs === nCards) {
    // Atraso para o jogador ver a última carta virar
    setTimeout(endGame, 1000);
  }

  resetBoard();
}

function unflipCards() {
  lockBoard = true; // Bloqueia o tabuleiro

  // Após 1.5 segundos, remove a classe 'flip' para virar as cartas de volta
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1500);
}

function resetBoard() {
    // Reseta as variáveis de estado TEMPORÁRIO do jogo (para o próximo clique)
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
    
    // NENHUM SALVAMENTO DEVE OCORRER AQUI
}
 var STORAGE_KEY = 'memorySaveGame'
// Assumindo que 'cards' é um array de elementos DOM acessível aqui.
// Assumindo que 'attempts' e 'matchedPairs' são variáveis globais acessíveis.

const STORAGE_KEY = 'memorySaveGame'
// Assumindo que 'cards', 'attempts', e 'matchedPairs' estão definidos globalmente.

function saveGameState() {
    // A. Mapeia o estado das cartas
    const cardStates = Array.from(cards).map(card => {
        return { 
            order: card.style.order,
            // dataset.matched é uma string, verifica se é 'true'
            isMatched: card.dataset.matched === 'true'
        };
    });
    
    // B. CRIA O OBJETO DE ESTADO COMPLETO (Corrigido: Objeto único, sem erros de sintaxe)
    const gameState = {
        attempts: attempts,
        matchedPairs: matchedPairs,
        cardStates: cardStates
    };

    // C. Salva no localStorage, usando a string STORAGE_KEY global
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    
    console.log('Jogo salvo com sucesso!');
}
 function loadGameState() {
    // 1. Tenta recuperar a string salva
    const savedGame = localStorage.getItem(STORAGE_KEY);
    
    if (savedGame) {
        // 2. Converte a string JSON de volta para um objeto
        const gameState = JSON.parse(savedGame);

        // 3. Aplica o estado carregado às variáveis globais
        attempts = gameState.attempts;
        matchedPairs = gameState.matchedPairs;
        
        // 4. Aplica o estado de volta ao DOM/cartas
        gameState.cardStates.forEach((state, index) => {
            const card = cards[index];
            
            // Reestabelece a ordem (posicionamento)
            card.style.order = state.order;

            // Reestabelece o estado de "match"
            if (state.isMatched) {
                card.classList.add('match'); // Adiciona a classe visual de pareada
                card.dataset.matched = 'true';
                card.removeEventListener('click', flipCard); // Impede cliques em cartas pareadas
            } else {
                card.classList.remove('match');
                card.dataset.matched = 'false';
            }
        });

        console.log('Jogo carregado com sucesso!');
        return true; // Indica que um jogo foi carregado
    }
    
    return false; // Indica que nenhum jogo foi encontrado
}

// Chame esta função no início da sua aplicação
// window.onload = loadGameState;

(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * cards.length);
    card.style.order = randomPos;
    loadGameState(); 
   cards.forEach(card => {
    card.addEventListener('click', flipCard);
});
  });
})();

// Adiciona o evento de clique a cada uma das cartas
function flipCard() {
    // 'this' refere-se ao elemento DOM que foi clicado (a carta)
    
    // 2. VERIFICAÇÃO PRINCIPAL: Se a carta já está pareada, ignore o clique imediatamente.
    if (this.dataset.matched === 'true') {
        return; 
    }
    
    
}
// ===================================================================
// NOVO: FUNÇÕES DE FIM DE JOGO E SALVAMENTO
// ===================================================================

function endGame() {
  localStorage.removeItem(STORAGE_KEY);
  lockBoard = true;

  const playerName = prompt(`Parabéns! Você completou o jogo em ${attempts} tentativas.\n\nDigite seu nome para salvar:`);

  if (playerName && playerName.trim() !== "") {
    // Chama o método de salvamento
    saveScoreByAjax(playerName);
    // Para testar o método 2 (formulário), descomente a linha abaixo:
    // saveScoreByForm(playerName);
  } else {
    // Se o usuário cancelar
    alert("Pontuação não salva. Reiniciando o jogo.");
    // MODIFICADO: Redireciona para a página de jogar
    window.location.href = 'index.php?page=jogar';
  }
}

/**
 * MÉTODO 1: Salvar pontuação usando AJAX (Fetch API)
 */
function saveScoreByAjax(playerName) {
  const formData = new FormData();
  formData.append('nome', playerName);
  formData.append('tentativas', attempts);

  console.log("Enviando (AJAX):", playerName, attempts);

  fetch('salvar_pontuacao.php', {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Resposta do servidor (AJAX):', data.message);

      // MODIFICADO: Redireciona para a página de placar após salvar
      alert("Pontuação salva! Redirecionando para o placar.");
      window.location.href = 'index.php?page=placar';
    })
    .catch(error => {
      console.error('Falha ao salvar pontuação via AJAX:', error);
      alert('Houve um erro ao salvar sua pontuação. Verifique o console.');
      // MODIFICADO: Redireciona de volta para o jogo em caso de erro
      window.location.href = 'index.php?page=jogar';
    });
}


/**
 * MÉTODO 2: Salvar pontuação usando envio de Formulário Oculto (Comentado)
 */
/*
function saveScoreByForm(playerName) {
  console.log("Enviando (Formulário Oculto):", playerName, attempts);

  // Preenche os campos ocultos
  document.getElementById('hiddenName').value = playerName;
  document.getElementById('hiddenAttempts').value = attempts;
  
  // Submete o formulário.
  // O 'salvar_pontuacao.php' foi atualizado para redirecionar
  // para 'index.php?page=placar' após a submissão.
  document.getElementById('scoreForm').submit();
}
*/