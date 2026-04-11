// ══════════════════════════════════════════════
//  O.G.T. — Client Script v2.0
//  Mobile-first: reconexión, timer, sonidos, vibración
// ══════════════════════════════════════════════

const socket = io();

// ── Age Gate ──────────────────────────────────
function enterSite() {
  try { localStorage.setItem('ogt_age_ok', '1'); } catch(e) {}
  showScreen('screen-menu');
}

function exitSite() {
  window.location.href = 'https://www.google.com';
}

// ── Estado ────────────────────────────────────
let state = {
  roomCode:    null,
  playerId:    null,
  playerName:  null,
  targetScore: 5,
  maxPlayers:  6,
  gameState:   null,
};

let selectedCards = [];

// ── Sonidos con Web Audio API ─────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new AudioCtx(); } catch(e) {}
  }
  return audioCtx;
}

function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'select') {
      o.frequency.setValueAtTime(600, now);
      o.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o.start(now); o.stop(now + 0.12);

    } else if (type === 'deselect') {
      o.frequency.setValueAtTime(500, now);
      o.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      o.start(now); o.stop(now + 0.1);

    } else if (type === 'submit') {
      o.type = 'square';
      o.frequency.setValueAtTime(440, now);
      o.frequency.setValueAtTime(660, now + 0.08);
      o.frequency.setValueAtTime(880, now + 0.16);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.start(now); o.stop(now + 0.28);

    } else if (type === 'winner') {
      // Fanfarria corta
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = f;
        const t = now + i * 0.1;
        g2.gain.setValueAtTime(0.18, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o2.start(t); o2.stop(t + 0.18);
      });
      return;

    } else if (type === 'myturn') {
      o.type = 'sine';
      o.frequency.setValueAtTime(880, now);
      o.frequency.setValueAtTime(1100, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      o.start(now); o.stop(now + 0.22);

    } else if (type === 'timeout') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, now);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.start(now); o.stop(now + 0.3);
    }
  } catch(e) {}
}

// ── Vibración ─────────────────────────────────
function vibrate(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
}

// ── Timer visual ──────────────────────────────
let timerInterval = null;
let timerSeconds = 0;
let timerTotal = 60;

function startTimerBar(seconds) {
  clearInterval(timerInterval);
  timerSeconds = seconds;
  timerTotal = seconds;
  updateTimerBar();
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerBar();
    if (timerSeconds <= 0) clearInterval(timerInterval);
  }, 1000);
}

function updateTimerBar() {
  const bar = document.getElementById('timer-bar');
  if (!bar) return;
  const pct = Math.max(0, (timerSeconds / timerTotal) * 100);
  bar.style.width = pct + '%';
  if (timerSeconds <= 15) {
    bar.classList.add('warning');
    if (timerSeconds === 10) vibrate([80]);
  } else {
    bar.classList.remove('warning');
  }
}

function stopTimerBar() {
  clearInterval(timerInterval);
  const bar = document.getElementById('timer-bar');
  if (bar) { bar.style.width = '100%'; bar.classList.remove('warning'); }
}

// ── Reconexión persistente ────────────────────
function saveSession() {
  if (state.roomCode && state.playerName) {
    try {
      localStorage.setItem('ogt_room', state.roomCode);
      localStorage.setItem('ogt_name', state.playerName);
    } catch(e) {}
  }
}

function clearSession() {
  try {
    localStorage.removeItem('ogt_room');
    localStorage.removeItem('ogt_name');
  } catch(e) {}
}

function loadSession() {
  try {
    return {
      roomCode:   localStorage.getItem('ogt_room'),
      playerName: localStorage.getItem('ogt_name'),
    };
  } catch(e) {
    return { roomCode: null, playerName: null };
  }
}

// ── Gestión de pantallas ──────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    el.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}

