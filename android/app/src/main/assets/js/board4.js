/**
 * 4-Player Classic Square Ludo Board Specification
 * Matches Authentic Indian Ludo King Layout (User Reference Image):
 * - Bottom-Left: Player 1 (Blue) [Team A]
 * - Top-Left: Player 2 (Red) [Team B]
 * - Top-Right: Player 3 (Green) [Team A]
 * - Bottom-Right: Player 4 (Yellow) [Team B]
 */
const BOARD_4_CONFIG = {
  type: 4,
  gridSize: 15,
  totalOuterTiles: 52,
  homePathLength: 5, // 5 steps inside colored lane + 1 final home center

  // Authentic Colors matching reference image
  colors: {
    blue: {
      name: 'Blue',
      hindiName: 'नीला (Player 1)',
      label: 'Player 1',
      teamId: 'A',
      hex: '#0072bc',
      lightHex: '#60a5fa',
      darkHex: '#004080',
      glow: '#3b82f6',
      startIndex: 39, // Track tile (col 6, row 13)
      turnIndex: 37, // Entrance tile (col 7, row 14)
      startArrow: 'up', // Arrow pointing UP at (col 7, row 14)
      baseCenter: { c: 3, r: 12 },
      baseArea: { cMin: 0, cMax: 5, rMin: 9, rMax: 14 },
      baseSlots: [
        { c: 2, r: 11 },
        { c: 4, r: 11 },
        { c: 2, r: 13 },
        { c: 4, r: 13 }
      ],
      homePath: [
        { c: 7, r: 13 },
        { c: 7, r: 12 },
        { c: 7, r: 11 },
        { c: 7, r: 10 },
        { c: 7, r: 9 }
      ],
      centerHome: { c: 7, r: 8 }
    },
    red: {
      name: 'Red',
      hindiName: 'लाल (Player 2)',
      label: 'Player 2',
      teamId: 'B',
      hex: '#e52521',
      lightHex: '#ff7b78',
      darkHex: '#8b0e0c',
      glow: '#ff3b38',
      startIndex: 0, // Track tile (col 1, row 6)
      turnIndex: 50, // Entrance tile (col 0, row 7)
      startArrow: 'right', // Arrow pointing RIGHT at (col 0, row 7)
      baseCenter: { c: 3, r: 3 },
      baseArea: { cMin: 0, cMax: 5, rMin: 0, rMax: 5 },
      baseSlots: [
        { c: 2, r: 2 },
        { c: 4, r: 2 },
        { c: 2, r: 4 },
        { c: 4, r: 4 }
      ],
      homePath: [
        { c: 1, r: 7 },
        { c: 2, r: 7 },
        { c: 3, r: 7 },
        { c: 4, r: 7 },
        { c: 5, r: 7 }
      ],
      centerHome: { c: 6, r: 7 }
    },
    green: {
      name: 'Green',
      hindiName: 'हरा (Player 3)',
      label: 'Player 3',
      teamId: 'A',
      hex: '#00a651',
      lightHex: '#52d98c',
      darkHex: '#005c2d',
      glow: '#22c55e',
      startIndex: 13, // Track tile (col 8, row 1)
      turnIndex: 11, // Entrance tile (col 7, row 0)
      startArrow: 'down', // Arrow pointing DOWN at (col 7, row 0)
      baseCenter: { c: 12, r: 3 },
      baseArea: { cMin: 9, cMax: 14, rMin: 0, rMax: 5 },
      baseSlots: [
        { c: 11, r: 2 },
        { c: 13, r: 2 },
        { c: 11, r: 4 },
        { c: 13, r: 4 }
      ],
      homePath: [
        { c: 7, r: 1 },
        { c: 7, r: 2 },
        { c: 7, r: 3 },
        { c: 7, r: 4 },
        { c: 7, r: 5 }
      ],
      centerHome: { c: 7, r: 6 }
    },
    yellow: {
      name: 'Yellow',
      hindiName: 'पीला (Player 4)',
      label: 'Player 4',
      teamId: 'B',
      hex: '#fdb813',
      lightHex: '#fef08a',
      darkHex: '#996a00',
      glow: '#eab308',
      startIndex: 26, // Track tile (col 13, row 8)
      turnIndex: 24, // Entrance tile (col 14, row 7)
      startArrow: 'left', // Arrow pointing LEFT at (col 14, row 7)
      baseCenter: { c: 12, r: 12 },
      baseArea: { cMin: 9, cMax: 14, rMin: 9, rMax: 14 },
      baseSlots: [
        { c: 11, r: 11 },
        { c: 13, r: 11 },
        { c: 11, r: 13 },
        { c: 13, r: 13 }
      ],
      homePath: [
        { c: 13, r: 7 },
        { c: 12, r: 7 },
        { c: 11, r: 7 },
        { c: 10, r: 7 },
        { c: 9, r: 7 }
      ],
      centerHome: { c: 8, r: 7 }
    }
  },

  // 52 Outer Track Coordinates in clockwise traversal order starting from Red start (Tile 0)
  outerTiles: [
    // Red side & Top Arm (13 tiles: 0 to 12)
    { c: 1, r: 6 },  // 0  Red Start tile (Safe)
    { c: 2, r: 6 },  // 1
    { c: 3, r: 6 },  // 2
    { c: 4, r: 6 },  // 3
    { c: 5, r: 6 },  // 4
    { c: 6, r: 5 },  // 5
    { c: 6, r: 4 },  // 6
    { c: 6, r: 3 },  // 7
    { c: 6, r: 2 },  // 8  Star Safe tile ⭐ (As in image!)
    { c: 6, r: 1 },  // 9
    { c: 6, r: 0 },  // 10
    { c: 7, r: 0 },  // 11 Green Entrance (col 7, row 0) - Arrow pointing DOWN
    { c: 8, r: 0 },  // 12

    // Green side & Right Arm (13 tiles: 13 to 25)
    { c: 8, r: 1 },  // 13 Green Start tile (Safe)
    { c: 8, r: 2 },  // 14
    { c: 8, r: 3 },  // 15
    { c: 8, r: 4 },  // 16
    { c: 8, r: 5 },  // 17
    { c: 9, r: 6 },  // 18
    { c: 10, r: 6 }, // 19
    { c: 11, r: 6 }, // 20
    { c: 12, r: 6 }, // 21 Star Safe tile ⭐ (As in image!)
    { c: 13, r: 6 }, // 22
    { c: 14, r: 6 }, // 23
    { c: 14, r: 7 }, // 24 Yellow Entrance (col 14, row 7) - Arrow pointing LEFT
    { c: 14, r: 8 }, // 25

    // Yellow side & Bottom Arm (13 tiles: 26 to 38)
    { c: 13, r: 8 }, // 26 Yellow Start tile (Safe)
    { c: 12, r: 8 }, // 27
    { c: 11, r: 8 }, // 28
    { c: 10, r: 8 }, // 29
    { c: 9, r: 8 },  // 30
    { c: 8, r: 9 },  // 31
    { c: 8, r: 10 }, // 32
    { c: 8, r: 11 }, // 33
    { c: 8, r: 12 }, // 34 Star Safe tile ⭐ (As in image!)
    { c: 8, r: 13 }, // 35
    { c: 8, r: 14 }, // 36
    { c: 7, r: 14 }, // 37 Blue Entrance (col 7, row 14) - Arrow pointing UP
    { c: 6, r: 14 }, // 38

    // Blue side & Left Arm (13 tiles: 39 to 51)
    { c: 6, r: 13 }, // 39 Blue Start tile (Safe)
    { c: 6, r: 12 }, // 40
    { c: 6, r: 11 }, // 41
    { c: 6, r: 10 }, // 42
    { c: 6, r: 9 },  // 43
    { c: 5, r: 8 },  // 44
    { c: 4, r: 8 },  // 45
    { c: 3, r: 8 },  // 46
    { c: 2, r: 8 },  // 47 Star Safe tile ⭐ (As in image!)
    { c: 1, r: 8 },  // 48
    { c: 0, r: 8 },  // 49
    { c: 0, r: 7 },  // 50 Red Entrance (col 0, row 7) - Arrow pointing RIGHT
    { c: 0, r: 6 }   // 51 (connects back to 0 at c:1, r:6!)
  ],

  // Outlined Star Safe Tiles matching user reference image
  starTiles: [8, 21, 34, 47],

  // Starting indices (also safe)
  startTiles: [0, 13, 26, 39],

  // Combined Safe Tiles (Stars + Starts)
  safeTiles: [0, 8, 13, 21, 26, 34, 39, 47]
};

if (typeof window !== 'undefined') {
  window.BOARD_4_CONFIG = BOARD_4_CONFIG;
}
