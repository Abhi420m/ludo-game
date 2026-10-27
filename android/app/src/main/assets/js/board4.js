/**
 * 4-Player Classic Square Ludo Board Specification (Ludo King Style)
 * Standard 15x15 Grid Layout with Authentic Colors & Dimensions
 */
const BOARD_4_CONFIG = {
  type: 4,
  gridSize: 15,
  totalOuterTiles: 52,
  homePathLength: 5, // 5 steps inside colored lane + 1 final home center

  // Classic Vibrant Ludo King Colors
  colors: {
    red: {
      name: 'Red',
      hindiName: 'लाल (Red)',
      hex: '#e52521',
      lightHex: '#ff7b78',
      darkHex: '#8b0e0c',
      glow: '#ff3b38',
      startIndex: 1, // Track tile (col 1, row 8)
      turnIndex: 0, // Last track tile before home turn (col 0, row 7)
      startArrow: 'up', // Arrow pointing UP along track
      baseCenter: { c: 3, r: 12 },
      baseSlots: [
        { c: 1.6, r: 10.6 },
        { c: 4.4, r: 10.6 },
        { c: 1.6, r: 13.4 },
        { c: 4.4, r: 13.4 }
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
    green: {
      name: 'Green',
      hindiName: 'हरा (Green)',
      hex: '#00a651',
      lightHex: '#52d98c',
      darkHex: '#005c2d',
      glow: '#22c55e',
      startIndex: 40, // Track tile (col 6, row 1)
      turnIndex: 39, // Last track tile before home turn (col 7, row 0)
      startArrow: 'right', // Arrow pointing RIGHT
      baseCenter: { c: 3, r: 3 },
      baseSlots: [
        { c: 1.6, r: 1.6 },
        { c: 4.4, r: 1.6 },
        { c: 1.6, r: 4.4 },
        { c: 4.4, r: 4.4 }
      ],
      homePath: [
        { c: 7, r: 1 },
        { c: 7, r: 2 },
        { c: 7, r: 3 },
        { c: 7, r: 4 },
        { c: 7, r: 5 }
      ],
      centerHome: { c: 7, r: 6.2 }
    },
    yellow: {
      name: 'Yellow',
      hindiName: 'पीला (Yellow)',
      hex: '#fdb813',
      lightHex: '#fef08a',
      darkHex: '#996a00',
      glow: '#eab308',
      startIndex: 27, // Track tile (col 13, row 6)
      turnIndex: 26, // Last track tile before home turn (col 14, row 7)
      startArrow: 'down', // Arrow pointing DOWN
      baseCenter: { c: 12, r: 3 },
      baseSlots: [
        { c: 10.6, r: 1.6 },
        { c: 13.4, r: 1.6 },
        { c: 10.6, r: 4.4 },
        { c: 13.4, r: 4.4 }
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
    blue: {
      name: 'Blue',
      hindiName: 'नीला (Blue)',
      hex: '#0072bc',
      lightHex: '#60a5fa',
      darkHex: '#003e6b',
      glow: '#3b82f6',
      startIndex: 14, // Track tile (col 8, row 13)
      turnIndex: 13, // Last track tile before home turn (col 7, row 14)
      startArrow: 'left', // Arrow pointing LEFT
      baseCenter: { c: 12, r: 12 },
      baseSlots: [
        { c: 10.6, r: 10.6 },
        { c: 13.4, r: 10.6 },
        { c: 10.6, r: 13.4 },
        { c: 13.4, r: 13.4 }
      ],
      homePath: [
        { c: 7, r: 13 },
        { c: 7, r: 12 },
        { c: 7, r: 11 },
        { c: 7, r: 10 },
        { c: 7, r: 9 }
      ],
      centerHome: { c: 7, r: 7.8 }
    }
  },

  // 52 Outer Track Coordinates in clockwise traversal order starting from Red start (Tile 0 = col 0, row 7)
  outerTiles: [
    { c: 0, r: 7 },  // 0  Red turn / entry
    { c: 1, r: 8 },  // 1  Red Start tile (Safe)
    { c: 2, r: 8 },  // 2
    { c: 3, r: 8 },  // 3
    { c: 4, r: 8 },  // 4
    { c: 5, r: 8 },  // 5
    { c: 6, r: 9 },  // 6  Bend into bottom arm
    { c: 6, r: 10 }, // 7
    { c: 6, r: 11 }, // 8  Star Safe tile
    { c: 6, r: 12 }, // 9
    { c: 6, r: 13 }, // 10
    { c: 6, r: 14 }, // 11
    { c: 7, r: 14 }, // 12 Bottom center turn
    { c: 7, r: 14 }, // 13 Blue turn
    { c: 8, r: 13 }, // 14 Blue Start tile (Safe)
    { c: 8, r: 12 }, // 15
    { c: 8, r: 11 }, // 16
    { c: 8, r: 10 }, // 17
    { c: 8, r: 9 },  // 18
    { c: 9, r: 8 },  // 19 Bend into right arm
    { c: 10, r: 8 }, // 20
    { c: 11, r: 8 }, // 21 Star Safe tile
    { c: 12, r: 8 }, // 22
    { c: 13, r: 8 }, // 23
    { c: 14, r: 8 }, // 24 Rightmost tile
    { c: 14, r: 7 }, // 25 Right center turn
    { c: 14, r: 7 }, // 26 Yellow turn
    { c: 13, r: 6 }, // 27 Yellow Start tile (Safe)
    { c: 12, r: 6 }, // 28
    { c: 11, r: 6 }, // 29
    { c: 10, r: 6 }, // 30
    { c: 9, r: 6 },  // 31
    { c: 8, r: 5 },  // 32 Bend into top arm
    { c: 8, r: 4 },  // 33
    { c: 8, r: 3 },  // 34 Star Safe tile
    { c: 8, r: 2 },  // 35
    { c: 8, r: 1 },  // 36
    { c: 8, r: 0 },  // 37 Topmost right
    { c: 7, r: 0 },  // 38 Top center turn
    { c: 7, r: 0 },  // 39 Green turn
    { c: 6, r: 1 },  // 40 Green Start tile (Safe)
    { c: 6, r: 2 },  // 41
    { c: 6, r: 3 },  // 42
    { c: 6, r: 4 },  // 43
    { c: 6, r: 5 },  // 44
    { c: 5, r: 6 },  // 45 Bend into left arm
    { c: 4, r: 6 },  // 46
    { c: 3, r: 6 },  // 47 Star Safe tile
    { c: 2, r: 6 },  // 48
    { c: 1, r: 6 },  // 49
    { c: 0, r: 6 },  // 50 Leftmost tile
    { c: 0, r: 7 }   // 51 Left center tile
  ],

  // Safe Tiles where tokens cannot be captured
  safeTiles: [1, 8, 14, 21, 27, 34, 40, 47],
  starTiles: [8, 21, 34, 47] // Standard star locations
};

if (typeof window !== 'undefined') {
  window.BOARD_4_CONFIG = BOARD_4_CONFIG;
}