// ── Opciones ──────────────────────────────────
function selectOption(btn, group) {
  document.querySelectorAll(`[onclick*="${group}"]`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (group === 'target-score') state.targetScore = parseInt(btn.dataset.value);
  if (group === 'max-players')  state.maxPlayers  = parseInt(btn.dataset.value);
}

// ── Toast ─────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── Crear / Unirse ────────────────────────────
function createRoom() {
  const name = document.getElementById('host-name').value.trim();
  if (!name) return showToast('Ingresá tu nombre', 'error');
  state.playerName = name;
  socket.emit('create_room', {
    playerName:  name,
    targetScore: state.targetScore,
    maxPlayers:  state.maxPlayers,
  });
}

function joinRoom() {
  const name = document.getElementById('join-name').value.trim();
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!name) return showToast('Ingresá tu nombre', 'error');
  if (!code || code.length < 4) return showToast('Ingresá el código de sala', 'error');
  state.playerName = name;
  state.roomCode = code;
  socket.emit('join_room', { roomCode: code, playerName: name });
}

function startGame() {
  socket.emit('start_game', { roomCode: state.roomCode });
}

function nextRound() {
  socket.emit('next_round', { roomCode: state.roomCode });
}

function restartGame() {
  socket.emit('restart_game', { roomCode: state.roomCode });
}

function goToMenu() {
  clearSession();
  window.location.reload();
}

function copyLink() {
  const link = document.getElementById('share-link').textContent;
  navigator.clipboard.writeText(link)
    .then(() => { vibrate(30); showToast('¡Link copiado!', 'success'); })
    .catch(() => showToast('Copiá el link manualmente', ''));
}

// ── URL Handling ───────────────────────────────
function checkURLForRoom() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('sala') || params.get('room');
  if (code) {
    document.getElementById('join-code').value = code.toUpperCase();
    showScreen('screen-join');
  }
}

