/**
 * Ludo Board & Token SVG Renderer - Authentic Design Matching Reference Image
 * Features:
 * - 4 Player Corners (Player 1 Blue, Player 2 Red, Player 3 Green, Player 4 Yellow)
 * - Authentic 3D Star Gotis (Pucks with Concentric 3D Rings & Embossed Central Star ⭐)
 * - 4 External Player Dice Boxes (Kota) at Top & Bottom with Directional Pointer Arrow
 * - Active Dice & "🎲 TAP" prompt displayed ONLY on current player's side ("kota jiski chance hai auski hi taraf show kare")
 * - Slower, visible step-by-step hopping animation (260ms) ("chalne ki speed thoda slow karo jise dike chalte hua")
 * - Team Badges (A for Blue & Green, B for Red & Yellow)
 * - Traditional Kill / Tod lock indicators (🔒/🔓) at Home Entrances
 * - Safe Star tiles ⭐ and Directional Track Arrows
 */

class BoardRenderer {
  constructor(svgElement, confettiCanvas) {
    this.svg = svgElement;
    this.canvas = confettiCanvas;
    this.ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    this.game = null;
    this.particles = [];
    this.animatingToken = null;

    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.startParticleLoop();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.svg.getBoundingClientRect();
    this.canvas.width = rect.width || window.innerWidth;
    this.canvas.height = rect.height || window.innerHeight;
  }

  setGame(game) {
    this.game = game;
    this.renderBoard();
  }

  // Master board render
  renderBoard() {
    if (!this.game) return;
    this.svg.innerHTML = '';

    // Create defs for gradients and shadow filters
    this.createSvgDefs();

    if (this.game.boardType === 6) {
      this.renderBoard6();
    } else {
      this.renderBoard4();
    }

    this.renderTokens();
  }

  createSvgDefs() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <!-- Filters -->
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
      <filter id="pawn-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
      <filter id="gold-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <!-- Golden aura for movable tokens -->
      <radialGradient id="gold-aura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.85"/>
        <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>

