/**
 * Ludo UI Controller, Touch Gestures, Audio/Haptics & Multi-Language Support
 */

const TRANSLATIONS = {
  hi: {
    title: 'सुपर लूडो प्रो',
    ruleBadge: 'नियम: बिना गोटी काटे अंदर जाना मना है 🔒',
    playersLabel: 'खिलाड़ियों की संख्या',
    tokensLabel: 'प्रति खिलाड़ी गोटी',
    tokens4: '4 गोटी (स्टैंडर्ड)',
    tokens2: '2 गोटी (क्विक मैच)',
    killRuleLabel: 'गोटी काटना ज़रूरी नियम',
    killRuleDesc: 'बिना किसी विरोधी की गोटी काटे होम में प्रवेश नहीं कर सकते',
    btnStart: '🎮 खेल शुरू करें',
    btnRoll: 'पासा फेंकें',
    turnText: 'की बारी है',
    gateLocked: '🔒 दरवाज़ा बंद (1 गोti काटना ज़रूरी)',
    gateOpen: '🔓 दरवाज़ा खुला (होम जा सकते हैं)',
    botThinking: 'सोच रहा है...',
    rolledSix: '🎲 6 आया! एक और मौका मिला!',
    threeSixes: '⚠️ लगातार 3 छक्के! मौका रद्द!',
    tokenCut: '⚔️ गोटी काट दी! बोनस रोल मिला!',
    gateUnlockedMsg: '🎉 घर का दरवाज़ा खुल गया! अब गोटी अंदर जा सकती है!',
    gateBlockedMsg: '🔒 घर का दरवाज़ा बंद है! पहले किसी की गोटी काटो!',
    tokenHome: '⭐ गोटी घर पहुँच गई! +1 रोल मिला!',
    human: '👤 इंसान',
    bot: '🤖 बॉट',
    winTitle: '🏆 खेल समाप्त! विजेता सूची',
    btnPlayAgain: 'फिर से खेलें',
    btnRules: 'नियम',
    rulesTitle: 'लूडो नियम (Rules)',
    rulesContent: `
      <ul>
        <li><strong>🎯 मुख्य नियम (User Requested):</strong> जब तक आप विरोधी की कम से कम 1 गोटी नहीं काटते, आपकी कोई भी गोटी 'होम लेन' (घर के अंदर) नहीं जा सकती! यदि गोटी गेट तक पहुँच भी जाए, तो उसे बाहर दूसरा चक्कर लगाना पड़ेगा।</li>
        <li><strong>🎲 पासा (Dice):</strong> 6 आने पर बेस से गोटी बाहर निकलती है और दोबारा पासा फेंकने का मौका मिलता है।</li>
        <li><strong>⚔️ गोटी काटना:</strong> विरोधी की गोटी पर पहुँचने पर वह कटकर बेस में चली जाती है और आपको +1 बोनस रोल मिलता है!</li>
        <li><strong>⭐ सुरक्षित स्थान:</strong> स्टार (Star) और शुरुआती स्थान पर गोटी सुरक्षित रहती है, वहाँ गोटी नहीं काटी जा सकती।</li>
        <li><strong>👥 खिलाड़ी:</strong> 2, 3, 4, 5, 6 खिलाड़ी एक साथ खेल सकते हैं (Hexagon और Classic Board)।</li>
      </ul>
    `
  },
  en: {
    title: 'Super Ludo Pro',
    ruleBadge: 'Rule: Kill Required to Enter Home 🔒',
    playersLabel: 'Number of Players',
    tokensLabel: 'Tokens per Player',
    tokens4: '4 Tokens (Standard)',
    tokens2: '2 Tokens (Quick Match)',
    killRuleLabel: 'Kill Required Rule',
    killRuleDesc: 'Cannot enter home path until you capture at least 1 opponent token',
    btnStart: '🎮 Start Game',
    btnRoll: 'Roll Dice',
    turnText: "'s Turn",
    gateLocked: '🔒 Gate Locked (Cut 1 token to unlock)',
    gateOpen: '🔓 Gate Open (Can enter home)',
    botThinking: 'Thinking...',
    rolledSix: '🎲 Rolled 6! Bonus turn granted!',
    threeSixes: '⚠️ 3 consecutive sixes! Turn passed!',
    tokenCut: '⚔️ Token Captured! Bonus roll granted!',
    gateUnlockedMsg: '🎉 Home Gate UNLOCKED! You can now enter home!',
    gateBlockedMsg: '🔒 Home Gate Locked! Must capture an opponent first!',
    tokenHome: '⭐ Token entered Home! +1 Bonus roll!',
    human: '👤 Human',
    bot: '🤖 Bot',
    winTitle: '🏆 Match Over! Winners Podium',
    btnPlayAgain: 'Play Again',
    btnRules: 'Rules',
    rulesTitle: 'Ludo Rules',
    rulesContent: `
      <ul>
        <li><strong>🎯 Highlight Rule:</strong> You CANNOT enter the colored Home Path until you have captured at least 1 opponent token! Tokens arriving at the gate will be forced to take another round until a kill is secured.</li>
        <li><strong>🎲 Dice:</strong> Roll a 6 to open a token from Base. Rolling 6 awards a bonus roll.</li>
        <li><strong>⚔️ Capture:</strong> Landing on an opponent token sends it back to Base and awards a bonus roll!</li>
        <li><strong>⭐ Safe Zones:</strong> Star tiles and start tiles are safe. Tokens cannot be captured there.</li>
        <li><strong>👥 Players:</strong> Supports 2, 3, 4, 5, or 6 players simultaneously!</li>
      </ul>
    `
  }
};