// ── Render Lobby ───────────────────────────────
function renderLobby(gs) {
  document.getElementById('lobby-code').textContent = gs.code;

  const baseUrl = window.location.origin + window.location.pathname;
  const link = `${baseUrl}?sala=${gs.code}`;
  document.getElementById('share-link').textContent = link;

  const list = document.getElementById('lobby-players');
  list.innerHTML = '';
  gs.players.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="player-avatar">${p.name[0].toUpperCase()}</div>
      <span>${p.name}</span>
      ${p.isHost ? '<span class="host-badge">HOST</span>' : ''}
    `;
    list.appendChild(li);
  });

  const btnStart = document.getElementById('btn-start');
  const minMsg   = document.getElementById('lobby-min-msg');
  const waitMsg  = document.getElementById('lobby-waiting');

  if (gs.isHost) {
    waitMsg.classList.add('hidden');
    if (gs.players.length >= 2) {
      btnStart.classList.remove('hidden');
      minMsg.classList.add('hidden');
    } else {
      btnStart.classList.add('hidden');
      minMsg.classList.remove('hidden');
    }
  } else {
    btnStart.classList.add('hidden');
    minMsg.classList.add('hidden');
    waitMsg.classList.remove('hidden');
  }
}

// ── Render Game ────────────────────────────────
let lastPhase = null;

function renderGame(gs) {
  document.getElementById('round-num').textContent = gs.roundNumber;

  // Mini scoreboard
  const mini = document.getElementById('scoreboard-mini');
  mini.innerHTML = '';
  gs.players.forEach(p => {
    const chip = document.createElement('div');
    chip.className = `score-chip${p.isJudge ? ' is-judge' : ''}${p.id === gs.playerId ? ' is-me' : ''}`;
    chip.innerHTML = `
      <span>${p.isJudge ? '👑' : ''}${p.name.split(' ')[0]}</span>
      <span class="chip-score">${p.score}</span>
    `;
    mini.appendChild(chip);
  });

  // Status badge
  const nonJudge = gs.players.filter(p => !p.isJudge).length;
  document.getElementById('status-badge').textContent = `${gs.submissionsCount}/${nonJudge} enviaron`;

  // Carta negra
  const blackText = document.getElementById('black-card-text');
  if (gs.currentBlackCard) {
    let html = gs.currentBlackCard.text;
    html = html.replace(/__________/g, '<span class="blank">__________</span>');
    blackText.innerHTML = html;
    document.getElementById('blanks-required').textContent =
      `Requiere ${gs.currentBlackCard.blanks} carta${gs.currentBlackCard.blanks > 1 ? 's' : ''}`;
  }

  // Estado jugadores
  const statusDiv = document.getElementById('players-status');
  statusDiv.innerHTML = '';
  gs.players.forEach(p => {
    const chip = document.createElement('div');
    if (p.isJudge) {
      chip.className = 'player-status-chip judge';
      chip.innerHTML = `👑 ${p.name}`;
    } else {
      chip.className = `player-status-chip${p.hasSubmitted ? ' submitted' : ''}`;
      chip.innerHTML = `${p.hasSubmitted ? '✅' : '⏳'} ${p.name}`;
    }
    statusDiv.appendChild(chip);
  });

  const judgingArea = document.getElementById('judging-area');
  const handArea    = document.getElementById('player-hand-area');
  const judgeWait   = document.getElementById('judge-waiting-area');

  if (gs.phase === 'judging') {
    judgingArea.classList.remove('hidden');
    handArea.classList.add('hidden');
    judgeWait.classList.add('hidden');
    stopTimerBar();

    const submList = document.getElementById('submissions-list');
    submList.innerHTML = '';

    if (gs.isJudge) {
      // Avisar al juez que tiene que elegir
      if (lastPhase !== 'judging') {
        vibrate([100, 50, 100]);
        playSound('myturn');
        showToast('¡Elegí la respuesta ganadora!', 'info');
      }
      gs.shuffledSubmissions.forEach((sub, i) => {
        const card = document.createElement('div');
        card.className = 'submission-card';
        card.innerHTML = `<div class="submission-num">${i + 1}</div><div>${sub.cards.join(' + ')}</div>`;
        card.onclick = () => { vibrate(30); judgePick(sub.id); };
        submList.appendChild(card);
      });
    } else {
      const msg = document.createElement('div');
      msg.className = 'submission-not-judge';
      msg.innerHTML = '👑 El juez está eligiendo la respuesta ganadora...';
      submList.appendChild(msg);
    }

  } else if (gs.isJudge) {
    judgingArea.classList.add('hidden');
    handArea.classList.add('hidden');
    judgeWait.classList.remove('hidden');
    stopTimerBar();
    document.getElementById('judge-progress').textContent =
      `${gs.submissionsCount} de ${nonJudge} jugadores enviaron`;

  } else {
    judgingArea.classList.add('hidden');
    handArea.classList.remove('hidden');
    judgeWait.classList.add('hidden');

    // Avisar al jugador que es su turno
    if (lastPhase !== 'playing' && !gs.isJudge) {
      vibrate([80]);
      playSound('myturn');
      startTimerBar(60);
    }

    renderHand(gs);
  }

  lastPhase = gs.phase;
}

function renderHand(gs) {
  const handDiv    = document.getElementById('hand-cards');
  const btnSubmit  = document.getElementById('btn-submit');
  const handTitle  = document.getElementById('hand-title');
  const selectedInfo = document.getElementById('selected-info');
  const blanks     = gs.currentBlackCard ? gs.currentBlackCard.blanks : 1;

  // Ya envié
  const myPlayer = gs.players.find(p => p.id === gs.playerId);
  if (myPlayer && myPlayer.hasSubmitted) {
    handTitle.textContent = '✅ Respuesta enviada';
    selectedInfo.textContent = 'Esperá a los demás...';
    handDiv.innerHTML = '';
    btnSubmit.classList.add('hidden');
    stopTimerBar();
    return;
  }

  handTitle.textContent = blanks === 1
    ? 'Tu mano — elegí 1 carta'
    : `Tu mano — elegí ${blanks} cartas en orden`;

  handDiv.innerHTML = '';
  gs.hand.forEach(card => {
    const el = document.createElement('div');
    el.className = 'hand-card';
    el.textContent = card;

    const selIdx = selectedCards.indexOf(card);
    if (selIdx !== -1) {
      el.classList.add('selected');
      const badge = document.createElement('div');
      badge.className = 'card-order';
      badge.textContent = selIdx + 1;
      el.appendChild(badge);
    }

    el.onclick = () => toggleCard(card, gs);
    handDiv.appendChild(el);
  });

  selectedInfo.textContent = selectedCards.length > 0
    ? `${selectedCards.length}/${blanks} seleccionadas`
    : '';

  if (selectedCards.length === blanks) {
    btnSubmit.classList.remove('hidden');
  } else {
    btnSubmit.classList.add('hidden');
  }
}

function toggleCard(card, gs) {
  const blanks = gs.currentBlackCard ? gs.currentBlackCard.blanks : 1;
  const idx = selectedCards.indexOf(card);

  if (idx !== -1) {
    selectedCards.splice(idx, 1);
    playSound('deselect');
    vibrate(20);
  } else {
    if (selectedCards.length >= blanks) {
      if (blanks === 1) {
        selectedCards = [card];
        playSound('select');
        vibrate(30);
      } else {
        showToast(`Solo podés elegir ${blanks} cartas`, 'error');
        vibrate([40, 20, 40]);
        return;
      }
    } else {
      selectedCards.push(card);
      playSound('select');
      vibrate(30);
    }
  }

  renderHand(gs);
}

function submitCards() {
  if (!state.gameState) return;
  const blanks = state.gameState.currentBlackCard.blanks;
  if (selectedCards.length !== blanks) {
    return showToast(`Seleccioná exactamente ${blanks} carta(s)`, 'error');
  }
  playSound('submit');
  vibrate([50, 30, 80]);
  socket.emit('submit_cards', { roomCode: state.roomCode, cards: [...selectedCards] });
  selectedCards = [];
  stopTimerBar();
}

function judgePick(submissionId) {
  if (!state.gameState || !state.gameState.isJudge) return;
  socket.emit('judge_pick', { roomCode: state.roomCode, submissionId });
}

// ── Render Resultado ───────────────────────────
function renderResult(gs) {
  const bc = document.getElementById('result-black-card');
  if (gs.currentBlackCard && gs.roundWinner) {
    let text = gs.currentBlackCard.text;
    gs.roundWinner.cards.forEach(card => {
      text = text.replace('__________', `<strong style="color:var(--accent)">${card}</strong>`);
    });
    bc.innerHTML = text;
  }

  document.getElementById('result-winner-name').textContent =
    gs.roundWinner ? `🏆 ${gs.roundWinner.playerName} gana el punto!` : '';

  const winCards = document.getElementById('result-winning-cards');
  winCards.innerHTML = '';
  if (gs.roundWinner) {
    gs.roundWinner.cards.forEach(card => {
      const el = document.createElement('div');
      el.className = 'result-white-card';
      el.textContent = card;
      winCards.appendChild(el);
    });
  }

  const allAns = document.getElementById('result-all-answers');
  allAns.innerHTML = '';
  if (gs.shuffledSubmissions) {
    gs.shuffledSubmissions.forEach((sub, i) => {
      const el = document.createElement('div');
      const isWinner = gs.roundWinner && sub.cards.join('|') === gs.roundWinner.cards.join('|');
      el.className = `result-answer-item${isWinner ? ' winner-answer' : ''}`;
      el.innerHTML = `
        ${isWinner ? '🏆 ' : (i + 1) + '. '}${sub.cards.join(' + ')}
        ${isWinner ? `<div class="answer-player">— ${gs.roundWinner.playerName}</div>` : ''}
      `;
      allAns.appendChild(el);
    });
  }

  renderScoreboard(gs, 'result-scoreboard-list');

  const btnNext = document.getElementById('btn-next-round');
  const waitMsg = document.getElementById('waiting-next-msg');
  if (gs.isHost) {
    btnNext.classList.remove('hidden');
    waitMsg.classList.add('hidden');
  } else {
    btnNext.classList.add('hidden');
    waitMsg.classList.remove('hidden');
  }

  // Sonido y vibración si ganaste la ronda
  if (gs.roundWinner && gs.roundWinner.playerName === state.playerName) {
    playSound('winner');
    vibrate([100, 50, 100, 50, 200]);
  }
}

function renderScoreboard(gs, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const sorted = [...gs.players].sort((a, b) => b.score - a.score);
  sorted.forEach(p => {
    const row = document.createElement('div');
    row.className = 'score-row';
    const dots = Array.from({ length: gs.targetScore }, (_, i) =>
      `<div class="score-dot${i < p.score ? ' filled' : ''}"></div>`
    ).join('');
    row.innerHTML = `
      <div class="player-label">
        ${p.isJudge ? '👑 ' : ''}
        <span>${p.name}${p.id === gs.playerId ? ' (vos)' : ''}</span>
      </div>
      <div class="score-dots">${dots}</div>
      <span style="font-weight:700; color:var(--accent)">${p.score}</span>
    `;
    container.appendChild(row);
  });
}

// ── Game Over ──────────────────────────────────
function renderGameOver(gs) {
  document.getElementById('gameover-winner').textContent = gs.winner ? gs.winner.name : '';

  const rankList = document.getElementById('gameover-ranking-list');
  rankList.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉'];
  (gs.finalRanking || []).forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'ranking-row';
    row.innerHTML = `
      <span class="ranking-pos">${medals[i] || (i + 1)}</span>
      <span class="ranking-name">${p.name}</span>
      <span class="ranking-score">${p.score} pts</span>
    `;
    rankList.appendChild(row);
  });

  document.getElementById('btn-restart').classList.toggle('hidden', !gs.isHost);

  playSound('winner');
  vibrate([200, 100, 200, 100, 400]);
  spawnConfetti();
  clearSession();
}

// ── Confetti ───────────────────────────────────
function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#F5C842', '#F5A623', '#E8845A', '#4bc8e8', '#8be84b', '#fff'];
  // Menos partículas en mobile para no lagear
  const count = window.innerWidth < 480 ? 30 : 50;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    const size = (6 + Math.random() * 8) + 'px';
    piece.style.width = size;
    piece.style.height = size;
    piece.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    container.appendChild(piece);
  }
}

// ── Master State Handler ───────────────────────
function handleGameState(gs) {
  state.gameState = gs;
  state.roomCode  = gs.code;
  saveSession();

  switch (gs.phase) {
    case 'lobby':
      selectedCards = [];
      lastPhase = null;
      stopTimerBar();
      showScreen('screen-lobby');
      renderLobby(gs);
      break;

    case 'playing':
    case 'judging':
      showScreen('screen-playing');
      renderGame(gs);
      break;

    case 'round_result':
      stopTimerBar();
      showScreen('screen-result');
      renderResult(gs);
      break;

    case 'game_over':
      stopTimerBar();
      showScreen('screen-gameover');
      renderGameOver(gs);
      break;
  }
}

// ── Socket Events ─────────────────────────────
socket.on('connect', () => {
  state.playerId = socket.id;

  // Intentar reconectar sesión guardada
  const session = loadSession();
  if (session.roomCode && session.playerName && !state.gameState) {
    state.roomCode   = session.roomCode;
    state.playerName = session.playerName;
    socket.emit('join_room', {
      roomCode:   session.roomCode,
      playerName: session.playerName,
    });
    return;
  }

  // O si llegó con ?sala= en la URL
  const params = new URLSearchParams(window.location.search);
  const codeFromUrl = params.get('sala') || params.get('room');
  if (codeFromUrl) {
    document.getElementById('join-code').value = codeFromUrl.toUpperCase();
    showScreen('screen-join');
  }
});

socket.on('room_created', ({ code }) => {
  state.roomCode = code;
});

socket.on('room_joined', ({ code }) => {
  state.roomCode = code;
});

socket.on('game_state', (gs) => {
  handleGameState(gs);
});

socket.on('error', ({ message }) => {
  showToast(message, 'error');
  vibrate([40, 20, 40]);
  // Si el error es que la sala no existe, limpiar sesión
  if (message.includes('no encontrada') || message.includes('ya comenzó')) {
    clearSession();
  }
});

socket.on('disconnect', () => {
  showToast('Conexión perdida. Reconectando...', 'error');
});

socket.on('reconnect', () => {
  showToast('Reconectado ✓', 'success');
  const session = loadSession();
  if (session.roomCode && session.playerName) {
    socket.emit('join_room', {
      roomCode:   session.roomCode,
      playerName: session.playerName,
    });
  }
});

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Si ya aceptó la edad antes, saltar el agegate
  try {
    if (localStorage.getItem('ogt_age_ok') === '1') {
      showScreen('screen-menu');
    }
  } catch(e) {}

  checkURLForRoom();

  // Enter key en inputs
  document.getElementById('host-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.target.blur(); createRoom(); }
  });
  document.getElementById('join-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('join-code').focus();
  });
  document.getElementById('join-code').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.target.blur(); joinRoom(); }
  });
  document.getElementById('join-code').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  // Desbloquear AudioContext en primer toque (requerido por iOS/Android)
  document.addEventListener('touchstart', () => {
    getAudioCtx();
  }, { once: true });
});
