/**
 * 6-Player Hexagonal Ludo Board Geometry & Layout Specification
 * Dynamic polar-to-Cartesian coordinate system (ViewBox: 1000 x 1000)
 */

(function() {
  const CX = 500;
  const CY = 500;

  // 6 Colors configuration
  const COLOR_KEYS = ['red', 'green', 'yellow', 'blue', 'purple', 'orange'];
  const COLOR_DATA = {
    red: {
      name: 'Red',
      hindiName: 'लाल (Red)',
      hex: '#ef4444',
      lightHex: '#fee2e2',
      darkHex: '#b91c1c'
    },
    green: {
      name: 'Green',
      hindiName: 'हरा (Green)',
      hex: '#10b981',
      lightHex: '#d1fae5',
      darkHex: '#047857'
    },
    yellow: {
      name: 'Yellow',
      hindiName: 'पीला (Yellow)',
      hex: '#f59e0b',
      lightHex: '#fef3c7',
      darkHex: '#b45309'
    },
    blue: {
      name: 'Blue',
      hindiName: 'नीला (Blue)',
      hex: '#3b82f6',
      lightHex: '#dbeafe',
      darkHex: '#1d4ed8'
    },
    purple: {
      name: 'Purple',
      hindiName: 'बैंगनी (Purple)',
      hex: '#a855f7',
      lightHex: '#f3e8ff',
      darkHex: '#7e22ce'
    },
    orange: {
      name: 'Orange',
      hindiName: 'नारंगी (Orange)',
      hex: '#f97316',
      lightHex: '#ffedd5',
      darkHex: '#c2410c'
    }
  };

  // Helper to convert polar coords (radius, degrees) to (x, y)
  function polarToCart(r, deg) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: Math.round((CX + r * Math.cos(rad)) * 10) / 10,
      y: Math.round((CY + r * Math.sin(rad)) * 10) / 10
    };
  }

  // 6 Sectors at 60 degree intervals (starting from South = 90 deg)
  // Arm 0 (Red): 90° (South)
  // Arm 1 (Green): 150° (South-West)
  // Arm 2 (Yellow): 210° (North-West)
  // Arm 3 (Blue): 270° (North)
  // Arm 4 (Purple): 330° (North-East)
  // Arm 5 (Orange): 30° (South-East)
  const armAngles = [90, 150, 210, 270, 330, 30];

  // Each sector will have 12 outer tiles:
  // Tile 0..4: Arm entrance (incoming towards outer edge)
  // Tile 5: Outer corner transition
  // Tile 6: Outgoing start tile (Player Start)
  // Tile 7..11: Arm exit (moving towards next sector)
  // Total 12 * 6 = 72 outer tiles.
  const outerTiles = [];
  const colors = {};
  const safeTiles = [];
  const starTiles = [];

  const rInner = 145; // inner home ring
  const rOuter = 360; // outer track radius
  const stepR = (rOuter - rInner) / 5; // ~43px per step
  const angleSpread = 16; // width of arm in degrees
  const cornerSpread = 26; // outer corner turn spread

  for (let s = 0; s < 6; s++) {
    const centerDeg = armAngles[s];
    const leftDeg = centerDeg - angleSpread;
    const rightDeg = centerDeg + angleSpread;
    const cKey = COLOR_KEYS[s];

    // Sector start index in 72-tile array
    const sectorBaseIdx = s * 12;

    // Local 0..4: Incoming lane (from inner radius to outer radius along left lane)
    for (let i = 0; i < 5; i++) {
      const r = rInner + i * stepR;
      outerTiles.push(polarToCart(r, leftDeg));
    }

    // Local 5: Outer corner apex
    outerTiles.push(polarToCart(rOuter + 22, centerDeg - 6));

    // Local 6: Player Start tile (Safe)
    const startPt = polarToCart(rOuter, rightDeg);
    outerTiles.push(startPt);
    safeTiles.push(sectorBaseIdx + 6);

    // Local 7..10: Outgoing lane (from outer radius to inner radius along right lane)
    for (let i = 1; i <= 4; i++) {
      const r = rOuter - i * stepR;
      outerTiles.push(polarToCart(r, rightDeg));
    }

    // Local 11: Transition tile between sector s and sector s+1
    const nextSectorCenter = armAngles[(s + 1) % 6];
    const midAngle = (rightDeg + (nextSectorCenter - angleSpread)) / 2;
    outerTiles.push(polarToCart(rInner - 5, midAngle));

    // Star safe tile at local index 9 in each sector
    starTiles.push(sectorBaseIdx + 9);
    safeTiles.push(sectorBaseIdx + 9);

    // Color data for this sector
    const homePath = [];
    // 5 Home steps moving from rOuter-20 inwards to rInner along centerDeg
    for (let step = 1; step <= 5; step++) {
      const r = rOuter - step * (stepR * 0.95);
      homePath.push(polarToCart(r, centerDeg));
    }

    // Center home destination
    const centerHome = polarToCart(65, centerDeg);

    // Base slots (4 tokens waiting area at outer tip of sector)
    const rBase = 430;
    const baseSlots = [
      polarToCart(rBase, centerDeg - 14),
      polarToCart(rBase, centerDeg + 14),
      polarToCart(rBase + 34, centerDeg - 7),
      polarToCart(rBase + 34, centerDeg + 7)
    ];

    colors[cKey] = {
      ...COLOR_DATA[cKey],
      sectorIndex: s,
      armAngle: centerDeg,
      startIndex: sectorBaseIdx + 6,
      turnIndex: (sectorBaseIdx + 0) === 0 ? 71 : (sectorBaseIdx - 1), // Tile right before turning into home path
      homePath,
      centerHome,
      baseSlots,
      baseCenter: polarToCart(rBase + 15, centerDeg)
    };
  }

  // Adjust turnIndices:
  // For sector s, incoming track arrives at sectorBaseIdx + 0.
  // The tile right before entering home is:
  // For Red (s=0): tile 71.
  // For Green (s=1): tile 11.
  // For Yellow (s=2): tile 23.
  // For Blue (s=3): tile 35.
  // For Purple (s=4): tile 47.
  // For Orange (s=5): tile 59.
  for (let s = 0; s < 6; s++) {
    const cKey = COLOR_KEYS[s];
    colors[cKey].turnIndex = s === 0 ? 71 : (s * 12 - 1);
  }

  const BOARD_6_CONFIG = {
    type: 6,
    cx: CX,
    cy: CY,
    viewBox: '0 0 1000 1000',
    totalOuterTiles: 72,
    homePathLength: 5,
    colorKeys: COLOR_KEYS,
    colors,
    outerTiles,
    safeTiles,
    starTiles
  };

  window.BOARD_6_CONFIG = BOARD_6_CONFIG;
})();
