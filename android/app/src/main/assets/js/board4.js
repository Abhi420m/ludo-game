/**
 * 4-Player Classic Square Ludo Board Specification
 * Standard 15x15 Grid Layout
 */
const BOARD_4_CONFIG = {
  type: 4,
  gridSize: 15,
  totalOuterTiles: 52,
  homePathLength: 5, // 5 steps inside colored lane + 1 final home center

  // Colors definition
  colors: {
    red: {
      name: 'Red',
      hindiName: 'लाल (Red)',
      hex: '#ef4444',
      lightHex: '#fee2e2',
      darkHex: '#b91c1c',
      startIndex: 1,
      turnIndex: 0, // Last outer track tile before home turn
      homeDirection: 'right',
      baseArea: { rMin: 9, rMax: 14, cMin: 0, cMax: 5 },
      baseSlots: [
        { c: 1.8, r: 10.8 },
        { c: 3.8, r: 10.8 },
        { c: 1.8, r: 12.8 },
        { c: 3.8, r: 12.8 }
      ],
      homePath: [
        { c: 1, r: 7 },
        { c: 2, r: 7 },
        { c: 3, r: 7 },
        { c: 4, r: 7 },
        { c: 5, r: 7 }
      ],
      centerHome: { c: 6.2, r: 7 }
    },
    blue: {
      name: 'Blue',
      hindiName: 'नीला (Blue)',
      hex: '#3b82f6',
      lightHex: '#dbeafe',
      darkHex: '#1d4ed8',
      startIndex: 14,
      turnIndex: 13,
      homeDirection: 'up',
      baseArea: { rMin: 9, rMax: 14, cMin: 9, cMax: 14 },
      baseSlots: [
        { c: 10.8, r: 10.8 },
        { c: 12.8, r: 10.8 },
        { c: 10.8, r: 12.8 },
        { c: 12.8, r: 12.8 }
      ],
      homePath: [
        { c: 7, r: 13 },
        { c: 7, r: 12 },
        { c: 7, r: 11 },
        { c: 7, r: 10 },
        { c: 7, r: 9 }
      ],
      centerHome: { c: 7, r: 7.8 }
    },
    yellow: {
      name: 'Yellow',
      hindiName: 'पीला (Yellow)',
      hex: '#f59e0b',
      lightHex: '#fef3c7',
      darkHex: '#b45309',
      startIndex: 27,
      turnIndex: 26,
      homeDirection: 'left',
      baseArea: { rMin: 0, rMax: 5, cMin: 9, cMax: 14 },
      baseSlots: [
        { c: 10.8, r: 1.8 },
        { c: 12.8, r: 1.8 },
        { c: 10.8, r: 3.8 },
        { c: 12.8, r: 3.8 }
      ],
      homePath: [
        { c: 13, r: 7 },
        { c: 12, r: 7 },
        { c: 11, r: 7 },
        { c: 10, r: 7 },
        { c: 9, r: 7 }
      ],
      centerHome: { c: 7.8, r: 7 }
    },
    green: {
      name: 'Green',
      hindiName: 'हरा (Green)',
      hex: '#10b981',
      lightHex: '#d1fae5',
      darkHex: '#047857',
      startIndex: 40,
      turnIndex: 39,
      homeDirection: 'down',
      baseArea: { rMin: 0, rMax: 5, cMin: 0, cMax: 5 },
      baseSlots: [
        { c: 1.8, r: 1.8 },
        { c: 3.8, r: 1.8 },
        { c: 1.8, r: 3.8 },
        { c: 3.8, r: 3.8 }
      ],
      homePath: [
        { c: 7, r: 1 },
        { c: 7, r: 2 },
        { c: 7, r: 3 },
        { c: 7, r: 4 },
        { c: 7, r: 5 }
      ],
      centerHome: { c: 7, r: 6.2 }
    }
  },

  // Safe tiles: Starts (1, 14, 27, 40) + Stars (9, 22, 35, 48)
  safeTiles: [1, 9, 14, 22, 27, 35, 40, 48],
  starTiles: [9, 22, 35, 48]
};

// Generate 52 outer track tiles in exact clockwise loop
BOARD_4_CONFIG.outerTiles = (function() {
  const tiles = [];
  // 0: (0, 8)
  tiles.push({ c: 0, r: 8 });
  // 1..5: Red start and moving right along bottom of left arm
  for (let c = 1; c <= 5; c++) tiles.push({ c, r: 8 });
  // 6..11: Going down left side of bottom arm
  for (let r = 9; r <= 14; r++) tiles.push({ c: 6, r });
  // 12: Bottom turn
  tiles.push({ c: 7, r: 14 });
  // 13: Bottom right corner
  tiles.push({ c: 8, r: 14 });
  // 14..18: Blue start and going up right side of bottom arm
  for (let r = 13; r >= 9; r--) tiles.push({ c: 8, r });
  // 19..24: Going right along bottom side of right arm
  for (let c = 9; c <= 14; c++) tiles.push({ c, r: 8 });
  // 25: Right edge
  tiles.push({ c: 14, r: 7 });
  // 26: Right top corner
  tiles.push({ c: 14, r: 6 });
  // 27..31: Yellow start and going left along top side of right arm
  for (let c = 13; c >= 9; c--) tiles.push({ c, r: 6 });
  // 32..37: Going up right side of top arm
  for (let r = 5; r >= 0; r--) tiles.push({ c: 8, r });
  // 38: Top edge
  tiles.push({ c: 7, r: 0 });
  // 39: Top left corner
  tiles.push({ c: 6, r: 0 });
  // 40..44: Green start and going down left side of top arm
  for (let r = 1; r <= 5; r++) tiles.push({ c: 6, r });
  // 45..50: Going left along top side of left arm
  for (let c = 5; c >= 0; c--) tiles.push({ c, r: 6 });
  // 51: Left edge
  tiles.push({ c: 0, r: 7 });

  return tiles;
})();

window.BOARD_4_CONFIG = BOARD_4_CONFIG;
