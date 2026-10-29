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
    gateLocked: '🔒 दरवाज़ा बंद (1 गोटी काटना ज़रूरी)',
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
      <div style="text-align: left; line-height: 1.6; font-size: 0.88rem;">
        <h3 style="color: #fbbf24; margin-bottom: 6px;">🏠 1. गोटी खोलने और चाल के नियम (6 का नियम)</h3>
        <ul>
          <li><strong>6 आने पर गोटी खुलना:</strong> बेस (Base) से गोटी को बाहर निकालने के लिए पासे पर 6 आना ज़रूरी है।</li>
          <li><strong>एक्स्ट्रा चांस (Bonus Turn):</strong> पासे पर 6 आने पर, विरोधी की गोटी काटने पर, या गोटी होम पहुंचने पर अतिरिक्त मौका मिलता है।</li>
          <li><strong>लगातार तीन 6 का नियम:</strong> यदि लगातार 3 बार 6 आता है, तो वह टर्न रद्द (Cancel) हो जाती है (अधिकतम 2 छक्के मान्य)।</li>
        </ul>

        <h3 style="color: #fbbf24; margin: 12px 0 6px;">⚔️ 2. गोटी काटना (तोड़) और अंदर जाने का नियम (Core Custom Rule)</h3>
        <ul>
          <li><strong>बिना तोड़ के अंदर ना जाना:</strong> जब तक आप विरोधी की कम से कम 1 गोटी नहीं काटते, आपकी कोई भी गोटी अंतिम विजयी रास्ते (Home Path) या घर में प्रवेश नहीं कर सकती। गोटी मुहाने (Entrance) पर रुक जाएगी या बाहर दूसरा चक्कर लगाएगी।</li>
          <li><strong>स्टार (*) सुरक्षित स्थान:</strong> स्टार वाले सुरक्षित खानों (Safe Zones) में गोटियां बिल्कुल सुरक्षित हैं, वहाँ कोई किसी को नहीं काट सकता।</li>
        </ul>

        <h3 style="color: #fbbf24; margin: 12px 0 6px;">👥 3. लूडो किंग 2v2 Team Up Mode (टीम मोड नियम)</h3>
        <ul>
          <li><strong>टीम की बनावट:</strong> 4 खिलाड़ी मिलकर 2 टीमें बनाते हैं:
            <br>• <strong>Team 1:</strong> ब्लू (Blue) और ग्रीन (Green)
            <br>• <strong>Team 2:</strong> रेड (Red) और यलो (Yellow)
            <br>आमने-सामने बैठने वाले खिलाड़ी एक ही टीम के पार्टनर होते हैं।
          </li>
          <li><strong>गोटी काटना:</strong> आप सिर्फ विरोधी टीम की गोटी काट सकते हैं। अपने पार्टनर की गोटी को कभी नहीं काटा जा सकता। किसी भी पार्टनर के गोटी काटते ही पूरी टीम के लिए होम गेट खुल जाता है।</li>
          <li><strong>🤝 रोलिंग सपोर्ट (Partner Rolling Support):</strong> अगर आपकी सभी 4 गोटियां होम पहुंच जाती हैं, तब भी आपका खेल खत्म नहीं होता! आप अपनी टर्न पर पासा रोल करना जारी रखेंगे, ताकि मिले हुए नंबरों से आपका पार्टनर अपनी गोटियां आगे बढ़ा सके और जल्दी होम पहुंच सके!</li>
          <li><strong>जीत का नियम:</strong> जिस टीम के दोनों खिलाड़ियों की सभी 8 गोटियां (4 + 4) होम ट्रायंगल के अंदर पहुंच जाती हैं, वह टीम जीतती है!</li>
        </ul>
      </div>
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
      <div style="text-align: left; line-height: 1.6; font-size: 0.88rem;">
        <h3 style="color: #fbbf24; margin-bottom: 6px;">🏠 1. Token Opening & Movement (Rule of 6)</h3>
        <ul>
          <li><strong>Roll 6 to Exit Base:</strong> Need a 6 to open a token from Base.</li>
          <li><strong>Bonus Turn:</strong> Rolling a 6, capturing an opponent, or reaching home grants an extra roll.</li>
          <li><strong>Three 6s Rule:</strong> 3 consecutive 6s cancels the turn (max 2 sixes in a row).</li>
        </ul>

        <h3 style="color: #fbbf24; margin: 12px 0 6px;">⚔️ 2. Capture & Home Entrance (Kill Required)</h3>
        <ul>
          <li><strong>Kill Required:</strong> You cannot enter the colored Home Path until at least 1 opponent token has been captured.</li>
          <li><strong>Star Safe Zones:</strong> Star tiles ⭐ are completely safe from capture.</li>
        </ul>

        <h3 style="color: #fbbf24; margin: 12px 0 6px;">👥 3. Ludo King 2v2 Team Up Mode</h3>
        <ul>
          <li><strong>Teams:</strong> Team 1 (Blue + Green) vs Team 2 (Red + Yellow). Diagonally opposite players are partners.</li>
          <li><strong>Ally Safe:</strong> Teammates never capture each other. Capturing an opponent unlocks Home for both teammates.</li>
          <li><strong>🤝 Rolling Support:</strong> When all 4 of your tokens reach Home, you still continue rolling on your turns to move your partner's tokens and help them win!</li>
          <li><strong>Winning:</strong> First team to bring all 8 tokens (4 + 4) into Home wins!</li>
        </ul>
      </div>
    `
  }
};

function safeGetUiStorage(key, defaultVal = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeSetUiStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

class UIController {
  constructor() {
    this.lang = safeGetUiStorage('ludo_lang', 'hi');
    this.game = null;
    this.renderer = null;
    this.wakeLock = null;
    this.isRolling = false;
    window.uiController = this;
    window.ui = this;

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
      safeSetUiStorage('ludo_lang', this.lang);
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

    // Quick New Game button in header (User requested)
    const btnQuickNew = document.getElementById('btn-quick-new');
    btnQuickNew?.addEventListener('click', () => {
      this.dom.setupDialog.showModal();
    });

    // Team Mode button selector (2v2 Team Play)
    const teamModeBtns = document.querySelectorAll('.team-mode-btn');
    teamModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        teamModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // If team mode is selected, set player count to 4 (2v2)
        if (btn.dataset.team === 'team') {
          this.dom.playerCountBtns?.forEach((b) => {
            b.classList.remove('active');
            if (b.dataset.count === '4') b.classList.add('active');
          });
          this.generatePlayerConfigRows(4);
        }
      });
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
      ['blue', 'red', 'green', 'yellow', 'purple', 'orange'] :
      ['blue', 'red', 'green', 'yellow'];

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

    const activeTeamBtn = document.querySelector('.team-mode-btn.active');
    const teamMode = activeTeamBtn?.dataset.team === 'team' && playerCount === 4;

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
      teamMode,
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
        this.isRolling = false;
        this.updateTurnHud();
        if (this.renderer) {
          this.renderer.renderBoard();
        }
        if (this.game && this.game.turnState === 'WAITING_FOR_ROLL') {
          this.checkBotTurn();
        }
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
      const isRollingForPartner = this.game.teamMode && player.tokensFinished === this.game.tokensPerPlayer;
      const partner = this.game.getPartner(player);

      if (player.isBot) {
        this.dom.turnActionHint.textContent = `${player.name} (${t.botThinking})`;
      } else if (isRollingForPartner && partner) {
        if (this.game.turnState === 'WAITING_FOR_ROLL') {
          this.dom.turnActionHint.textContent = this.lang === 'hi'
            ? `🤝 ${partner.name} की मदद के लिए पासा फेंकें!`
            : `🤝 Roll to assist partner (${partner.name})!`;
        } else if (this.game.turnState === 'WAITING_FOR_MOVE') {
          this.dom.turnActionHint.textContent = this.lang === 'hi'
            ? `🤝 ${partner.name} की गोटी चुनें!`
            : `🤝 Select partner (${partner.name}) goti!`;
        }
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
  async triggerDiceRoll() {
    if (!this.game) return;
    const currentP = this.game.getCurrentPlayer();

    // User requested: "player apne hisb se hi gooti chale"
    // When waiting for move, tapping the dice guides player to tap their own goti on the board!
    if (this.game.turnState === 'WAITING_FOR_MOVE' && !currentP.isBot) {
      this.showToast(
        this.lang === 'hi' ? '👉 चलने के लिए बोर्ड पर अपनी गोटी छुएं!' : '👉 Tap your token on the board to move!',
        'info'
      );
      this.vibrate([25]);
      return;
    }

    // Strict lock to enforce "bin 6 k ek chance hi mile" and prevent double-roll race conditions
    if (this.isRolling || this.game.turnState !== 'WAITING_FOR_ROLL' || currentP.isBot) return;
    this.isRolling = true;

    // Immediately flag state as ANIMATING so rapid taps cannot fire twice
    this.game.turnState = 'ANIMATING';

    window.soundEngine.playDiceRoll();
    this.vibrate([35]);

    // Active corner dice on board
    const activeCornerDice = this.dom.boardSvg?.querySelector('.corner-dice.active-turn');

    // Roll dice value in rules
    this.game.turnState = 'WAITING_FOR_ROLL';
    const res = this.game.rollDice();
    if (!res) {
      this.isRolling = false;
      return;
    }

    this.game.turnState = 'ANIMATING';

    // User requested: "dice pe roll hote bich me dice me dikna chaye... itna slow karo ki dikh jaye"
    // 850ms tumbling animation showing the dots inside the die face actively cycling!
    if (this.renderer && activeCornerDice) {
      await this.renderer.animateDiceRollVisual(activeCornerDice, res.value, 850);
    } else {
      await new Promise((r) => setTimeout(r, 850));
    }

    this.updateDiceFace(res.value);

    if (res.validMoves && res.validMoves.length > 0) {
      // Player has movable tokens: wait for player to tap goti on board
      this.game.turnState = 'WAITING_FOR_MOVE';
      if (this.renderer) {
        this.renderer.renderBoard();
      }
      this.isRolling = false;
    } else {
      // No moves (rolled 1-5 without opened goti):
      // Keep turnState as ANIMATING for 750ms so player clearly sees the rolled number and message
      if (this.renderer) {
        this.renderer.renderBoard();
      }
      setTimeout(() => {
        this.game.turnState = 'WAITING_FOR_ROLL';
        this.game.passTurn();
        this.isRolling = false;
      }, 750);
    }
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
      setTimeout(async () => {
        if (!this.game || this.game.getCurrentPlayer().id !== player.id) return;
        window.soundEngine.playDiceRoll();

        const activeCornerDice = this.dom.boardSvg?.querySelector('.corner-dice.active-turn');
        const res = this.game.rollDice();
        if (!res) return;

        this.game.turnState = 'ANIMATING';
        if (this.renderer && activeCornerDice) {
          await this.renderer.animateDiceRollVisual(activeCornerDice, res.value, 850);
        } else {
          await new Promise((r) => setTimeout(r, 850));
        }

        this.updateDiceFace(res.value);

        if (res.validMoves && res.validMoves.length > 0) {
          this.game.turnState = 'WAITING_FOR_MOVE';
          if (this.renderer) {
            this.renderer.renderBoard();
          }

          // Bot picks move after 700ms
          setTimeout(() => {
            const bestMove = LudoAI.chooseBestMove(this.game, player, this.game.validMoves);
            if (bestMove) {
              window.soundEngine.playTokenStep();
              this.game.moveToken(bestMove.tokenId, bestMove.targetPlayerId);
            }
          }, 700);
        } else {
          // No moves for bot
          if (this.renderer) {
            this.renderer.renderBoard();
          }
          setTimeout(() => {
            this.game.turnState = 'WAITING_FOR_ROLL';
            this.game.passTurn();
          }, 1100);
        }
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

  showGameOverModal(result) {
    if (!this.dom.winPodiumList) return;
    this.dom.winPodiumList.innerHTML = '';

    if (result && result.teamMode) {
      const isTeamA = result.winningTeam === 'A';
      const teamWinners = this.game.players.filter((p) => p.teamId === result.winningTeam);
      const teamLosers = this.game.players.filter((p) => p.teamId !== result.winningTeam);

      const titleEl = document.getElementById('win-title');
      if (titleEl) {
        titleEl.textContent = this.lang === 'hi'
          ? `🏆 ${isTeamA ? 'टीम 1 (ब्लू + ग्रीन)' : 'टीम 2 (रेड + यलो)'} विजयी!`
          : `🏆 ${isTeamA ? 'Team 1 (Blue + Green)' : 'Team 2 (Red + Yellow)'} Wins!`;
      }

      const teamHeader = document.createElement('div');
      teamHeader.className = 'podium-item';
      teamHeader.style.background = isTeamA
        ? 'linear-gradient(135deg, rgba(0, 114, 188, 0.4), rgba(0, 166, 81, 0.4))'
        : 'linear-gradient(135deg, rgba(229, 37, 33, 0.4), rgba(253, 184, 19, 0.4))';
      teamHeader.style.border = '2px solid #fbbf24';
      teamHeader.innerHTML = `
        <span class="podium-rank">🏆</span>
        <span class="podium-name" style="font-weight: 900; color: #fbbf24; font-size: 1.05rem;">
          ${isTeamA ? 'Team 1: ब्लू (Blue) + ग्रीन (Green)' : 'Team 2: रेड (Red) + यलो (Yellow)'} - कुल 8 गोटियां होम!
        </span>
      `;
      this.dom.winPodiumList.appendChild(teamHeader);

      teamWinners.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'podium-item';
        item.innerHTML = `
          <span class="podium-rank">🥇</span>
          <span class="podium-color" style="background: ${p.config.hex};"></span>
          <span class="podium-name">${p.name} (होम: ${p.tokensFinished}/${this.game.tokensPerPlayer})</span>
          <span class="podium-kills">⚔️ ${p.killsCount}</span>
        `;
        this.dom.winPodiumList.appendChild(item);
      });

      teamLosers.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'podium-item';
        item.innerHTML = `
          <span class="podium-rank">🥈</span>
          <span class="podium-color" style="background: ${p.config.hex};"></span>
          <span class="podium-name">${p.name} (होम: ${p.tokensFinished}/${this.game.tokensPerPlayer})</span>
          <span class="podium-kills">⚔️ ${p.killsCount}</span>
        `;
        this.dom.winPodiumList.appendChild(item);
      });

      this.dom.winDialog.showModal();
      return;
    }

    const rankings = Array.isArray(result) ? result : (result?.rankings || []);
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
