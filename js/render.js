/**
 * Ludo Board & Token SVG Renderer
 * Supports both 4-Player Square Board and 6-Player Hexagon Board.
 * Features:
 * - 3D-styled tokens with animated pulse aura
 * - Multi-token stacking on shared cells
 * - Interactive Corner Dice for Pass & Play (friends sitting together)
 * - Home Gate Lock/Unlock indicators for special kill rule
 * - Confetti celebrations and particle effects
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
      <!-- Drop shadows -->
      <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <filter id="token-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
      </filter>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <!-- Token Specular Gradient -->
      <radialGradient id="specular" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
        <stop offset="45%" stop-color="#ffffff" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
      </radialGradient>

      <!-- Star Graphic Template -->
      <g id="star-icon">
        <polygon points="0,-12 3.7,-3.7 12.6,-3.7 5.5,1.5 8.2,10.2 0,5 -8.2,10.2 -5.5,1.5 -12.6,-3.7 -3.7,-3.7"
                 fill="#f59e0b" stroke="#78350f" stroke-width="1.5" filter="url(#shadow)"/>
      </g>
    `;

    // Add color gradients for each player
    const allColors = { ...BOARD_4_CONFIG.colors, ...BOARD_6_CONFIG.colors };
    Object.keys(allColors).forEach((key) => {
      const c = allColors[key];
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      grad.setAttribute('id', `grad-${key}`);
      grad.setAttribute('cx', '35%');
      grad.setAttribute('cy', '35%');
      grad.setAttribute('r', '70%');
      grad.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex || '#ffffff'}"/>
        <stop offset="60%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex || '#000000'}"/>
      `;
      defs.appendChild(grad);
    });

    this.svg.appendChild(defs);
  }

  /* ----------------------------------------------------
     4-PLAYER BOARD RENDERING
  ---------------------------------------------------- */
  renderBoard4() {
    const S = 1000 / 15; // 66.666px
    const cfg = this.game.boardConfig;

    const boardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boardGroup.setAttribute('id', 'board-layer');

    // 1. Board Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '1000');
    bg.setAttribute('height', '1000');
    bg.setAttribute('fill', '#f8fafc');
    bg.setAttribute('rx', '24');
    boardGroup.appendChild(bg);

    // 2. Base Yards (4 corners)
    const bases = [
      { key: 'green', x: 0, y: 0 },
      { key: 'yellow', x: 9 * S, y: 0 },
      { key: 'red', x: 0, y: 9 * S },
      { key: 'blue', x: 9 * S, y: 9 * S }
    ];

    bases.forEach(({ key, x, y }) => {
      const c = cfg.colors[key];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Base rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', 6 * S);
      rect.setAttribute('height', 6 * S);
      rect.setAttribute('fill', c.hex);
      rect.setAttribute('stroke', '#0f172a');
      rect.setAttribute('stroke-width', '2');
      g.appendChild(rect);

      // Inner white card
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      inner.setAttribute('x', x + 0.8 * S);
      inner.setAttribute('y', y + 0.8 * S);
      inner.setAttribute('width', 4.4 * S);
      inner.setAttribute('height', 4.4 * S);
      inner.setAttribute('fill', '#ffffff');
      inner.setAttribute('rx', '18');
      inner.setAttribute('filter', 'url(#shadow)');
      g.appendChild(inner);

      // 4 Token circles
      c.baseSlots.forEach((slot) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', slot.c * S + S / 2);
        circle.setAttribute('cy', slot.r * S + S / 2);
        circle.setAttribute('r', S * 0.42);
        circle.setAttribute('fill', c.lightHex || '#f1f5f9');
        circle.setAttribute('stroke', c.hex);
        circle.setAttribute('stroke-width', '3');
        g.appendChild(circle);
      });

      boardGroup.appendChild(g);
    });

    // 3. Track Cells
    cfg.outerTiles.forEach((tile, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const x = tile.c * S;
      const y = tile.r * S;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', S);
      rect.setAttribute('height', S);

      // Check if start tile
      let cellFill = '#ffffff';
      Object.keys(cfg.colors).forEach((k) => {
        if (cfg.colors[k].startIndex === idx) {
          cellFill = cfg.colors[k].lightHex;
        }
      });

      rect.setAttribute('fill', cellFill);
      rect.setAttribute('stroke', '#cbd5e1');
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      // Star Safe Tile icon
      if (cfg.starTiles.includes(idx) || cfg.safeTiles.includes(idx)) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        star.setAttribute('href', '#star-icon');
        star.setAttribute('x', x + S / 2);
        star.setAttribute('y', y + S / 2);
        g.appendChild(star);
      }

      boardGroup.appendChild(g);
    });

    // 4. Colored Home Paths (5 cells each)
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

    // 5. Center Home 3x3 Triangles
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
      poly.setAttribute('stroke-width', '2');
      centerGroup.appendChild(poly);
    });

    // Center Gold Crown
    const crown = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    crown.setAttribute('cx', midX);
    crown.setAttribute('cy', midY);
    crown.setAttribute('r', S * 0.45);
    crown.setAttribute('fill', '#f59e0b');
    crown.setAttribute('stroke', '#ffffff');
    crown.setAttribute('stroke-width', '3');
    crown.setAttribute('filter', 'url(#shadow)');
    centerGroup.appendChild(crown);

    boardGroup.appendChild(centerGroup);

    // 6. Home Gate Lock Indicators (Special Kill Rule visual)
    this.renderHomeGateLocks(boardGroup, S);

    // 7. Interactive Corner Dice for Pass & Play (Friends sitting around phone)
    this.renderCornerDice4(boardGroup, S);

    this.svg.appendChild(boardGroup);
  }

  /* ----------------------------------------------------
     6-PLAYER HEXAGON BOARD RENDERING
  ---------------------------------------------------- */
  renderBoard6() {
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
    hexBg.setAttribute('fill', '#0f172a'); // Dark luxury board outline
    hexBg.setAttribute('stroke', '#334155');
    hexBg.setAttribute('stroke-width', '6');
    boardGroup.appendChild(hexBg);

    // Inner light polygon
    const innerHex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const innerPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * (Math.PI / 180);
      const x = 500 + 478 * Math.cos(angle);
      const y = 500 + 478 * Math.sin(angle);
      innerPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    innerHex.setAttribute('points', innerPoints.join(' '));
    innerHex.setAttribute('fill', '#f8fafc');
    boardGroup.appendChild(innerHex);

    // 2. Base Areas (6 corners)
    cfg.colorKeys.forEach((key) => {
      const c = cfg.colors[key];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Base card capsule
      const baseCapsule = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      baseCapsule.setAttribute('cx', c.baseCenter.x);
      baseCapsule.setAttribute('cy', c.baseCenter.y);
      baseCapsule.setAttribute('r', '52');
      baseCapsule.setAttribute('fill', c.hex);
      baseCapsule.setAttribute('stroke', '#ffffff');
      baseCapsule.setAttribute('stroke-width', '3');
      baseCapsule.setAttribute('filter', 'url(#shadow)');
      g.appendChild(baseCapsule);

      // Base slots for tokens
      c.baseSlots.forEach((slot) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', slot.x);
        circle.setAttribute('cy', slot.y);
        circle.setAttribute('r', '18');
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('stroke', c.darkHex);
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
          fill = cfg.colors[k].lightHex;
        }
      });

      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', '#94a3b8');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('filter', 'url(#shadow)');
      g.appendChild(circle);

      // Star Safe icon
      if (cfg.starTiles.includes(idx) || cfg.safeTiles.includes(idx)) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        star.setAttribute('href', '#star-icon');
        star.setAttribute('x', pt.x);
        star.setAttribute('y', pt.y);
        g.appendChild(star);
      }

      boardGroup.appendChild(g);
    });

    // 4. Home Paths (5 cells each)
    cfg.colorKeys.forEach((key) => {
      const c = cfg.colors[key];
      c.homePath.forEach((pt) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', c.hex);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('filter', 'url(#shadow)');
        boardGroup.appendChild(circle);
      });
    });

    // 5. Central Hexagon Home
    const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    cfg.colorKeys.forEach((key, i) => {
      const c = cfg.colors[key];
      const a1 = (i * 60) * (Math.PI / 180);
      const a2 = ((i + 1) * 60) * (Math.PI / 180);
      const x1 = 500 + 115 * Math.cos(a1);
      const y1 = 500 + 115 * Math.sin(a1);
      const x2 = 500 + 115 * Math.cos(a2);
      const y2 = 500 + 115 * Math.sin(a2);

      const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      wedge.setAttribute('points', `500,500 ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
      wedge.setAttribute('fill', c.hex);
      wedge.setAttribute('stroke', '#ffffff');
      wedge.setAttribute('stroke-width', '2');
      centerGroup.appendChild(wedge);
    });

    // Center Gold Medal
    const centerMedal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerMedal.setAttribute('cx', '500');
    centerMedal.setAttribute('cy', '500');
    centerMedal.setAttribute('r', '36');
    centerMedal.setAttribute('fill', '#f59e0b');
    centerMedal.setAttribute('stroke', '#ffffff');
    centerMedal.setAttribute('stroke-width', '3');
    centerMedal.setAttribute('filter', 'url(#shadow)');
    centerGroup.appendChild(centerMedal);

    boardGroup.appendChild(centerGroup);

    // 6. Home Gate Locks
    this.renderHomeGateLocks6(boardGroup);

    // 7. Interactive Corner Dice for 6-Player Pass & Play
    this.renderCornerDice6(boardGroup);

    this.svg.appendChild(boardGroup);
  }

  /* ----------------------------------------------------
     SPECIAL KILL RULE: HOME GATE LOCK INDICATORS
  ---------------------------------------------------- */
  renderHomeGateLocks(boardGroup, S) {
    if (!this.game.killRequired) return;

    this.game.players.forEach((player) => {
      const turnIdx = player.config.turnIndex;
      const turnTile = this.game.boardConfig.outerTiles[turnIdx];
      if (!turnTile) return;

      const x = turnTile.c * S + S / 2;
      const y = turnTile.r * S + S / 2;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'home-gate-lock');
      g.setAttribute('transform', `translate(${x}, ${y})`);

      const unlocked = player.hasKilledOpponent;
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

      const unlocked = player.hasKilledOpponent;
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
     INTERACTIVE CORNER DICE RENDERING (Pass & Play)
  ---------------------------------------------------- */
  drawDicePips(svgGroup, value, size = 52) {
    const offset = size * 0.25;
    const r = size * 0.09;

    const pips = [];
    if (value === 1) {
      pips.push({ x: 0, y: 0, color: '#ef4444', r: r * 1.35 });
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

  renderCornerDice4(boardGroup, S) {
    const currentPlayer = this.game.getCurrentPlayer();
    const cornerPositions = {
      green: { x: 2.8 * S + S / 2, y: 2.8 * S + S / 2 },
      yellow: { x: 11.8 * S + S / 2, y: 2.8 * S + S / 2 },
      red: { x: 2.8 * S + S / 2, y: 11.8 * S + S / 2 },
      blue: { x: 11.8 * S + S / 2, y: 11.8 * S + S / 2 }
    };

    this.game.players.forEach((player) => {
      const pos = cornerPositions[player.colorKey];
      if (!pos) return;

      const isTurn = currentPlayer && currentPlayer.id === player.id;
      const diceVal = (isTurn && this.game.currentRoll) ? this.game.currentRoll : 6;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `corner-dice ${isTurn ? 'active-turn' : ''}`);
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

      // Pulsing aura when it's this player's turn
      if (isTurn) {
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        aura.setAttribute('class', 'dice-aura');
        aura.setAttribute('x', '-35');
        aura.setAttribute('y', '-35');
        aura.setAttribute('width', '70');
        aura.setAttribute('height', '70');
        aura.setAttribute('rx', '18');
        aura.setAttribute('fill', player.config.hex);
        aura.setAttribute('opacity', '0.45');
        g.appendChild(aura);
      }

      // 3D Dice Box
      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('x', '-26');
      box.setAttribute('y', '-26');
      box.setAttribute('width', '52');
      box.setAttribute('height', '52');
      box.setAttribute('rx', '13');
      box.setAttribute('fill', '#ffffff');
      box.setAttribute('stroke', isTurn ? player.config.hex : '#94a3b8');
      box.setAttribute('stroke-width', isTurn ? '3.5' : '1.5');
      box.setAttribute('filter', 'url(#token-shadow)');
      g.appendChild(box);

      // Draw Pips
      this.drawDicePips(g, diceVal, 52);

      // "TAP" floating prompt badge
      if (isTurn && (this.game.turnState === 'WAITING_FOR_ROLL' || this.game.turnState === 'WAITING_FOR_MOVE')) {
        const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeG.setAttribute('transform', 'translate(0, -36)');
        badgeG.setAttribute('class', 'dice-tap-badge');

        const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badgeRect.setAttribute('x', '-30');
        badgeRect.setAttribute('y', '-11');
        badgeRect.setAttribute('width', '60');
        badgeRect.setAttribute('height', '22');
        badgeRect.setAttribute('rx', '11');
        badgeRect.setAttribute('fill', '#f59e0b');
        badgeRect.setAttribute('stroke', '#ffffff');
        badgeRect.setAttribute('stroke-width', '1.5');
        badgeG.appendChild(badgeRect);

        const badgeTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeTxt.setAttribute('text-anchor', 'middle');
        badgeTxt.setAttribute('dy', '0.35em');
        badgeTxt.setAttribute('font-size', '10');
        badgeTxt.setAttribute('font-weight', '900');
        badgeTxt.setAttribute('fill', '#0f172a');
        badgeTxt.textContent = this.game.turnState === 'WAITING_FOR_ROLL' ? '🎲 TAP' : '⏩ MOVE';
        badgeG.appendChild(badgeTxt);

        g.appendChild(badgeG);
      }

      // Tap Handler
      if (isTurn && !player.isBot) {
        g.style.cursor = 'pointer';
        let lastTap = 0;
        const handleCornerTap = (e) => {
          const now = Date.now();
          if (now - lastTap < 400) return;
          lastTap = now;

          e.preventDefault();
          e.stopPropagation();
          if (window.uiController) {
            window.uiController.triggerDiceRoll();
          }
        };

        g.addEventListener('touchstart', handleCornerTap, { passive: false });
        g.addEventListener('click', handleCornerTap);
      }

      boardGroup.appendChild(g);
    });
  }

  renderCornerDice6(boardGroup) {
    const cfg = this.game.boardConfig;
    const currentPlayer = this.game.getCurrentPlayer();

    this.game.players.forEach((player) => {
      const c = cfg.colors[player.colorKey];
      if (!c) return;

      const pos = c.baseCenter;
      const isTurn = currentPlayer && currentPlayer.id === player.id;
      const diceVal = (isTurn && this.game.currentRoll) ? this.game.currentRoll : 6;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `corner-dice ${isTurn ? 'active-turn' : ''}`);
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

      if (isTurn) {
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        aura.setAttribute('class', 'dice-aura');
        aura.setAttribute('x', '-28');
        aura.setAttribute('y', '-28');
        aura.setAttribute('width', '56');
        aura.setAttribute('height', '56');
        aura.setAttribute('rx', '14');
        aura.setAttribute('fill', player.config.hex);
        aura.setAttribute('opacity', '0.45');
        g.appendChild(aura);
      }

      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('x', '-22');
      box.setAttribute('y', '-22');
      box.setAttribute('width', '44');
      box.setAttribute('height', '44');
      box.setAttribute('rx', '10');
      box.setAttribute('fill', '#ffffff');
      box.setAttribute('stroke', isTurn ? player.config.hex : '#94a3b8');
      box.setAttribute('stroke-width', isTurn ? '3' : '1.5');
      box.setAttribute('filter', 'url(#token-shadow)');
      g.appendChild(box);

      this.drawDicePips(g, diceVal, 44);

      if (isTurn && (this.game.turnState === 'WAITING_FOR_ROLL' || this.game.turnState === 'WAITING_FOR_MOVE')) {
        const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeG.setAttribute('transform', 'translate(0, -32)');
        badgeG.setAttribute('class', 'dice-tap-badge');

        const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badgeRect.setAttribute('x', '-26');
        badgeRect.setAttribute('y', '-9');
        badgeRect.setAttribute('width', '52');
        badgeRect.setAttribute('height', '18');
        badgeRect.setAttribute('rx', '9');
        badgeRect.setAttribute('fill', '#f59e0b');
        badgeRect.setAttribute('stroke', '#ffffff');
        badgeRect.setAttribute('stroke-width', '1.5');
        badgeG.appendChild(badgeRect);

        const badgeTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeTxt.setAttribute('text-anchor', 'middle');
        badgeTxt.setAttribute('dy', '0.35em');
        badgeTxt.setAttribute('font-size', '9');
        badgeTxt.setAttribute('font-weight', '900');
        badgeTxt.setAttribute('fill', '#0f172a');
        badgeTxt.textContent = this.game.turnState === 'WAITING_FOR_ROLL' ? '🎲 TAP' : '⏩ MOVE';
        badgeG.appendChild(badgeTxt);

        g.appendChild(badgeG);
      }

      if (isTurn && !player.isBot) {
        g.style.cursor = 'pointer';
        let lastTap = 0;
        const handleCornerTap = (e) => {
          const now = Date.now();
          if (now - lastTap < 400) return;
          lastTap = now;

          e.preventDefault();
          e.stopPropagation();
          if (window.uiController) {
            window.uiController.triggerDiceRoll();
          }
        };

        g.addEventListener('touchstart', handleCornerTap, { passive: false });
        g.addEventListener('click', handleCornerTap);
      }

      boardGroup.appendChild(g);
    });
  }

  /* ----------------------------------------------------
     STEP-BY-STEP HOPPING ANIMATION ("Kon se goti chali ho")
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

    const hopDuration = 100; // ms per hop (fast, snappy, like real ludo apps!)
    const S = this.game.boardType === 4 ? 1000 / 15 : 44;
    const radius = this.game.boardType === 4 ? S * 0.42 : 24;

    // Temporary hopping token element placed on top layer
    const hopG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hopG.setAttribute('class', 'token-group hopping-active');
    hopG.style.pointerEvents = 'none';

    // Badge showing "+roll" above the hopping token
    const rollBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rollBadge.setAttribute('transform', 'translate(0, -32)');
    rollBadge.innerHTML = `
      <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
      <text text-anchor="middle" dy="0.35em" font-size="11" font-weight="900" fill="#0f172a">+${this.game.currentRoll}</text>
    `;
    hopG.appendChild(rollBadge);

    hopG.innerHTML += `
      <circle r="${radius * 1.6}" fill="${player.config.hex}" opacity="0.55" class="token-aura"/>
      <circle r="${radius}" fill="url(#grad-${player.colorKey})" stroke="#ffffff" stroke-width="3" filter="url(#token-shadow)"/>
      <circle r="${radius * 0.92}" fill="url(#specular)"/>
      <circle r="${radius * 0.38}" fill="#ffffff" opacity="0.95"/>
      <text text-anchor="middle" dy="0.35em" font-size="${radius * 0.6}" font-weight="bold" fill="${player.config.darkHex || '#000'}">${token.id + 1}</text>
    `;

    // Hide original token in static board render while hopping
    this.renderBoard();
    const origTokenEl = this.svg.querySelector(`[data-token-id="${token.id}"][data-player-id="${player.id}"]`);
    if (origTokenEl) origTokenEl.style.opacity = '0';

    this.svg.appendChild(hopG);

    // Initial position
    const startCoord = this.getTokenCoordinates(prevPos, player) || waypoints[0];
    hopG.setAttribute('transform', `translate(${startCoord.x}, ${startCoord.y})`);

    // Hop sequentially through all waypoints!
    for (let i = 0; i < waypoints.length; i++) {
      const pt = waypoints[i];
      hopG.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      if (window.soundEngine) window.soundEngine.playTokenStep();

      // Hop arc animation
      hopG.classList.add('jump-arc');
      await new Promise((r) => setTimeout(r, hopDuration));
      hopG.classList.remove('jump-arc');
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
     TOKEN RENDERING WITH 3D SHINE & MULTI-STACKING
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

    // Group tokens by their physical tile location to handle multi-token stacking!
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

    // Render grouped tokens with dynamic offset
    tileOccupancy.forEach((group) => {
      const count = group.length;
      group.forEach((item, idx) => {
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1.0;

        if (count === 2) {
          scale = 0.85;
          offsetX = idx === 0 ? -10 : 10;
          offsetY = idx === 0 ? -10 : 10;
        } else if (count >= 3) {
          scale = 0.72;
          const angle = (idx / count) * 2 * Math.PI;
          offsetX = Math.cos(angle) * 14;
          offsetY = Math.sin(angle) * 14;
        }

        const isMovable = item.player.id === currentPlayer?.id && validTokenIds.includes(item.token.id);

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
    const S = this.game.boardType === 4 ? 1000 / 15 : 44;
    const radius = (this.game.boardType === 4 ? S * 0.38 : 22) * scale;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `token-group ${isMovable ? 'movable' : ''}`);
    g.setAttribute('data-token-id', token.id);
    g.setAttribute('data-player-id', player.id);
    g.setAttribute('transform', `translate(${x}, ${y})`);

    // Movable pulsing aura
    if (isMovable) {
      const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      aura.setAttribute('class', 'token-aura');
      aura.setAttribute('r', radius * 1.55);
      aura.setAttribute('fill', player.config.hex);
      aura.setAttribute('opacity', '0.45');
      g.appendChild(aura);
    }

    // Outer Token Shadow & Body
    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outer.setAttribute('r', radius);
    outer.setAttribute('fill', `url(#grad-${player.colorKey})`);
    outer.setAttribute('stroke', '#ffffff');
    outer.setAttribute('stroke-width', radius > 18 ? '3' : '2');
    outer.setAttribute('filter', 'url(#token-shadow)');
    g.appendChild(outer);

    // 3D Specular Highlight
    const specular = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    specular.setAttribute('r', radius * 0.92);
    specular.setAttribute('fill', 'url(#specular)');
    g.appendChild(specular);

    // Inner Crest / Token Core Dot
    const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('r', radius * 0.38);
    core.setAttribute('fill', '#ffffff');
    core.setAttribute('opacity', '0.9');
    g.appendChild(core);

    // Token ID badge for easy distinction
    if (radius >= 16) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dy', '0.35em');
      txt.setAttribute('font-size', radius * 0.6);
      txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('fill', player.config.darkHex || '#000000');
      txt.textContent = `${token.id + 1}`;
      g.appendChild(txt);
    }

    // Touch & Click handler with double-tap prevention
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
        this.game.moveToken(token.id);
      };
      g.addEventListener('touchstart', handleTap, { passive: false });
      g.addEventListener('click', handleTap);
    } else if (token.state === 'BASE' && player.id === currentPlayer?.id) {
      // Feedback when user tries to tap base token without a 6!
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
        return { x: slot.c * S + S / 2, y: slot.r * S + S / 2 };
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
      // Stagger finished tokens inside center
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
    const colors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#ec4899', '#ffffff'];
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
        decay: Math.random() * 0.02 + 0.012
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
          p.vy += 0.45; // gravity
          p.rotation += p.vr;
          p.life -= p.decay;

          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.life;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.BoardRenderer = BoardRenderer;