class UIController {
  constructor() {
    this.lang = localStorage.getItem('ludo_lang') || 'hi';
    this.game = null;
    this.renderer = null;
    this.wakeLock = null;
    window.uiController = this;

    this.cacheDom();
    this.bindEvents();
    this.applyLanguage();
    this.initWakeLock();
  }

  cacheDom() {
    this.dom = {
      appTitle: document.getElementById('app-title'),
      ruleBanner: document.getElementById('rule-banner'),
      boardSvg: document.getElementById('ludo-board'),
      confettiCanvas: document.getElementById('confetti-canvas'),

      // Controls
      btnSound: document.getElementById('btn-sound'),
      btnLang: document.getElementById('btn-lang'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnMenu: document.getElementById('btn-menu'),
      btnRules: document.getElementById('btn-rules'),

      // Turn HUD
      turnBar: document.getElementById('turn-bar'),
      turnPlayerName: document.getElementById('turn-player-name'),
      turnPlayerAvatar: document.getElementById('turn-player-avatar'),
      turnGateStatus: document.getElementById('turn-gate-status'),
      turnActionHint: document.getElementById('turn-action-hint'),

      // Dice
      diceArea: document.getElementById('dice-area'),
      diceCube: document.getElementById('dice-cube'),
      btnRoll: document.getElementById('btn-roll'),
      diceValueDisplay: document.getElementById('dice-value-display'),

      // Toast
      toast: document.getElementById('toast-notification'),

      // Modals
      setupDialog: document.getElementById('setup-dialog'),
      rulesDialog: document.getElementById('rules-dialog'),
      winDialog: document.getElementById('win-dialog'),

      // Setup inputs
      playerCountBtns: document.querySelectorAll('.player-count-btn'),
      boardTypeBtns: document.querySelectorAll('.board-type-btn'),
      playerListConfig: document.getElementById('player-list-config'),
      btnStartGame: document.getElementById('btn-start-game'),
      toggleKillRule: document.getElementById('toggle-kill-rule'),
      tokenCountBtns: document.querySelectorAll('.token-count-btn'),

      // Win podium
      winPodiumList: document.getElementById('win-podium-list'),
      btnPlayAgain: document.getElementById('btn-play-again')
    };
  }

  bindEvents() {
    // Sound toggle
    this.dom.btnSound?.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.dom.btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    // Language toggle
    this.dom.btnLang?.addEventListener('click', () => {
      this.lang = this.lang === 'hi' ? 'en' : 'hi';
      localStorage.setItem('ludo_lang', this.lang);
      this.applyLanguage();
      this.updateTurnHud();
    });

    // Fullscreen toggle
    this.dom.btnFullscreen?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Rules dialog
    this.dom.btnRules?.addEventListener('click', () => {
      this.dom.rulesDialog.showModal();
    });

    // Menu / Setup dialog
    this.dom.btnMenu?.addEventListener('click', () => {
      this.dom.setupDialog.showModal();
    });

    // Close buttons for dialogs
    document.querySelectorAll('.btn-close-dialog').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const dialog = e.target.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    // Player Count button selectors
    this.dom.playerCountBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dom.playerCountBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const count = parseInt(btn.dataset.count, 10);
        this.generatePlayerConfigRows(count);

        // If 5 or 6 players, force hexagon board
        if (count > 4) {
          this.dom.boardTypeBtns?.forEach((b) => {
            b.classList.remove('active');
            if (b.dataset.board === '6') b.classList.add('active');
          });
        }
      });
    });

    // Board Type button selectors
    this.dom.boardTypeBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dom.boardTypeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Token Count button selectors
    this.dom.tokenCountBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dom.tokenCountBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Start Game button
    this.dom.btnStartGame?.addEventListener('click', () => {
      this.startNewGameFromSetup();
    });

    // Play again button
    this.dom.btnPlayAgain?.addEventListener('click', () => {
      this.dom.winDialog.close();
      this.dom.setupDialog.showModal();
    });

    // Dice Roll button & cube tap with debounce
    let lastRollTime = 0;
    const handleRoll = (e) => {
      if (e) e.preventDefault();
      const now = Date.now();
      if (now - lastRollTime < 500) return;
      lastRollTime = now;

      if (!this.game) return;
      const currentP = this.game.getCurrentPlayer();
      if (currentP.isBot || this.game.turnState !== 'WAITING_FOR_ROLL') return;

      this.triggerDiceRoll();
    };

    this.dom.btnRoll?.addEventListener('click', handleRoll);
    this.dom.diceCube?.addEventListener('click', handleRoll);
    this.dom.diceArea?.addEventListener('touchstart', handleRoll, { passive: false });
  }

  applyLanguage() {
    const t = TRANSLATIONS[this.lang];
    if (this.dom.appTitle) this.dom.appTitle.textContent = t.title;
    if (this.dom.ruleBanner) this.dom.ruleBanner.textContent = t.ruleBadge;
    if (this.dom.btnRoll) this.dom.btnRoll.textContent = t.btnRoll;
    if (this.dom.btnLang) this.dom.btnLang.textContent = this.lang === 'hi' ? 'EN' : 'हिन्दी';

    const rulesTitleEl = document.getElementById('rules-title');
    const rulesBodyEl = document.getElementById('rules-body');
    if (rulesTitleEl) rulesTitleEl.textContent = t.rulesTitle;
    if (rulesBodyEl) rulesBodyEl.innerHTML = t.rulesContent;

    const winTitleEl = document.getElementById('win-title');
    if (winTitleEl) winTitleEl.textContent = t.winTitle;
    if (this.dom.btnPlayAgain) this.dom.btnPlayAgain.textContent = t.btnPlayAgain;
  }

  // Generate dynamic player setup rows for 2, 3, 4, 5, 6 players
  generatePlayerConfigRows(count) {
    if (!this.dom.playerListConfig) return;
    this.dom.playerListConfig.innerHTML = '';

    const colors = count > 4 ?
      ['red', 'green', 'yellow', 'blue', 'purple', 'orange'] :
      ['red', 'green', 'yellow', 'blue'];

    for (let i = 0; i < count; i++) {
      const cKey = colors[i];
      const row = document.createElement('div');
      row.className = 'player-setup-row';
      row.dataset.index = i;

      row.innerHTML = `
        <div class="player-color-dot" style="background: var(--color-${cKey});"></div>
        <input type="text" class="player-name-input" value="${this.lang === 'hi' ? 'खिलाड़ी' : 'Player'} ${i + 1}" maxlength="12" />
        <button type="button" class="player-type-toggle is-human">
          ${this.lang === 'hi' ? '👤 इंसान' : '👤 Human'}
        </button>
      `;

      const typeBtn = row.querySelector('.player-type-toggle');
      typeBtn.addEventListener('click', () => {
        const isHuman = typeBtn.classList.contains('is-human');
        if (isHuman) {
          typeBtn.classList.remove('is-human');
          typeBtn.classList.add('is-bot');
          typeBtn.textContent = this.lang === 'hi' ? '🤖 बॉट' : '🤖 Bot';
        } else {
          typeBtn.classList.remove('is-bot');
          typeBtn.classList.add('is-human');
          typeBtn.textContent = this.lang === 'hi' ? '👤 इंसान' : '👤 Human';
        }
      });

      this.dom.playerListConfig.appendChild(row);
    }
  }

  startNewGameFromSetup() {
    const activeCountBtn = document.querySelector('.player-count-btn.active');
    const playerCount = parseInt(activeCountBtn?.dataset.count || '4', 10);

    const activeBoardBtn = document.querySelector('.board-type-btn.active');
    const boardChoice = activeBoardBtn?.dataset.board || 'auto';
    let boardType = 4;
    if (boardChoice === '6' || playerCount > 4) {
      boardType = 6;
    } else if (boardChoice === '4') {
      boardType = 4;
    } else {
      boardType = playerCount > 4 ? 6 : 4;
    }

    const activeTokenBtn = document.querySelector('.token-count-btn.active');
    const tokensPerPlayer = parseInt(activeTokenBtn?.dataset.tokens || '4', 10);

    const killRequired = this.dom.toggleKillRule ? this.dom.toggleKillRule.checked : true;

    const players = [];
    const rows = document.querySelectorAll('.player-setup-row');
    rows.forEach((row, idx) => {
      const name = row.querySelector('.player-name-input')?.value.trim() || `Player ${idx + 1}`;
      const isBot = row.querySelector('.player-type-toggle')?.classList.contains('is-bot');
      players.push({ name, isBot });
    });

    this.dom.setupDialog.close();

    this.initGame({
      playerCount,
      boardType,
      tokensPerPlayer,
      killRequired,
      players
    });
  }

  initGame(options) {
    if (!this.renderer) {
      this.renderer = new BoardRenderer(this.dom.boardSvg, this.dom.confettiCanvas);
    }

    this.game = new LudoGame({
      ...options,
      onStateChange: () => {
        this.updateTurnHud();
        this.renderer.renderTokens();
      },
      onDiceRolled: (val, player, penalty) => {
        this.animateDiceRoll(val, penalty);
      },
      onTokenMoved: async (player, token, prev, move, victim) => {
        if (this.renderer) {
          await this.renderer.animateTokenHop(player, token, prev, move, victim);
        } else {
          this.renderer.renderBoard();
        }
        if (this.game.turnState === 'WAITING_FOR_ROLL') {
          this.checkBotTurn();
        }
      },
      onTokenKilled: (killer, victim, victimPlayer) => {
        window.soundEngine.playTokenKill();
        this.vibrate([60, 40, 100]);
        this.showToast(`${killer.name} ⚔️ ${victimPlayer.name} ${this.lang === 'hi' ? 'की गोटी काट दी!' : 'captured!'}`);
      },
      onHomeGateUnlocked: (player) => {
        window.soundEngine.playHomeUnlock();
        this.renderer.spawnConfetti(40);
        this.showToast(TRANSLATIONS[this.lang].gateUnlockedMsg, 'success');
      },
      onTokenFinished: (player, token) => {
        window.soundEngine.playTokenHome();
        this.renderer.spawnConfetti(50);
        this.showToast(`${player.name}: ${TRANSLATIONS[this.lang].tokenHome}`, 'success');
      },
      onGameOver: (rankings) => {
        window.soundEngine.playGameWin();
        this.renderer.spawnConfetti(120);
        this.vibrate([100, 60, 100, 60, 200]);
        this.showGameOverModal(rankings);
      },
      onBonusRoll: (player, reason) => {
        if (reason === 'SIX') {
          this.showToast(TRANSLATIONS[this.lang].rolledSix);
        }
        this.checkBotTurn();
      }
    });

    this.renderer.setGame(this.game);
    this.updateTurnHud();
    this.checkBotTurn();
  }

  // Update Top HUD with Current Player info & Lock status
  updateTurnHud() {
    if (!this.game) return;
    const player = this.game.getCurrentPlayer();
    if (!player) return;

    const t = TRANSLATIONS[this.lang];

    if (this.dom.turnPlayerName) {
      this.dom.turnPlayerName.textContent = player.name;
    }

    if (this.dom.turnPlayerAvatar) {
      this.dom.turnPlayerAvatar.style.background = player.config.hex;
      this.dom.turnPlayerAvatar.textContent = player.name.charAt(0).toUpperCase();
    }

    if (this.dom.turnGateStatus) {
      if (this.game.killRequired) {
        if (player.hasKilledOpponent) {
          this.dom.turnGateStatus.innerHTML = `<span class="badge-unlocked">${t.gateOpen}</span>`;
        } else {
          this.dom.turnGateStatus.innerHTML = `<span class="badge-locked">${t.gateLocked}</span>`;
        }
      } else {
        this.dom.turnGateStatus.textContent = '';
      }
    }

    if (this.dom.turnActionHint) {
      if (player.isBot) {
        this.dom.turnActionHint.textContent = `${player.name} (${t.botThinking})`;
      } else if (this.game.turnState === 'WAITING_FOR_ROLL') {
        this.dom.turnActionHint.textContent = this.lang === 'hi' ? '🎲 पासा दबाएं' : '🎲 Tap to Roll';
      } else if (this.game.turnState === 'WAITING_FOR_MOVE') {
        this.dom.turnActionHint.textContent = this.lang === 'hi' ? 'गोटी चुनें या पासा दबाएं' : 'Tap goti or dice';
      }
    }

    if (this.dom.btnRoll) {
      this.dom.btnRoll.disabled = player.isBot || (this.game.turnState !== 'WAITING_FOR_ROLL' && this.game.turnState !== 'WAITING_FOR_MOVE');
      this.dom.btnRoll.style.background = player.config.hex;
      if (this.game.turnState === 'WAITING_FOR_MOVE') {
        this.dom.btnRoll.textContent = this.lang === 'hi' ? 'चाल चलें ⏩' : 'Move ⏩';
      } else {
        this.dom.btnRoll.textContent = t.btnRoll;
      }
    }
  }

  // 3D Animated Dice Roll & Single-Tap Play
  triggerDiceRoll() {
    if (!this.game) return;
    const currentP = this.game.getCurrentPlayer();

    // If waiting for move, tapping dice auto-picks the best move!
    if (this.game.turnState === 'WAITING_FOR_MOVE' && !currentP.isBot) {
      const bestMove = LudoAI.chooseBestMove(this.game, currentP, this.game.validMoves);
      if (bestMove) {
        window.soundEngine.playTokenStep();
        this.game.moveToken(bestMove.tokenId);
        return;
      }
    }

    if (this.game.turnState !== 'WAITING_FOR_ROLL') return;

    window.soundEngine.playDiceRoll();
    this.vibrate([30]);
    this.dom.diceCube?.classList.add('rolling');

    // Also animate active corner dice on board
    const activeCornerDice = this.dom.boardSvg?.querySelector('.corner-dice.active-turn');
    if (activeCornerDice) activeCornerDice.classList.add('rolling');

    setTimeout(() => {
      this.dom.diceCube?.classList.remove('rolling');
      if (activeCornerDice) activeCornerDice.classList.remove('rolling');

      const res = this.game.rollDice();
      if (!res) return;

      this.updateDiceFace(res.value);

      // Re-render corner dice to show new number
      if (this.renderer) {
        this.renderer.renderBoard();
      }

      // Fast auto-move when only 1 choice or all base exits
      const allExitBase = this.game.validMoves.length > 0 && this.game.validMoves.every(m => m.action === 'EXIT_BASE');
      if ((allExitBase || this.game.validMoves.length === 1) && !this.game.getCurrentPlayer().isBot) {
        setTimeout(() => {
          if (this.game.turnState === 'WAITING_FOR_MOVE' && this.game.validMoves.length > 0) {
            window.soundEngine.playTokenStep();
            this.game.moveToken(this.game.validMoves[0].tokenId);
          }
        }, 240);
      }
    }, 350);
  }

  animateDiceRoll(value, penalty) {
    this.updateDiceFace(value);
    if (penalty) {
      this.showToast(TRANSLATIONS[this.lang].threeSixes, 'warning');
    }
  }

  updateDiceFace(val) {
    if (!this.dom.diceCube) return;
    this.dom.diceCube.setAttribute('data-face', val);
    if (this.dom.diceValueDisplay) {
      this.dom.diceValueDisplay.textContent = `${val}`;
    }
  }

  // Bot Turn Automation
  checkBotTurn() {
    if (!this.game || this.game.gameOver) return;
    const player = this.game.getCurrentPlayer();
    if (!player || !player.isBot) return;

    if (this.game.turnState === 'WAITING_FOR_ROLL') {
      setTimeout(() => {
        if (!this.game || this.game.getCurrentPlayer().id !== player.id) return;
        window.soundEngine.playDiceRoll();
        this.dom.diceCube?.classList.add('rolling');

        setTimeout(() => {
          this.dom.diceCube?.classList.remove('rolling');
          const res = this.game.rollDice();
          if (!res) return;

          this.updateDiceFace(res.value);

          // Now Bot picks move
          if (this.game.turnState === 'WAITING_FOR_MOVE') {
            setTimeout(() => {
              const bestMove = LudoAI.chooseBestMove(this.game, player, this.game.validMoves);
              if (bestMove) {
                window.soundEngine.playTokenStep();
                this.game.moveToken(bestMove.tokenId);
              }
            }, 600);
          }
        }, 450);
      }, 700);
    }
  }

  showToast(message, type = 'info') {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = message;
    this.dom.toast.className = `toast-popup show ${type}`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.dom.toast.classList.remove('show');
    }, 2800);
  }

  showGameOverModal(rankings) {
    if (!this.dom.winPodiumList) return;
    this.dom.winPodiumList.innerHTML = '';

    rankings.forEach((p, idx) => {
      const medals = ['🥇', '🥈', '🥉', '4th', '5th', '6th'];
      const item = document.createElement('div');
      item.className = 'podium-item';
      item.innerHTML = `
        <span class="podium-rank">${medals[idx] || (idx + 1)}</span>
        <span class="podium-color" style="background: ${p.config.hex};"></span>
        <span class="podium-name">${p.name}</span>
        <span class="podium-kills">⚔️ ${p.killsCount}</span>
      `;
      this.dom.winPodiumList.appendChild(item);
    });

    this.dom.winDialog.showModal();
  }

  vibrate(pattern) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  initWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        navigator.wakeLock.request('screen').then((lock) => {
          this.wakeLock = lock;
        }).catch(() => {});
      } catch (e) {}
    }
  }
}

window.UIController = UIController;
