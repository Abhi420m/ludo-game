/**
 * Ludo Board & Token SVG Renderer - Authentic Ludo King 3D Style
 * Supports both 4-Player Square Board and 6-Player Hexagon Board.
 * Features:
 * - Authentic 3D Ludo King Pawns (Sphere Head + Golden Collar + Bell Body + Pedestal Base)
 * - Animated Idle Bobbing & Golden Aura for movable tokens
 * - Step-by-step Fast Hopping Animation with +roll indicator
 * - Safe Star Tiles & Directional Start Arrows
 * - Home Gate Lock/Unlock (🔒/🔓) Indicators for traditional kill rule
 * - Corner Dice with single-tap roll support
 * - Confetti celebrations & screen shake
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

      <!-- Golden neck collar gradient (Ludo King Signature) -->
      <linearGradient id="gold-ring" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="35%" stop-color="#f59e0b"/>
        <stop offset="70%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>

      <!-- Golden aura for movable pawns -->
      <radialGradient id="gold-aura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.85"/>
        <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>

      <!-- Star Graphic Template -->
      <g id="star-icon">
        <polygon points="0,-13 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4"
                 fill="#f59e0b" stroke="#92400e" stroke-width="1.6" filter="url(#shadow)"/>
        <circle cx="0" cy="1" r="2.5" fill="#fef08a"/>
      </g>

      <!-- Directional Track Arrows (Ludo King Start Tiles) -->
      <g id="arrow-up">
        <path d="M 0,-14 L 11,2 L 4,2 L 4,12 L -4,12 L -4,2 L -11,2 Z" fill="#ffffff" opacity="0.9" filter="url(#shadow)"/>
      </g>
      <g id="arrow-down">
        <path d="M 0,14 L 11,-2 L 4,-2 L 4,-12 L -4,-12 L -4,-2 L -11,-2 Z" fill="#ffffff" opacity="0.9" filter="url(#shadow)"/>
      </g>
      <g id="arrow-right">
        <path d="M 14,0 L -2,-11 L -2,-4 L -12,-4 L -12,4 L -2,4 L -2,11 Z" fill="#ffffff" opacity="0.9" filter="url(#shadow)"/>
      </g>
      <g id="arrow-left">
        <path d="M -14,0 L 2,-11 L 2,-4 L 12,-4 L 12,4 L 2,4 L 2,11 Z" fill="#ffffff" opacity="0.9" filter="url(#shadow)"/>
      </g>
    `;

    // 3D Gradients for all player colors
    const allColors = {
      red: { hex: '#e52521', lightHex: '#ff7b78', darkHex: '#8b0e0c' },
      green: { hex: '#00a651', lightHex: '#52d98c', darkHex: '#005c2d' },
      yellow: { hex: '#fdb813', lightHex: '#fef08a', darkHex: '#996a00' },
      blue: { hex: '#0072bc', lightHex: '#60a5fa', darkHex: '#003e6b' },
      purple: { hex: '#9333ea', lightHex: '#c084fc', darkHex: '#581c87' },
      orange: { hex: '#ea580c', lightHex: '#fdba74', darkHex: '#9a3412' }
    };

    Object.keys(allColors).forEach((key) => {
      const c = allColors[key];

      // 1. Head Radial Gradient (3D Sphere shine)
      const gradHead = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradHead.setAttribute('id', `pawn-head-${key}`);
      gradHead.setAttribute('cx', '32%');
      gradHead.setAttribute('cy', '30%');
      gradHead.setAttribute('r', '68%');
      gradHead.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="42%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradHead);

      // 2. Body Linear Gradient (Cylindrical shine)
      const gradBody = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradBody.setAttribute('id', `pawn-body-${key}`);
      gradBody.setAttribute('x1', '0%');
      gradBody.setAttribute('y1', '0%');
      gradBody.setAttribute('x2', '100%');
      gradBody.setAttribute('y2', '0%');
      gradBody.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="30%" stop-color="${c.hex}"/>
        <stop offset="75%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradBody);

      // 3. Base Pedestal Linear Gradient
      const gradBase = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradBase.setAttribute('id', `pawn-base-${key}`);
      gradBase.setAttribute('x1', '0%');
      gradBase.setAttribute('y1', '0%');
      gradBase.setAttribute('x2', '0%');
      gradBase.setAttribute('y2', '100%');
      gradBase.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="35%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradBase);

      // 4. Legacy compatibility gradient
      const gradLegacy = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradLegacy.setAttribute('id', `grad-${key}`);
      gradLegacy.setAttribute('cx', '35%');
      gradLegacy.setAttribute('cy', '35%');
      gradLegacy.setAttribute('r', '70%');
      gradLegacy.innerHTML = `
        <stop offset="0%" stop-color="${c.lightHex}"/>
        <stop offset="60%" stop-color="${c.hex}"/>
        <stop offset="100%" stop-color="${c.darkHex}"/>
      `;
      defs.appendChild(gradLegacy);
    });

    this.svg.appendChild(defs);
  }

  /* ----------------------------------------------------
     4-PLAYER BOARD RENDERING (Ludo King Classic)
  ---------------------------------------------------- */
  renderBoard4() {
    const S = 1000 / 15; // 66.666px
    const cfg = this.game.boardConfig;

    const boardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boardGroup.setAttribute('id', 'board-layer');

    // 1. Board Background (Clean Ivory Canvas with Subtle Border)
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '1000');
    bg.setAttribute('height', '1000');
    bg.setAttribute('fill', '#fcfbf7');
    bg.setAttribute('rx', '22');
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

      // Base colored card
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', 6 * S);
      rect.setAttribute('height', 6 * S);
      rect.setAttribute('fill', c.hex);
      rect.setAttribute('stroke', '#0f172a');
      rect.setAttribute('stroke-width', '2.5');
      rect.setAttribute('rx', '18');
      g.appendChild(rect);

      // Inner white card
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      inner.setAttribute('x', x + 0.7 * S);
      inner.setAttribute('y', y + 0.7 * S);
      inner.setAttribute('width', 4.6 * S);
      inner.setAttribute('height', 4.6 * S);
      inner.setAttribute('fill', '#ffffff');
      inner.setAttribute('rx', '22');
      inner.setAttribute('filter', 'url(#shadow)');
      g.appendChild(inner);

      // 4 Token sockets (Recessed colored circular trays)
      c.baseSlots.forEach((slot) => {
        const sx = slot.c * S;
        const sy = slot.r * S;

        // Outer socket rim
        const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerCircle.setAttribute('cx', sx);
        outerCircle.setAttribute('cy', sy);
        outerCircle.setAttribute('r', S * 0.44);
        outerCircle.setAttribute('fill', c.hex);
        outerCircle.setAttribute('stroke', '#cbd5e1');
        outerCircle.setAttribute('stroke-width', '2');
        outerCircle.setAttribute('filter', 'url(#shadow)');
        g.appendChild(outerCircle);

        // Inner socket well
        const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerCircle.setAttribute('cx', sx);
        innerCircle.setAttribute('cy', sy);
        innerCircle.setAttribute('r', S * 0.35);
        innerCircle.setAttribute('fill', '#ffffff');
        innerCircle.setAttribute('opacity', '0.9');
        g.appendChild(innerCircle);

        // Center dot
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', sx);
        dot.setAttribute('cy', sy);
        dot.setAttribute('r', S * 0.16);
        dot.setAttribute('fill', c.hex);
        g.appendChild(dot);
      });

      boardGroup.appendChild(g);
    });

    // 3. Track Cells (52 Outer Cells)
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
      let startColor = null;
      let startArrowDir = null;

      Object.keys(cfg.colors).forEach((k) => {
        if (cfg.colors[k].startIndex === idx) {
          cellFill = cfg.colors[k].hex;
          startColor = cfg.colors[k];
          startArrowDir = cfg.colors[k].startArrow;
        }
      });

      rect.setAttribute('fill', cellFill);
      rect.setAttribute('stroke', '#cbd5e1');
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      // Start Tile Arrow (Ludo King signature)
      if (startArrowDir) {
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        arrow.setAttribute('href', `#arrow-${startArrowDir}`);
        arrow.setAttribute('x', x + S / 2);
        arrow.setAttribute('y', y + S / 2);
        g.appendChild(arrow);
      }

      // Star Safe Tile icon
      if (cfg.starTiles.includes(idx)) {
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
        rect.setAttribute('stroke-width', '1.8');
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

    // Center Gold Crown Emblem
    const crown = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    crown.setAttribute('cx', midX);
    crown.setAttribute('cy', midY);
    crown.setAttribute('r', S * 0.46);
    crown.setAttribute('fill', '#f59e0b');
    crown.setAttribute('stroke', '#ffffff');
    crown.setAttribute('stroke-width', '3');
    crown.setAttribute('filter', 'url(#shadow)');
    centerGroup.appendChild(crown);

    const crownStar = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    crownStar.setAttribute('href', '#star-icon');
    crownStar.setAttribute('x', midX);
    crownStar.setAttribute('y', midY);
    crownStar.setAttribute('transform', `scale(0.85) translate(${midX * 0.17}, ${midY * 0.17})`);
    centerGroup.appendChild(crownStar);

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
    hexBg.setAttribute('fill', '#0f172a');
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
    innerHex.setAttribute('fill', '#fcfbf7');
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
        star.setAttribute('href', '#star-icon');
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

    const centerStar = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    centerStar.setAttribute('href', '#star-icon');
    centerStar.setAttribute('x', '500');
    centerStar.setAttribute('y', '500');
    centerStar.setAttribute('transform', 'scale(1.4) translate(-140, -140)');
    centerGroup.appendChild(centerStar);

    boardGroup.appendChild(centerGroup);

    // 6. Home Gate Locks
    this.renderHomeGateLocks6(boardGroup);

    // 7. Corner Dice
    this.renderCornerDice6(boardGroup);

    this.svg.appendChild(boardGroup);
  }

  /* ----------------------------------------------------
     HOME GATE LOCK INDICATORS (Special Kill Rule Visual)
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
  drawDicePips(svgGroup, value, size = 50) {
    const offset = size * 0.25;
    const r = size * 0.09;

    const pips = [];
    if (value === 1) {
      pips.push({ x: 0, y: 0, color: '#e52521', r: r * 1.35 });
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
      green: { x: 3 * S, y: 3 * S },
      yellow: { x: 12 * S, y: 3 * S },
      red: { x: 3 * S, y: 12 * S },
      blue: { x: 12 * S, y: 12 * S }
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
        aura.setAttribute('x', '-34');
        aura.setAttribute('y', '-34');
        aura.setAttribute('width', '68');
        aura.setAttribute('height', '68');
        aura.setAttribute('rx', '18');
        aura.setAttribute('fill', player.config.hex);
        aura.setAttribute('opacity', '0.45');
        g.appendChild(aura);
      }

      // 3D Dice Box
      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('x', '-25');
      box.setAttribute('y', '-25');
      box.setAttribute('width', '50');
      box.setAttribute('height', '50');
      box.setAttribute('rx', '13');
      box.setAttribute('fill', '#ffffff');
      box.setAttribute('stroke', isTurn ? player.config.hex : '#94a3b8');
      box.setAttribute('stroke-width', isTurn ? '3.5' : '1.5');
      box.setAttribute('filter', 'url(#pawn-shadow)');
      g.appendChild(box);

      // Draw Pips
      this.drawDicePips(g, diceVal, 50);

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
      box.setAttribute('filter', 'url(#pawn-shadow)');
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

    const hopDuration = 100; // ms per hop (fast, snappy, real ludo app speed)
    const pawnScale = this.game.boardType === 4 ? 1.25 : 1.05;
    const c = player.config;
    const colorKey = player.colorKey;

    // Temporary hopping token group placed on top layer
    const hopG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hopG.setAttribute('class', 'token-group hopping-active');
    hopG.style.pointerEvents = 'none';

    // Step counter badge (+roll) above hopping pawn
    const rollBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rollBadge.setAttribute('transform', 'translate(0, -42)');
    rollBadge.innerHTML = `
      <rect x="-24" y="-11" width="48" height="22" rx="11" fill="#f59e0b" stroke="#ffffff" stroke-width="1.8" filter="url(#shadow)"/>
      <text text-anchor="middle" dy="0.35em" font-size="12" font-weight="900" fill="#0f172a">+${this.game.currentRoll}</text>
    `;
    hopG.appendChild(rollBadge);

    // Inner 3D pawn element that animates the hop arc
    const pawnInner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pawnInner.setAttribute('class', 'pawn-hop-inner');
    pawnInner.setAttribute('transform', `scale(${pawnScale})`);

    pawnInner.innerHTML = `
      <ellipse cx="0" cy="14" rx="16" ry="6" fill="rgba(0,0,0,0.38)" filter="url(#shadow)"/>
      <ellipse cx="0" cy="12" rx="14" ry="4.8" fill="${c.darkHex || '#000'}"/>
      <path d="M -14 12 C -14 7, -9 5, -6 4 L 6 4 C 9 5, 14 7, 14 12 C 14 15, 9 16, 0 16 C -9 16, -14 15, -14 12 Z" fill="url(#pawn-base-${colorKey})"/>
      <ellipse cx="0" cy="11.2" rx="13.2" ry="4" fill="${c.lightHex || '#fff'}" opacity="0.35"/>
      <ellipse cx="0" cy="6" rx="8.5" ry="2.6" fill="${c.lightHex || '#fff'}" opacity="0.65"/>
      <path d="M -6.5 4 C -7.5 -3, -4.5 -10, -3.5 -12 L 3.5 -12 C 4.5 -10, 7.5 -3, 6.5 4 Z" fill="url(#pawn-body-${colorKey})"/>
      <path d="M -4 2 C -5 -2, -3 -8, -2 -11" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>
      <ellipse cx="0" cy="-12" rx="5" ry="1.8" fill="url(#gold-ring)" stroke="#92400e" stroke-width="0.8"/>
      <circle cx="0" cy="-20" r="8.8" fill="url(#pawn-head-${colorKey})" filter="url(#pawn-shadow)"/>
      <ellipse cx="-2.8" cy="-22.8" rx="3.6" ry="2.2" fill="#ffffff" opacity="0.88" transform="rotate(-25 -2.8 -22.8)"/>
      <circle cx="3.2" cy="-16.8" r="1.3" fill="#ffffff" opacity="0.45"/>
    `;
    hopG.appendChild(pawnInner);

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

      // Hop arc animation on the inner group!
      pawnInner.classList.add('jump-arc');
      await new Promise((r) => setTimeout(r, hopDuration));
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
     AUTHENTIC LUDO KING 3D PAWN RENDERING & MULTI-STACKING
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

    // Render grouped tokens with dynamic offset
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
    const currentPlayer = this.game.getCurrentPlayer();
    const pawnScale = (this.game.boardType === 4 ? 1.18 : 0.96) * scale;
    const c = player.config;
    const colorKey = player.colorKey;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `token-group ${isMovable ? 'movable' : ''}`);
    g.setAttribute('data-token-id', token.id);
    g.setAttribute('data-player-id', player.id);
    g.setAttribute('transform', `translate(${x}, ${y})`);

    const innerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    innerG.setAttribute('class', `pawn-container ${isMovable ? 'pawn-idle-bounce' : ''}`);
    innerG.setAttribute('transform', `scale(${pawnScale})`);

    innerG.innerHTML = `
      <!-- Pulsing Aura beneath pawn when movable (Ludo King Signature) -->
      ${isMovable ? `
        <ellipse class="token-aura" cx="0" cy="14" rx="22" ry="9" fill="url(#gold-aura)"/>
        <ellipse cx="0" cy="14" rx="16" ry="6.5" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.9"/>
      ` : ''}

      <!-- Ground Contact Shadow -->
      <ellipse cx="0" cy="14" rx="15" ry="5.5" fill="rgba(0, 0, 0, 0.35)" filter="url(#shadow)"/>

      <!-- Base Pedestal (3D Stepped Disc) -->
      <ellipse cx="0" cy="12" rx="14" ry="4.8" fill="${c.darkHex || '#000'}"/>
      <path d="M -14 12 C -14 7, -9 5, -6 4 L 6 4 C 9 5, 14 7, 14 12 C 14 15, 9 16, 0 16 C -9 16, -14 15, -14 12 Z" fill="url(#pawn-base-${colorKey})"/>
      <ellipse cx="0" cy="11.2" rx="13.2" ry="4" fill="${c.lightHex || '#fff'}" opacity="0.35"/>
      <ellipse cx="0" cy="6" rx="8.5" ry="2.6" fill="${c.lightHex || '#fff'}" opacity="0.65"/>

      <!-- Flared Bell / Conical Body -->
      <path d="M -6.5 4 C -7.5 -3, -4.5 -10, -3.5 -12 L 3.5 -12 C 4.5 -10, 7.5 -3, 6.5 4 Z" fill="url(#pawn-body-${colorKey})"/>
      <!-- Body 3D Specular Highlight Curve -->
      <path d="M -4 2 C -5 -2, -3 -8, -2 -11" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>

      <!-- Golden Neck Ring Collar (Ludo King Signature) -->
      <ellipse cx="0" cy="-12" rx="5" ry="1.8" fill="url(#gold-ring)" stroke="#92400e" stroke-width="0.8"/>

      <!-- Head Sphere (Spherical 3D Ball) -->
      <circle cx="0" cy="-20" r="8.8" fill="url(#pawn-head-${colorKey})" filter="url(#pawn-shadow)"/>
      <!-- Head 3D Gloss / Light Reflection (Ludo King Look) -->
      <ellipse cx="-2.8" cy="-22.8" rx="3.6" ry="2.2" fill="#ffffff" opacity="0.88" transform="rotate(-25 -2.8 -22.8)"/>
      <circle cx="3.2" cy="-16.8" r="1.3" fill="#ffffff" opacity="0.45"/>
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
        this.game.moveToken(token.id);
      };
      g.addEventListener('touchstart', handleTap, { passive: false });
      g.addEventListener('click', handleTap);
    } else if (token.state === 'BASE' && player.id === currentPlayer?.id) {
      // Feedback when user tries to tap base pawn without rolling 6
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
    const colors = ['#e52521', '#00a651', '#fdb813', '#0072bc', '#9333ea', '#ea580c', '#ffffff'];
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
          p.vy += 0.45; // Gravity
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