      <!-- Outlined Safe Tile Star (Matching user's reference image) -->
      <g id="star-tile-icon">
        <polygon points="0,-13 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4"
                 fill="#ffffff" stroke="#1e293b" stroke-width="1.8"/>
      </g>

      <!-- Directional Track Arrows (col 7 row 14, col 0 row 7, etc.) -->
      <g id="arrow-up">
        <path d="M 0,-13 L 9,2 L 3.5,2 L 3.5,12 L -3.5,12 L -3.5,2 L -9,2 Z" fill="#0072bc" stroke="#ffffff" stroke-width="1.2"/>
      </g>
      <g id="arrow-down">
        <path d="M 0,13 L 9,-2 L 3.5,-2 L 3.5,-12 L -3.5,-12 L -3.5,-2 L -9,-2 Z" fill="#00a651" stroke="#ffffff" stroke-width="1.2"/>
      </g>
      <g id="arrow-right">
        <path d="M 13,0 L -2,-9 L -2,-3.5 L -12,-3.5 L -12,3.5 L -2,3.5 L -2,9 Z" fill="#e52521" stroke="#ffffff" stroke-width="1.2"/>
      </g>
      <g id="arrow-left">
        <path d="M -13,0 L 2,-9 L 2,-3.5 L 12,-3.5 L 12,3.5 L 2,3.5 L 2,9 Z" fill="#fdb813" stroke="#ffffff" stroke-width="1.2"/>
      </g>
    `;

    // 3D Gradients for Goti Pucks matching image
    const colorsMeta = {
      blue: { hex: '#0072bc', lightHex: '#60a5fa', darkHex: '#003e6b' },
      red: { hex: '#e52521', lightHex: '#ff7b78', darkHex: '#8b0e0c' },
      green: { hex: '#00a651', lightHex: '#52d98c', darkHex: '#005c2d' },
      yellow: { hex: '#fdb813', lightHex: '#fef08a', darkHex: '#996a00' },
      purple: { hex: '#9333ea', lightHex: '#c084fc', darkHex: '#581c87' },
      orange: { hex: '#ea580c', lightHex: '#fdba74', darkHex: '#9a3412' }
    };

    Object.keys(colorsMeta).forEach((key) => {
      const c = colorsMeta[key];

      // Outer Torus Ring Gradient
      const gradBody = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradBody.setAttribute('id', `token-body-${key}`);
      gradBody.setAttribute('cx', '35%');
      gradBody.setAttribute('cy', '32%');
      gradBody.setAttribute('r', '68%');
      gradBody.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="45%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradBody);

      // Inner Center Disc Gradient
      const gradHead = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradHead.setAttribute('id', `token-head-${key}`);
      gradHead.setAttribute('cx', '35%');
      gradHead.setAttribute('cy', '32%');
      gradHead.setAttribute('r', '65%');
      gradHead.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="50%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradHead);
    });

    this.svg.appendChild(defs);
  }

  /* ----------------------------------------------------
     4-PLAYER BOARD RENDERING (Matches User Reference Image)
  ---------------------------------------------------- */
  renderBoard4() {
    this.svg.setAttribute('viewBox', '0 -130 1000 1260');
    const S = 1000 / 15; // 66.666px
    const cfg = this.game.boardConfig;
    const currentPlayer = this.game.getCurrentPlayer();

    const boardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boardGroup.setAttribute('id', 'board-layer');

    // 1. Board Background Canvas
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', '1000');
    bg.setAttribute('height', '1000');
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('rx', '14');
    bg.setAttribute('stroke', '#1e293b');
    bg.setAttribute('stroke-width', '2');
    boardGroup.appendChild(bg);

    // 2. Base Yards (4 corners) matching user image:
    // Top-Left: Player 2 (Red) [Team B]
    // Top-Right: Player 3 (Green) [Team A]
    // Bottom-Left: Player 1 (Blue) [Team A]
    // Bottom-Right: Player 4 (Yellow) [Team B]
    const bases = [
      { key: 'red', x: 0, y: 0, label: 'Player 2', labelX: 25, labelY: 3 * S, rot: -90, team: 'B', teamX: 5.3 * S, teamY: 5.3 * S, teamBg: '#eab308', teamColor: '#b45309' },
      { key: 'green', x: 9 * S, y: 0, label: 'Player 3', labelX: 12 * S, labelY: 28, rot: 0, team: 'A', teamX: 9.7 * S, teamY: 5.3 * S, teamBg: '#38bdf8', teamColor: '#0369a1' },
      { key: 'blue', x: 0, y: 9 * S, label: 'Player 1', labelX: 3 * S, labelY: 15 * S - 12, rot: 0, team: 'A', teamX: 5.3 * S, teamY: 9.7 * S, teamBg: '#38bdf8', teamColor: '#0369a1' },
      { key: 'yellow', x: 9 * S, y: 9 * S, label: 'Player 4', labelX: 15 * S - 15, labelY: 12 * S, rot: 90, team: 'B', teamX: 9.7 * S, teamY: 9.7 * S, teamBg: '#eab308', teamColor: '#b45309' }
    ];

    bases.forEach((b) => {
      const c = cfg.colors[b.key];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isTurn = currentPlayer && currentPlayer.colorKey === b.key;

      // Base colored rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', b.x);
      rect.setAttribute('y', b.y);
      rect.setAttribute('width', 6 * S);
      rect.setAttribute('height', 6 * S);
      rect.setAttribute('fill', c.hex);
      rect.setAttribute('stroke', isTurn ? '#fbbf24' : '#0f172a');
      rect.setAttribute('stroke-width', isTurn ? '4' : '2');
      rect.setAttribute('rx', '16');
      g.appendChild(rect);

      // Active Kotha (Corner) Glowing Highlight for Current Player
      if (isTurn) {
        const activeAura = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        activeAura.setAttribute('class', 'active-kotha-aura');
        activeAura.setAttribute('x', b.x - 3);
        activeAura.setAttribute('y', b.y - 3);
        activeAura.setAttribute('width', 6 * S + 6);
        activeAura.setAttribute('height', 6 * S + 6);
        activeAura.setAttribute('rx', '18');
        activeAura.setAttribute('fill', 'none');
        activeAura.setAttribute('stroke', '#fbbf24');
        activeAura.setAttribute('stroke-width', '5');
        activeAura.setAttribute('filter', 'url(#gold-glow)');
        g.appendChild(activeAura);
      }

      // Player Label on the border (matching image: "Player 1", "Player 2", etc.)
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', b.labelX);
      lbl.setAttribute('y', b.labelY);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('font-size', '18');
      lbl.setAttribute('font-weight', '900');
      lbl.setAttribute('fill', '#ffffff');
      lbl.setAttribute('letter-spacing', '1');
      if (b.rot !== 0) {
        lbl.setAttribute('transform', `rotate(${b.rot} ${b.labelX} ${b.labelY})`);
      }
      lbl.textContent = b.label;
      g.appendChild(lbl);

      // Inner white square container (holding 4 gotis)
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      inner.setAttribute('x', b.x + 1 * S);
      inner.setAttribute('y', b.y + 1 * S);
      inner.setAttribute('width', 4 * S);
      inner.setAttribute('height', 4 * S);
      inner.setAttribute('fill', '#ffffff');
      inner.setAttribute('stroke', '#cbd5e1');
      inner.setAttribute('stroke-width', '1.5');
      inner.setAttribute('rx', '20');
      g.appendChild(inner);

      // 4 Circular Goti Sockets inside the white square (Ludo King Signature)
      c.baseSlots.forEach((slot) => {
        const socketG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        socketG.innerHTML = `
          <circle cx="${slot.c * S}" cy="${slot.r * S}" r="26" fill="${c.hex}" opacity="0.14"/>
          <circle cx="${slot.c * S}" cy="${slot.r * S}" r="21" fill="#ffffff" stroke="${c.hex}" stroke-width="2.6" filter="url(#shadow)"/>
          <circle cx="${slot.c * S}" cy="${slot.r * S}" r="10" fill="${c.hex}" opacity="0.28"/>
        `;
        g.appendChild(socketG);
      });

      // Circular Team Badge at the inner corner (A or B matching image!)
      const teamG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      teamG.setAttribute('transform', `translate(${b.teamX}, ${b.teamY})`);
      teamG.innerHTML = `
        <circle r="18" fill="#ffffff" stroke="${b.teamBg}" stroke-width="3" filter="url(#shadow)"/>
        <text text-anchor="middle" dy="0.35em" font-size="18" font-weight="900" fill="${b.teamColor}">${b.team}</text>
      `;
      g.appendChild(teamG);

      boardGroup.appendChild(g);
    });

    // 3. Track Cells (52 Outer Grid Cells)
    cfg.outerTiles.forEach((tile, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const x = tile.c * S;
      const y = tile.r * S;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', S);
      rect.setAttribute('height', S);

      // Check if starting tile
      let cellFill = '#ffffff';
      Object.keys(cfg.colors).forEach((k) => {
        if (cfg.colors[k].startIndex === idx) {
          cellFill = cfg.colors[k].hex;
        }
      });

      rect.setAttribute('fill', cellFill);
      rect.setAttribute('stroke', '#94a3b8');
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      // Outlined Star on Safe Tiles (matching user's reference image!)
      if (cfg.starTiles.includes(idx)) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        star.setAttribute('href', '#star-tile-icon');
        star.setAttribute('x', x + S / 2);
        star.setAttribute('y', y + S / 2);
        g.appendChild(star);
      }

      boardGroup.appendChild(g);
    });

    // 4. Directional Arrows on Home Entrance Tiles (matching image)
    const arrows = [
      { dir: 'up', c: 7, r: 14 },
      { dir: 'right', c: 0, r: 7 },
      { dir: 'down', c: 7, r: 0 },
      { dir: 'left', c: 14, r: 7 }
    ];

    arrows.forEach((a) => {
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      arrow.setAttribute('href', `#arrow-${a.dir}`);
      arrow.setAttribute('x', a.c * S + S / 2);
      arrow.setAttribute('y', a.r * S + S / 2);
      boardGroup.appendChild(arrow);
    });

    // 5. Colored Home Paths (5 cells each)
    Object.keys(cfg.colors).forEach((k) => {
      const c = cfg.colors[k];
      c.homePath.forEach((pt) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pt.c * S);
        rect.setAttribute('y', pt.r * S);
        rect.setAttribute('width', S);
        rect.setAttribute('height', S);
        rect.setAttribute('fill', c.hex);
        rect.setAttribute('stroke', '#ffffff');
        rect.setAttribute('stroke-width', '1.5');
        boardGroup.appendChild(rect);
      });
    });

    // 6. Center Home 3x3 Triangles
    const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const midX = 7.5 * S;
    const midY = 7.5 * S;

    const triangles = [
      { key: 'green', pts: `${6 * S},${6 * S} ${9 * S},${6 * S} ${midX},${midY}` },
      { key: 'yellow', pts: `${9 * S},${6 * S} ${9 * S},${9 * S} ${midX},${midY}` },
      { key: 'blue', pts: `${6 * S},${9 * S} ${9 * S},${9 * S} ${midX},${midY}` },
      { key: 'red', pts: `${6 * S},${6 * S} ${6 * S},${9 * S} ${midX},${midY}` }
    ];

    triangles.forEach(({ key, pts }) => {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', cfg.colors[key].hex);
      poly.setAttribute('stroke', '#0f172a');
      poly.setAttribute('stroke-width', '1.8');
      centerGroup.appendChild(poly);
    });

    boardGroup.appendChild(centerGroup);

    // 7. Home Entrance Lock/Unlock Indicators (Traditional Kill / Tod Rule)
    this.renderHomeGateLocks(boardGroup, S);

    // 8. The 4 External Player Dice Boxes (Kotha) matching the Reference Image!
    this.renderPlayerKothaBoxes(boardGroup, S);

    this.svg.appendChild(boardGroup);
  }

  /* ----------------------------------------------------
     THE 4 EXTERNAL PLAYER DICE BOXES (KOTHA)
     Matches the User's Uploaded Reference Image!
     "kota jiski chance hai auski hi taraf show kare"
  ---------------------------------------------------- */
  renderPlayerKothaBoxes(boardGroup, S) {
    if (this.game.boardType !== 4) return;
    const currentPlayer = this.game.getCurrentPlayer();
    if (!currentPlayer) return;

    const activeKey = currentPlayer.colorKey;

    const p1 = this.game.players.find((p) => p.colorKey === 'blue') || this.game.players[0];
    const p2 = this.game.players.find((p) => p.colorKey === 'red') || this.game.players[1];
    const p3 = this.game.players.find((p) => p.colorKey === 'green') || this.game.players[2];
    const p4 = this.game.players.find((p) => p.colorKey === 'yellow') || this.game.players[3];

    // 4 Box specifications placed cleanly outside the 1000x1000 board:
    // Top-Left: Player 2 (Red) [Team B]
    // Top-Right: Player 3 (Green) [Team A]
    // Bottom-Left: Player 1 (Blue) [Team A]
    // Bottom-Left: Player 1 (Blue) [Team 1]
    // Bottom-Right: Player 4 (Yellow) [Team 2]
    const kothas = [
      {
        player: p1,
        key: 'blue',
        name: p1?.name || 'Player 1 (Blue)',
        team: '1',
        teamBg: '#38bdf8',
        teamColor: '#0369a1',
        x: 15,
        y: 1025,
        width: 390,
        height: 98,
        gotiX: 68,
        gotiY: 1074,
        textX: 115,
        textY: 1062,
        trayX: 285,
        trayY: 1035,
        side: 'bottom'
      },
      {
        player: p4,
        key: 'yellow',
        name: p4?.name || 'Player 4 (Yellow)',
        team: '2',
        teamBg: '#eab308',
        teamColor: '#b45309',
        x: 595,
        y: 1025,
        width: 390,
        height: 98,
        gotiX: 932,
        gotiY: 1074,
        textX: 715,
        textY: 1062,
        trayX: 615,
        trayY: 1035,
        side: 'bottom'
      },
      {
        player: p2,
        key: 'red',
        name: p2?.name || 'Player 2 (Red)',
        team: '2',
        teamBg: '#eab308',
        teamColor: '#b45309',
        x: 15,
        y: -115,
        width: 390,
        height: 98,
        gotiX: 68,
        gotiY: -66,
        textX: 115,
        textY: -76,
        trayX: 285,
        trayY: -105,
        side: 'top'
      },
      {
        player: p3,
        key: 'green',
        name: p3?.name || 'Player 3 (Green)',
        team: '1',
        teamBg: '#38bdf8',
        teamColor: '#0369a1',
        x: 595,
        y: -115,
        width: 390,
        height: 98,
        gotiX: 932,
        gotiY: -66,
        textX: 715,
        textY: -76,
        trayX: 615,
        trayY: -105,
        side: 'top'
      }
    ];

    kothas.forEach((k) => {
      const c = this.game.boardConfig.colors[k.key];
      const isTurn = activeKey === k.key;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `player-kotha-box ${isTurn ? 'kotha-active' : ''}`);

      // Background Card
      const card = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      card.setAttribute('x', k.x);
      card.setAttribute('y', k.y);
      card.setAttribute('width', k.width);
      card.setAttribute('height', k.height);
      card.setAttribute('rx', '18');
      card.setAttribute('fill', isTurn ? '#1e293b' : '#0f172a');
      card.setAttribute('stroke', isTurn ? '#fbbf24' : c.hex);
      card.setAttribute('stroke-width', isTurn ? '4' : '2');
      card.setAttribute('filter', isTurn ? 'url(#gold-glow)' : 'url(#shadow)');
      g.appendChild(card);

      // Mini 3D Token Preview
      const miniGoti = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      miniGoti.setAttribute('transform', `translate(${k.gotiX}, ${k.gotiY}) scale(0.85)`);
      miniGoti.innerHTML = `
        <circle r="18" fill="url(#token-body-${k.key})" stroke="#ffffff" stroke-width="1.8" filter="url(#shadow)"/>
        <circle r="11" fill="url(#token-head-${k.key})"/>
        <polygon points="0,-6 1.8,-1.8 6,-1.8 2.6,0.8 3.8,4.5 0,2 -3.8,4.5 -2.6,0.8 -6,-1.8 -1.8,-1.8" fill="#ffffff"/>
      `;
      g.appendChild(miniGoti);

      // Player Name & Turn / Team Info
      const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let statusSubtitle = '';
      const isRollingForPartner = this.game.teamMode && k.player?.tokensFinished === this.game.tokensPerPlayer;

      if (isTurn) {
        if (isRollingForPartner) {
          statusSubtitle = this.game.turnState === 'WAITING_FOR_ROLL' ? '🤝 पार्टनर मदद (रोल करें)' : '🤝 पार्टनर की गोटी चुनें';
        } else {
          statusSubtitle = this.game.turnState === 'WAITING_FOR_ROLL' ? '🎲 पासा फेंकें' : '⏩ गोटी चुनें';
        }
      } else {
        if (this.game.teamMode) {
          if (k.player?.tokensFinished === this.game.tokensPerPlayer) {
            statusSubtitle = '✅ 4/4 पूरी • सपोर्ट के लिए तैयार';
          } else {
            statusSubtitle = `टीम ${k.team} • पक्की: ${k.player?.tokensFinished || 0}/4`;
          }
        } else {
          statusSubtitle = `पक्की: ${k.player?.tokensFinished || 0}/4`;
        }
      }

      textG.innerHTML = `
        <text x="${k.textX}" y="${k.textY}" font-size="16" font-weight="900" fill="#ffffff">${k.name}</text>
        <text x="${k.textX}" y="${k.textY + 22}" font-size="12" font-weight="700" fill="${isTurn ? '#fbbf24' : '#94a3b8'}">
          ${statusSubtitle}
        </text>
      `;
      g.appendChild(textG);

      // Die Tray
      const tray = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tray.setAttribute('x', k.trayX);
      tray.setAttribute('y', k.trayY);
      tray.setAttribute('width', '90');
      tray.setAttribute('height', '76');
      tray.setAttribute('rx', '12');
      tray.setAttribute('fill', isTurn ? '#ffffff' : '#1e293b');
      tray.setAttribute('stroke', isTurn ? c.hex : '#334155');
      tray.setAttribute('stroke-width', '2');
      g.appendChild(tray);

      // Die Tray Center
      const diceCenterX = k.trayX + 45;
      const diceCenterY = k.trayY + 38;

      if (isTurn) {
        const diceVal = this.game.currentRoll || 6;
        const diceG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        diceG.setAttribute('class', 'corner-dice active-turn');
        diceG.setAttribute('id', `corner-dice-${player.id}`);
        diceG.setAttribute('transform', `translate(${diceCenterX}, ${diceCenterY})`);

        // Pulsing active aura
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        aura.setAttribute('class', 'dice-aura');
        aura.setAttribute('x', '-28');
        aura.setAttribute('y', '-28');
        aura.setAttribute('width', '56');
        aura.setAttribute('height', '56');
        aura.setAttribute('rx', '14');
        aura.setAttribute('fill', c.hex);
        aura.setAttribute('opacity', '0.45');
        diceG.appendChild(aura);

        // 3D White Die Box
        const dieBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        dieBox.setAttribute('x', '-24');
        dieBox.setAttribute('y', '-24');
        dieBox.setAttribute('width', '48');
        dieBox.setAttribute('height', '48');
        dieBox.setAttribute('rx', '11');
        dieBox.setAttribute('fill', '#ffffff');
        dieBox.setAttribute('stroke', c.hex);
        dieBox.setAttribute('stroke-width', '2.8');
        dieBox.setAttribute('filter', 'url(#pawn-shadow)');
        diceG.appendChild(dieBox);

        // Dedicated Pips Group (animated dynamically during roll!)
        const pipsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pipsGroup.setAttribute('class', 'dice-pips-group');
        this.drawDicePips(pipsGroup, diceVal, 48);
        diceG.appendChild(pipsGroup);

        // "TAP" floating badge
        if (this.game.turnState === 'WAITING_FOR_ROLL' || this.game.turnState === 'WAITING_FOR_MOVE') {
          const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const badgeOffsetY = k.side === 'bottom' ? -34 : 34;
          badgeG.setAttribute('transform', `translate(0, ${badgeOffsetY})`);
          badgeG.setAttribute('class', 'dice-tap-badge');

          const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          badgeRect.setAttribute('x', '-30');
          badgeRect.setAttribute('y', '-11');
          badgeRect.setAttribute('width', '60');
          badgeRect.setAttribute('height', '22');
          badgeRect.setAttribute('rx', '11');
          badgeRect.setAttribute('fill', '#f59e0b');
          badgeRect.setAttribute('stroke', '#ffffff');
          badgeRect.setAttribute('stroke-width', '1.8');
          badgeG.appendChild(badgeRect);

          const badgeTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          badgeTxt.setAttribute('text-anchor', 'middle');
          badgeTxt.setAttribute('dy', '0.35em');
          badgeTxt.setAttribute('font-size', '11');
          badgeTxt.setAttribute('font-weight', '900');
          badgeTxt.setAttribute('fill', '#0f172a');
          if (isRollingForPartner) {
            badgeTxt.textContent = this.game.turnState === 'WAITING_FOR_ROLL' ? '🤝 ROLL' : '🤝 GOTI';
          } else {
            badgeTxt.textContent = this.game.turnState === 'WAITING_FOR_ROLL' ? '🎲 TAP' : '👉 GOTI';
          }
          badgeG.appendChild(badgeTxt);

          diceG.appendChild(badgeG);
        }

        // Tap Handler to roll directly from their box!
        if (!currentPlayer.isBot) {
          g.style.cursor = 'pointer';
          let lastTap = 0;
          const handleKothaTap = (e) => {
            const now = Date.now();
            if (now - lastTap < 600) return;
            lastTap = now;

            e.preventDefault();
            e.stopPropagation();
            if (window.uiController) {
              window.uiController.triggerDiceRoll();
            }
          };

          g.addEventListener('touchstart', handleKothaTap, { passive: false });
          g.addEventListener('click', (e) => {
            if (Date.now() - lastTap < 600) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            handleKothaTap(e);
          });
        }

        g.appendChild(diceG);
      } else {
        // Inactive player: show small waiting die
        const miniDiceG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        miniDiceG.setAttribute('transform', `translate(${diceCenterX}, ${diceCenterY}) opacity(0.6)`);
        const miniBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        miniBox.setAttribute('x', '-16');
        miniBox.setAttribute('y', '-16');
        miniBox.setAttribute('width', '32');
        miniBox.setAttribute('height', '32');
        miniBox.setAttribute('rx', '8');
        miniBox.setAttribute('fill', '#334155');
        miniBox.setAttribute('stroke', '#64748b');
        miniBox.setAttribute('stroke-width', '1.5');
        miniDiceG.appendChild(miniBox);
        g.appendChild(miniDiceG);
      }

      boardGroup.appendChild(g);
    });

    // 3D Directional Orange Pointer Arrow between boxes (pointing to active player!)
    if (activeKey === 'red') {
      const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arr.setAttribute('points', '525,-66 475,-66 493,-80 475,-66 493,-52');
      arr.setAttribute('fill', '#f97316');
      arr.setAttribute('stroke', '#ffffff');
      arr.setAttribute('stroke-width', '2.5');
      arr.setAttribute('filter', 'url(#shadow)');
      boardGroup.appendChild(arr);
    } else if (activeKey === 'green') {
      const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arr.setAttribute('points', '475,-66 525,-66 507,-80 525,-66 507,-52');
      arr.setAttribute('fill', '#f97316');
      arr.setAttribute('stroke', '#ffffff');
      arr.setAttribute('stroke-width', '2.5');
      arr.setAttribute('filter', 'url(#shadow)');
      boardGroup.appendChild(arr);
    } else if (activeKey === 'blue') {
      const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arr.setAttribute('points', '525,1074 475,1074 493,1060 475,1074 493,1088');
      arr.setAttribute('fill', '#f97316');
      arr.setAttribute('stroke', '#ffffff');
      arr.setAttribute('stroke-width', '2.5');
      arr.setAttribute('filter', 'url(#shadow)');
      boardGroup.appendChild(arr);
    } else if (activeKey === 'yellow') {
      const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arr.setAttribute('points', '475,1074 525,1074 507,1060 525,1074 507,1088');
      arr.setAttribute('fill', '#f97316');
      arr.setAttribute('stroke', '#ffffff');
      arr.setAttribute('stroke-width', '2.5');
      arr.setAttribute('filter', 'url(#shadow)');
      boardGroup.appendChild(arr);
    }
  }

  /* ----------------------------------------------------
     6-PLAYER HEXAGON BOARD RENDERING
  ---------------------------------------------------- */
  renderBoard6() {
    this.svg.setAttribute('viewBox', '0 0 1000 1000');
    const cfg = this.game.boardConfig;
    const boardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boardGroup.setAttribute('id', 'board-layer-6');

    // 1. Regular Hexagonal Board Background
    const hexBg = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * (Math.PI / 180);
      const x = 500 + 490 * Math.cos(angle);
      const y = 500 + 490 * Math.sin(angle);
      hexPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    hexBg.setAttribute('points', hexPoints.join(' '));
    hexBg.setAttribute('fill', '#0f172a');
    hexBg.setAttribute('stroke', '#334155');
    hexBg.setAttribute('stroke-width', '6');
    boardGroup.appendChild(hexBg);

    const innerHex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const innerPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * (Math.PI / 180);
      const x = 500 + 478 * Math.cos(angle);
      const y = 500 + 478 * Math.sin(angle);
      innerPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    innerHex.setAttribute('points', innerPoints.join(' '));
    innerHex.setAttribute('fill', '#ffffff');
    boardGroup.appendChild(innerHex);

    // 2. Base Areas (6 corners)
    cfg.colorKeys.forEach((key) => {
      const c = cfg.colors[key];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const baseCapsule = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      baseCapsule.setAttribute('cx', c.baseCenter.x);
      baseCapsule.setAttribute('cy', c.baseCenter.y);
      baseCapsule.setAttribute('r', '54');
      baseCapsule.setAttribute('fill', c.hex);
      baseCapsule.setAttribute('stroke', '#ffffff');
      baseCapsule.setAttribute('stroke-width', '3');
      baseCapsule.setAttribute('filter', 'url(#shadow)');
      g.appendChild(baseCapsule);

      c.baseSlots.forEach((slot) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', slot.x);
        circle.setAttribute('cy', slot.y);
        circle.setAttribute('r', '18');
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('stroke', c.darkHex || '#000');
        circle.setAttribute('stroke-width', '2');
        g.appendChild(circle);
      });

      boardGroup.appendChild(g);
    });

    // 3. Track Cells (72 cells)
    cfg.outerTiles.forEach((pt, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '19');

      let fill = '#ffffff';
      cfg.colorKeys.forEach((k) => {
        if (cfg.colors[k].startIndex === idx) {
          fill = cfg.colors[k].hex;
        }
      });

      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', '#cbd5e1');
      circle.setAttribute('stroke-width', '1.5');
      g.appendChild(circle);

      if (cfg.starTiles.includes(idx)) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        star.setAttribute('href', '#star-tile-icon');
        star.setAttribute('x', pt.x);
        star.setAttribute('y', pt.y);
        star.setAttribute('transform', `scale(0.8) translate(${pt.x * 0.25}, ${pt.y * 0.25})`);
        g.appendChild(star);
      }

      boardGroup.appendChild(g);
    });

    // 4. Colored Home Paths
    cfg.colorKeys.forEach((key) => {
      const c = cfg.colors[key];
      c.homePath.forEach((pt) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '19');
        circle.setAttribute('fill', c.hex);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2');
        boardGroup.appendChild(circle);
      });
    });

    // 5. Center Home Hexagon
    const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i < 6; i++) {
      const key = cfg.colorKeys[i];
      const a1 = (i * 60 - 30) * (Math.PI / 180);
      const a2 = (i * 60 + 30) * (Math.PI / 180);
      const r = 85;
      const x1 = 500 + r * Math.cos(a1);
      const y1 = 500 + r * Math.sin(a1);
      const x2 = 500 + r * Math.cos(a2);
      const y2 = 500 + r * Math.sin(a2);

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `500,500 ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
      poly.setAttribute('fill', cfg.colors[key].hex);
      poly.setAttribute('stroke', '#ffffff');
      poly.setAttribute('stroke-width', '1.5');
      centerGroup.appendChild(poly);
    }

    boardGroup.appendChild(centerGroup);

    // 6. Home Gate Locks
    this.renderHomeGateLocks6(boardGroup);

    this.svg.appendChild(boardGroup);
  }

  /* ----------------------------------------------------
     HOME GATE LOCK INDICATORS (Special Kill / Tod Rule)
  ---------------------------------------------------- */
  renderHomeGateLocks(boardGroup, S) {
    if (!this.game.killRequired) return;

    this.game.players.forEach((player) => {
      const turnIdx = player.config.turnIndex;
      const pt = this.game.boardConfig.outerTiles[turnIdx];
      if (!pt) return;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'home-gate-lock');
      g.setAttribute('transform', `translate(${pt.c * S + S / 2}, ${pt.r * S + S / 2})`);

      const unlocked = this.game.hasKillPermission(player);
      const icon = unlocked ? '🔓' : '🔒';
      const badgeBg = unlocked ? '#10b981' : '#dc2626';

      g.innerHTML = `
        <circle r="${S * 0.36}" fill="${badgeBg}" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
        <text text-anchor="middle" dy="0.35em" font-size="${S * 0.4}" fill="#ffffff">${icon}</text>
      `;

      boardGroup.appendChild(g);
    });
  }

  renderHomeGateLocks6(boardGroup) {
    if (!this.game.killRequired) return;

    this.game.players.forEach((player) => {
      const turnIdx = player.config.turnIndex;
      const pt = this.game.boardConfig.outerTiles[turnIdx];
      if (!pt) return;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'home-gate-lock');
      g.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);

      const unlocked = this.game.hasKillPermission(player);
      const icon = unlocked ? '🔓' : '🔒';
      const badgeBg = unlocked ? '#10b981' : '#dc2626';

      g.innerHTML = `
        <circle r="18" fill="${badgeBg}" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
        <text text-anchor="middle" dy="0.35em" font-size="16" fill="#ffffff">${icon}</text>
      `;

      boardGroup.appendChild(g);
    });
  }

  /* ----------------------------------------------------
     DICE PIPS DRAWING & REALISTIC ROLL ANIMATION
  ---------------------------------------------------- */
  drawDicePips(svgGroup, value, size = 48) {
    const offset = size * 0.25;
    const r = size * 0.095;

    const pips = [];
    if (value === 1) {
      // Big bold Red Center Pip (Ludo Signature)
      pips.push({ x: 0, y: 0, color: '#ef4444', r: r * 1.5 });
    } else if (value === 2) {
      pips.push({ x: -offset, y: -offset }, { x: offset, y: offset });
    } else if (value === 3) {
      pips.push({ x: -offset, y: -offset }, { x: 0, y: 0 }, { x: offset, y: offset });
    } else if (value === 4) {
      pips.push({ x: -offset, y: -offset }, { x: offset, y: -offset }, { x: -offset, y: offset }, { x: offset, y: offset });
    } else if (value === 5) {
      pips.push({ x: -offset, y: -offset }, { x: offset, y: -offset }, { x: 0, y: 0 }, { x: -offset, y: offset }, { x: offset, y: offset });
    } else if (value === 6) {
      pips.push(
        { x: -offset, y: -offset }, { x: -offset, y: 0 }, { x: -offset, y: offset },
        { x: offset, y: -offset }, { x: offset, y: 0 }, { x: offset, y: offset }
      );
    }

    pips.forEach((p) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', p.r || r);
      circle.setAttribute('fill', p.color || '#0f172a');
      svgGroup.appendChild(circle);
    });
  }

  // User requested: "dice pe roll hote bich me dice me dikna chaye... itna slow karo ki dikh jaye"
  // Dynamic 850ms tumbling animation showing the dots inside the die face cycling visibly!
  async animateDiceRollVisual(cornerDiceEl, finalVal, duration = 850) {
    if (!cornerDiceEl) return;
    const pipsGroup = cornerDiceEl.querySelector('.dice-pips-group');
    cornerDiceEl.classList.remove('roll-settled');
    cornerDiceEl.classList.add('rolling');

    const startTime = Date.now();
    let lastRollFace = 1;

    // Cycle through random dice numbers every 70ms so numbers are clearly seen rolling inside the die
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(interval);
          resolve();
          return;
        }

        let nextFace;
        do {
          nextFace = Math.floor(Math.random() * 6) + 1;
        } while (nextFace === lastRollFace);
        lastRollFace = nextFace;

        if (pipsGroup) {
          pipsGroup.innerHTML = '';
          this.drawDicePips(pipsGroup, nextFace, 48);
        }
      }, 70);
    });

    cornerDiceEl.classList.remove('rolling');
    cornerDiceEl.classList.add('roll-settled');
    setTimeout(() => cornerDiceEl.classList.remove('roll-settled'), 450);

    if (pipsGroup) {
      pipsGroup.innerHTML = '';
      this.drawDicePips(pipsGroup, finalVal, 48);
    }
  }

  /* ----------------------------------------------------
     STEP-BY-STEP VISIBLE HOPPING ANIMATION
     User requested: "or chalne ki speed thoda slow karo jise dike chalte hua"
     Speed set to 260ms per step so every hop is clearly visible!
  ---------------------------------------------------- */
  calculateWaypoints(player, prevPos, move) {
    const cfg = this.game.boardConfig;
    const N = cfg.totalOuterTiles;
    const waypoints = [];

    if (move.action === 'EXIT_BASE') {
      const startPt = this.getTokenCoordinates({ state: 'TRACK', trackIndex: player.config.startIndex }, player);
      if (startPt) waypoints.push(startPt);
      return waypoints;
    }

    if (move.action === 'MOVE_TRACK' || move.action === 'BYPASS_LOCKED_GATE') {
      const steps = move.destination.stepsTraveled - prevPos.stepsTraveled;
      for (let s = 1; s <= steps; s++) {
        const tIdx = (prevPos.trackIndex + s) % N;
        const pt = this.getTokenCoordinates({ state: 'TRACK', trackIndex: tIdx }, player);
        if (pt) waypoints.push(pt);
      }
      return waypoints;
    }

    if (move.action === 'ENTER_HOME_PATH' || move.action === 'ENTER_CENTER_HOME') {
      if (prevPos.state === 'TRACK') {
        const stepsToTurn = (player.config.turnIndex - prevPos.trackIndex + N) % N;
        for (let s = 1; s <= stepsToTurn; s++) {
          const tIdx = (prevPos.trackIndex + s) % N;
          const pt = this.getTokenCoordinates({ state: 'TRACK', trackIndex: tIdx }, player);
          if (pt) waypoints.push(pt);
        }

        const totalSteps = move.destination.stepsTraveled - prevPos.stepsTraveled;
        const stepsIntoHome = totalSteps - stepsToTurn;

        for (let h = 0; h < stepsIntoHome; h++) {
          if (h < cfg.homePathLength) {
            const pt = this.getTokenCoordinates({ state: 'HOME_PATH', homeStep: h }, player);
            if (pt) waypoints.push(pt);
          } else {
            const pt = this.getTokenCoordinates({ state: 'FINISHED' }, player);
            if (pt) waypoints.push(pt);
          }
        }
      } else if (prevPos.state === 'HOME_PATH') {
        const targetStep = move.destination.homeStep;
        for (let h = prevPos.homeStep + 1; h <= targetStep; h++) {
          if (h < cfg.homePathLength) {
            const pt = this.getTokenCoordinates({ state: 'HOME_PATH', homeStep: h }, player);
            if (pt) waypoints.push(pt);
          } else {
            const pt = this.getTokenCoordinates({ state: 'FINISHED' }, player);
            if (pt) waypoints.push(pt);
          }
        }
      }
      return waypoints;
    }

    if (move.action === 'MOVE_HOME_PATH') {
      const targetStep = move.destination.homeStep;
      for (let h = prevPos.homeStep + 1; h <= targetStep; h++) {
        const pt = this.getTokenCoordinates({ state: 'HOME_PATH', homeStep: h }, player);
        if (pt) waypoints.push(pt);
      }
      return waypoints;
    }

    return waypoints;
  }

  async animateTokenHop(player, token, prevPos, move, victimToken) {
    const waypoints = this.calculateWaypoints(player, prevPos, move);
    if (!waypoints || waypoints.length === 0) {
      this.renderBoard();
      return;
    }

    // User requested: "gota dice hota dikna chye jada fast h intna slow karo ki dek ja"
    const hopStepTime = 420; // ms per tile step (smooth GPU physical transition)
    const stepPause = 90;    // brief pause on landing for crisp observation
    const pawnScale = this.game.boardType === 4 ? 1.25 : 1.05;
    const c = player.config;
    const colorKey = player.colorKey;

    // Temporary hopping token placed on SVG root
    const hopG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hopG.setAttribute('class', 'token-group hopping-active');
    hopG.style.pointerEvents = 'none';

    // Step counter badge (+roll) above hopping token
    const rollBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rollBadge.setAttribute('transform', 'translate(0, -42)');
    rollBadge.innerHTML = `
      <rect x="-26" y="-12" width="52" height="24" rx="12" fill="#f59e0b" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
      <text id="hop-step-text" text-anchor="middle" dy="0.35em" font-size="12" font-weight="900" fill="#0f172a">+${this.game.currentRoll}</text>
    `;
    hopG.appendChild(rollBadge);

    // Inner 3D Star Goti Element (matches user's reference image!)
    const pawnInner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pawnInner.setAttribute('class', 'pawn-hop-inner');

    pawnInner.innerHTML = `
      <!-- Contact Shadow -->
      <ellipse cx="0" cy="5" rx="20" ry="14" fill="rgba(0, 0, 0, 0.4)" filter="url(#shadow)"/>

      <!-- Outer 3D Rim -->
      <circle cx="0" cy="1" r="19" fill="${c.darkHex || '#000'}" filter="url(#pawn-shadow)"/>

      <!-- Colored Glossy Body -->
      <circle cx="0" cy="0" r="18" fill="url(#token-body-${colorKey})"/>
      <circle cx="0" cy="0" r="17.5" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>

      <!-- Inner Recessed Ring -->
      <circle cx="0" cy="-0.5" r="13" fill="${c.darkHex || '#000'}" opacity="0.6"/>
      <circle cx="0" cy="-1.5" r="12" fill="url(#token-head-${colorKey})"/>
      <circle cx="0" cy="-1.5" r="11.5" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.8"/>

      <!-- Specular Highlight Arc -->
      <path d="M -11 -7 A 14 14 0 0 1 11 -7" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>

      <!-- Central Embossed Star ⭐ -->
      <polygon points="0,-7 2.2,-2.2 7,-2.2 3.2,0.8 4.6,5.5 0,2.5 -4.6,5.5 -3.2,0.8 -7,-2.2 -2.2,-2.2"
               fill="#ffffff" stroke="${c.darkHex || '#000'}" stroke-width="0.8" filter="url(#shadow)"/>
      <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
    `;
    hopG.appendChild(pawnInner);

    // Hide original token during hopping
    this.renderBoard();
    const origTokenEl = this.svg.querySelector(`[data-token-id="${token.id}"][data-player-id="${player.id}"]`);
    if (origTokenEl) origTokenEl.style.opacity = '0';

    this.svg.appendChild(hopG);

    // Initial position without transition
    const startCoord = this.getTokenCoordinates(prevPos, player) || waypoints[0];
    hopG.style.transition = 'none';
    hopG.setAttribute('transform', `translate(${startCoord.x}, ${startCoord.y}) scale(${pawnScale})`);
    void hopG.getBoundingClientRect(); // flush styles

    // Enable smooth physical transition for tile-by-tile leaping
    hopG.style.transition = `transform ${hopStepTime}ms cubic-bezier(0.25, 0.9, 0.35, 1)`;

    const stepTextEl = rollBadge.querySelector('#hop-step-text');

    // Hop sequentially through each waypoint with visible slow step animation!
    for (let i = 0; i < waypoints.length; i++) {
      const pt = waypoints[i];
      const remainingSteps = waypoints.length - i;
      if (stepTextEl) {
        stepTextEl.textContent = `+${remainingSteps}`;
      }

      // Smooth Jump Arc
      pawnInner.classList.remove('jump-arc');
      void pawnInner.getBoundingClientRect();
      pawnInner.classList.add('jump-arc');

      // Physically animate to the next tile
      hopG.setAttribute('transform', `translate(${pt.x}, ${pt.y}) scale(${pawnScale})`);

      if (window.soundEngine) {
        setTimeout(() => window.soundEngine.playTokenStep(), Math.round(hopStepTime * 0.45));
      }

      await new Promise((r) => setTimeout(r, hopStepTime + stepPause));
      pawnInner.classList.remove('jump-arc');
    }

    hopG.remove();

    if (victimToken) {
      if (window.soundEngine) window.soundEngine.playTokenKill();
      this.spawnConfetti(35);
      const board = document.getElementById('ludo-board');
      board?.classList.add('screen-shake');
      setTimeout(() => board?.classList.remove('screen-shake'), 350);
    }

    this.renderBoard();
  }

  /* ----------------------------------------------------
     3D STAR GOTI (TOKEN) RENDERING
     Exact match to the User's Uploaded Reference Image!
  ---------------------------------------------------- */
  renderTokens() {
    let tokenLayer = this.svg.querySelector('#token-layer');
    if (!tokenLayer) {
      tokenLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tokenLayer.setAttribute('id', 'token-layer');
      this.svg.appendChild(tokenLayer);
    }
    tokenLayer.innerHTML = '';

    const currentPlayer = this.game.getCurrentPlayer();
    const isPlayerTurn = currentPlayer && !currentPlayer.isBot && this.game.turnState === 'WAITING_FOR_MOVE';
    const validTokenIds = isPlayerTurn ? this.game.validMoves.map((m) => m.tokenId) : [];

    // Group tokens by physical tile location to handle multi-token stacking gracefully
    const tileOccupancy = new Map();

    this.game.players.forEach((player) => {
      player.tokens.forEach((token) => {
        const pos = this.getTokenCoordinates(token, player);
        if (!pos) return;

        const key = `${Math.round(pos.x)},${Math.round(pos.y)}`;
        if (!tileOccupancy.has(key)) {
          tileOccupancy.set(key, []);
        }
        tileOccupancy.get(key).push({ token, player, basePos: pos });
      });
    });

    // Render grouped tokens
    tileOccupancy.forEach((group) => {
      const count = group.length;
      group.forEach((item, idx) => {
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1.0;

        if (count === 2) {
          scale = 0.88;
          offsetX = idx === 0 ? -12 : 12;
          offsetY = idx === 0 ? -10 : 10;
        } else if (count >= 3) {
          scale = 0.76;
          const angle = (idx / count) * 2 * Math.PI;
          offsetX = Math.cos(angle) * 15;
          offsetY = Math.sin(angle) * 15;
        }

        const isMovable = isPlayerTurn && this.game.validMoves.some((m) =>
          (m.targetPlayerId !== undefined ? m.targetPlayerId === item.player.id : item.player.id === currentPlayer.id) &&
          m.tokenId === item.token.id
        );

        this.renderSingleToken(
          tokenLayer,
          item.token,
          item.player,
          item.basePos.x + offsetX,
          item.basePos.y + offsetY,
          scale,
          isMovable
        );
      });
    });
  }

  renderSingleToken(container, token, player, x, y, scale = 1.0, isMovable = false) {
    const currentPlayer = this.game.getCurrentPlayer();
    const pawnScale = (this.game.boardType === 4 ? 1.18 : 0.96) * scale;
    const c = player.config;
    const colorKey = player.colorKey;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `token-group ${isMovable ? 'movable' : ''}`);
    g.setAttribute('data-token-id', token.id);
    g.setAttribute('data-player-id', player.id);
    g.setAttribute('transform', `translate(${x}, ${y}) scale(${pawnScale})`);

    const innerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    innerG.setAttribute('class', `pawn-container ${isMovable ? 'pawn-idle-bounce' : ''}`);

    innerG.innerHTML = `
      <!-- Generous Mobile Touch Hitbox (makes tapping effortlessly responsive on phones) -->
      <circle cx="0" cy="0" r="32" fill="rgba(0,0,0,0.001)" pointer-events="all"/>

      <!-- Pulsing Aura beneath goti when movable -->
      ${isMovable ? `
        <ellipse class="token-aura" cx="0" cy="4" rx="26" ry="18" fill="url(#gold-aura)"/>
        <ellipse cx="0" cy="4" rx="21" ry="14" fill="none" stroke="#fbbf24" stroke-width="2.6" opacity="0.95"/>
      ` : ''}

      <!-- Contact Shadow -->
      <ellipse cx="0" cy="4" rx="19" ry="13" fill="rgba(0, 0, 0, 0.35)" filter="url(#shadow)"/>

      <!-- Outer 3D Rim -->
      <circle cx="0" cy="1" r="18.5" fill="${c.darkHex || '#000'}" filter="url(#pawn-shadow)"/>

      <!-- Colored Glossy Body -->
      <circle cx="0" cy="0" r="17.5" fill="url(#token-body-${colorKey})"/>
      <circle cx="0" cy="0" r="17" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>

      <!-- Inner Recessed Step -->
      <circle cx="0" cy="-0.5" r="12.5" fill="${c.darkHex || '#000'}" opacity="0.6"/>
      <circle cx="0" cy="-1.5" r="11.5" fill="url(#token-head-${colorKey})"/>
      <circle cx="0" cy="-1.5" r="11" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.8"/>

      <!-- Specular Highlight Arc -->
      <path d="M -10 -7 A 13 13 0 0 1 10 -7" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.8"/>

      <!-- Central Embossed Star ⭐ (Exact match to reference image!) -->
      <polygon points="0,-7 2.2,-2.2 7,-2.2 3.2,0.8 4.6,5.5 0,2.5 -4.6,5.5 -3.2,0.8 -7,-2.2 -2.2,-2.2"
               fill="#ffffff" stroke="${c.darkHex || '#000'}" stroke-width="0.8" filter="url(#shadow)"/>
      <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
    `;

    g.appendChild(innerG);

    // Touch & Click handler
    if (isMovable) {
      g.style.cursor = 'pointer';
      let lastTrigger = 0;
      const handleTap = (e) => {
        const now = Date.now();
        if (now - lastTrigger < 350) return;
        lastTrigger = now;

        e.preventDefault();
        e.stopPropagation();
        if (window.soundEngine) window.soundEngine.playTokenStep();
        this.game.moveToken(token.id, player.id);
      };
      g.addEventListener('touchstart', handleTap, { passive: false });
      g.addEventListener('click', handleTap);
    } else if (token.state === 'BASE' && (player.id === currentPlayer?.id || (this.game.teamMode && player.teamId === currentPlayer?.teamId))) {
      // Feedback when user tries to tap base token without rolling 6
      g.style.cursor = 'not-allowed';
      const handleBlockedTap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.soundEngine) window.soundEngine.playError();
        if (window.uiController) {
          window.uiController.showToast(
            window.uiController.lang === 'hi' ? '⚠️ गोटी सिर्फ 6 आने पर खुलती है!' : '⚠️ Token opens ONLY on rolling 6!',
            'warning'
          );
          window.uiController.vibrate([30, 20, 30]);
        }
      };
      g.addEventListener('touchstart', handleBlockedTap, { passive: false });
      g.addEventListener('click', handleBlockedTap);
    }

    container.appendChild(g);
  }

  // Calculate Cartesian (x, y) coordinates for any token state
  getTokenCoordinates(token, player) {
    const is4P = this.game.boardType === 4;
    const cfg = this.game.boardConfig;
    const S = is4P ? 1000 / 15 : 1;

    if (token.state === 'BASE') {
      const slot = player.config.baseSlots[token.baseSlotIndex];
      if (is4P) {
        return { x: slot.c * S, y: slot.r * S };
      } else {
        return { x: slot.x, y: slot.y };
      }
    }

    if (token.state === 'TRACK') {
      const pt = cfg.outerTiles[token.trackIndex];
      if (!pt) return null;
      if (is4P) {
        return { x: pt.c * S + S / 2, y: pt.r * S + S / 2 };
      } else {
        return { x: pt.x, y: pt.y };
      }
    }

    if (token.state === 'HOME_PATH') {
      const pt = player.config.homePath[token.homeStep];
      if (!pt) return null;
      if (is4P) {
        return { x: pt.c * S + S / 2, y: pt.r * S + S / 2 };
      } else {
        return { x: pt.x, y: pt.y };
      }
    }

    if (token.state === 'FINISHED') {
      const pt = player.config.centerHome;
      if (!pt) return null;
      const angle = (token.id * 90) * (Math.PI / 180);
      const offset = is4P ? S * 0.28 : 22;
      const cx = is4P ? pt.c * S : pt.x;
      const cy = is4P ? pt.r * S : pt.y;
      return {
        x: cx + Math.cos(angle) * offset,
        y: cy + Math.sin(angle) * offset
      };
    }

    return null;
  }

  /* ----------------------------------------------------
     PARTICLE & CONFETTI ENGINE
  ---------------------------------------------------- */
  spawnConfetti(count = 70) {
    if (!this.canvas) return;
    const colors = ['#0072bc', '#e52521', '#00a651', '#fdb813', '#9333ea', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 15,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  startParticleLoop() {
    const loop = () => {
      if (this.ctx && this.particles.length > 0) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45;
          p.rotation += p.vr;
          p.life -= p.decay;

          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = p.life;
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.ctx.restore();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

if (typeof window !== 'undefined') {
  window.BoardRenderer = BoardRenderer;
}
