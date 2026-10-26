/**
 * Ludo Game Rules Engine
 * Supports 2, 3, 4, 5, 6 players.
 * Implements special traditional Indian Ludo rule:
 * "Bina dusre ki goti kaate ghar ke andar jana mana hai" (Kill Required to Enter Home).
 */

class LudoGame {
  constructor(options = {}) {
    this.playerCount = options.playerCount || 4;
    this.boardType = options.boardType || (this.playerCount > 4 ? 6 : 4);
    this.tokensPerPlayer = options.tokensPerPlayer || 4;
    this.killRequired = options.killRequired !== false; // Default: TRUE as requested!
    this.playerConfigs = options.players || [];

    this.boardConfig = this.boardType === 6 ? window.BOARD_6_CONFIG : window.BOARD_4_CONFIG;
    this.totalTrackTiles = this.boardConfig.totalOuterTiles;
    this.homePathLength = this.boardConfig.homePathLength; // 5

    this.players = [];
    this.currentPlayerIndex = 0;
    this.currentRoll = 0;
    this.consecutiveSixes = 0;
    this.turnState = 'WAITING_FOR_ROLL'; // 'WAITING_FOR_ROLL', 'WAITING_FOR_MOVE', 'ANIMATING', 'GAME_OVER'
    this.validMoves = [];
    this.winnerRankings = []; // 1st, 2nd, 3rd...
    this.gameOver = false;
    this.logs = [];

    // Event callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onDiceRolled = options.onDiceRolled || (() => {});
    this.onTokenMoved = options.onTokenMoved || (() => {});
    this.onTokenKilled = options.onTokenKilled || (() => {});
    this.onHomeGateUnlocked = options.onHomeGateUnlocked || (() => {});
    this.onTokenFinished = options.onTokenFinished || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.onBonusRoll = options.onBonusRoll || (() => {});

    this.initPlayers();
  }

  initPlayers() {
    this.players = [];
    let colorList = [];

    if (this.boardType === 4) {
      if (this.playerCount === 2) {
        // 2 players: Red & Yellow (Opposite sides for fair balance)
        colorList = ['red', 'yellow'];
      } else if (this.playerCount === 3) {
        colorList = ['red', 'green', 'yellow'];
      } else {
        colorList = ['red', 'green', 'yellow', 'blue'];
      }
    } else {
      // 6-player board
      const all6 = ['red', 'green', 'yellow', 'blue', 'purple', 'orange'];
      if (this.playerCount === 2) {
        colorList = ['red', 'blue']; // Opposite sectors
      } else if (this.playerCount === 3) {
        colorList = ['red', 'yellow', 'purple']; // 120 deg triangle
      } else {
        colorList = all6.slice(0, this.playerCount);
      }
    }

    colorList.forEach((colorKey, idx) => {
      const customConfig = this.playerConfigs[idx] || {};
      const colorMeta = this.boardConfig.colors[colorKey];

      const player = {
        id: idx,
        colorKey,
        name: customConfig.name || `Player ${idx + 1}`,
        isBot: customConfig.isBot || false,
        botDifficulty: customConfig.botDifficulty || 'medium', // 'easy', 'medium', 'hard'
        config: colorMeta,
        hasKilledOpponent: false, // Core rule flag
        killsCount: 0,
        tokensFinished: 0,
        rank: null,
        tokens: []
      };

      // Initialize tokens
      for (let t = 0; t < this.tokensPerPlayer; t++) {
        player.tokens.push({
          id: t,
          playerId: idx,
          colorKey,
          state: 'BASE', // 'BASE', 'TRACK', 'HOME_PATH', 'FINISHED'
          trackIndex: null, // outer tile index (0..51 or 0..71)
          homeStep: null, // 0..4, 5 is center home
          stepsTraveled: 0, // steps walked on outer track
          baseSlotIndex: t
        });
      }

      this.players.push(player);
    });

    this.currentPlayerIndex = 0;
    this.turnState = 'WAITING_FOR_ROLL';
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  // Roll dice
  rollDice(forcedValue = null) {
    if (this.turnState !== 'WAITING_FOR_ROLL' || this.gameOver) {
      return null;
    }

    const value = forcedValue || Math.floor(Math.random() * 6) + 1;
    this.currentRoll = value;

    if (value === 6) {
      this.consecutiveSixes++;
    } else {
      this.consecutiveSixes = 0;
    }

    // Check consecutive 3 sixes penalty
    if (this.consecutiveSixes === 3) {
      this.consecutiveSixes = 0;
      this.turnState = 'WAITING_FOR_ROLL';
      this.onDiceRolled(value, this.getCurrentPlayer(), true); // 3rd six penalty
      this.passTurn();
      return { value, penalty: true };
    }

    this.validMoves = this.calculateValidMoves(this.getCurrentPlayer(), value);

    if (this.validMoves.length === 0) {
      this.turnState = 'ANIMATING';
      this.onDiceRolled(value, this.getCurrentPlayer(), false);
      setTimeout(() => {
        this.turnState = 'WAITING_FOR_ROLL';
        this.passTurn();
      }, 700);
      return { value, validMoves: [] };
    }

    this.turnState = 'WAITING_FOR_MOVE';
    this.onDiceRolled(value, this.getCurrentPlayer(), false);
    return { value, validMoves: this.validMoves };
  }

  // Calculate all valid moves for given player and roll
  calculateValidMoves(player, roll) {
    const valid = [];
    const N = this.totalTrackTiles;

    player.tokens.forEach((token) => {
      if (token.state === 'FINISHED') return;

      if (token.state === 'BASE') {
        if (roll === 6) {
          valid.push({
            tokenId: token.id,
            action: 'EXIT_BASE',
            destination: {
              state: 'TRACK',
              trackIndex: player.config.startIndex,
              stepsTraveled: 0
            }
          });
        }
        return;
      }

      if (token.state === 'TRACK') {
        const startIndex = player.config.startIndex;
        const turnIndex = player.config.turnIndex;

        // Steps needed to reach turnIndex
        // Normal track distance from token.trackIndex to turnIndex:
        let distToTurn = (turnIndex - token.trackIndex + N) % N;
        if (distToTurn === 0 && token.stepsTraveled > 0) {
          distToTurn = 0; // Exactly on turn tile
        }

        const canEnterHome = player.hasKilledOpponent || !this.killRequired;

        // Has the token traveled around the board to reach home entrance?
        // A full circuit is N - 1 steps.
        const wouldPassTurnTile = token.stepsTraveled + roll >= (N - 1);

        if (canEnterHome && wouldPassTurnTile) {
          // Calculate steps into home path
          const stepsIntoHome = (token.stepsTraveled + roll) - (N - 1);

          if (stepsIntoHome === 0) {
            // Exactly on turn tile
            valid.push({
              tokenId: token.id,
              action: 'MOVE_TRACK',
              destination: {
                state: 'TRACK',
                trackIndex: turnIndex,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          } else if (stepsIntoHome <= this.homePathLength) {
            // Inside colored Home Path (stepsIntoHome 1..5)
            // step 1 -> index 0, step 5 -> index 4
            valid.push({
              tokenId: token.id,
              action: 'ENTER_HOME_PATH',
              destination: {
                state: 'HOME_PATH',
                homeStep: stepsIntoHome - 1,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          } else if (stepsIntoHome === this.homePathLength + 1) {
            // Reaches final Center Home!
            valid.push({
              tokenId: token.id,
              action: 'ENTER_CENTER_HOME',
              destination: {
                state: 'FINISHED',
                homeStep: this.homePathLength,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          }
          // If stepsIntoHome > homePathLength + 1: Overshot! Invalid move.
        } else {
          // Token stays on outer track:
          // Either it hasn't finished the circuit yet, OR Home Gate is locked!
          const nextTrackIndex = (token.trackIndex + roll) % N;
          const wouldLockBypass = !canEnterHome && wouldPassTurnTile;

          valid.push({
            tokenId: token.id,
            action: wouldLockBypass ? 'BYPASS_LOCKED_GATE' : 'MOVE_TRACK',
            destination: {
              state: 'TRACK',
              trackIndex: nextTrackIndex,
              stepsTraveled: token.stepsTraveled + roll
            },
            lockedGateBypass: wouldLockBypass
          });
        }
      }

      if (token.state === 'HOME_PATH') {
        const nextStep = token.homeStep + roll;
        if (nextStep < this.homePathLength) {
          valid.push({
            tokenId: token.id,
            action: 'MOVE_HOME_PATH',
            destination: {
              state: 'HOME_PATH',
              homeStep: nextStep,
              stepsTraveled: token.stepsTraveled + roll
            }
          });
        } else if (nextStep === this.homePathLength) {
          // Exact roll to finish!
          valid.push({
            tokenId: token.id,
            action: 'ENTER_CENTER_HOME',
            destination: {
              state: 'FINISHED',
              homeStep: this.homePathLength,
              stepsTraveled: token.stepsTraveled + roll
            }
          });
        }
        // If nextStep > homePathLength: Overshoot, cannot move.
      }
    });

    return valid;
  }

  // Execute a move for chosen token
  moveToken(tokenId) {
    if (this.turnState !== 'WAITING_FOR_MOVE') return false;

    const move = this.validMoves.find((m) => m.tokenId === tokenId);
    if (!move) return false;

    this.turnState = 'ANIMATING';
    const player = this.getCurrentPlayer();
    const token = player.tokens[tokenId];
    const prevPos = { ...token };

    // Apply destination
    token.state = move.destination.state;
    token.trackIndex = move.destination.trackIndex ?? null;
    token.homeStep = move.destination.homeStep ?? null;
    token.stepsTraveled = move.destination.stepsTraveled;

    let getsBonusRoll = this.currentRoll === 6;
    let victimToken = null;

    // Check for capture / cut if on TRACK
    if (token.state === 'TRACK') {
      const isSafe = this.boardConfig.safeTiles.includes(token.trackIndex);
      if (!isSafe) {
        // Check if any opponent token is on this trackIndex
        for (const otherPlayer of this.players) {
          if (otherPlayer.id === player.id) continue;

          for (const opToken of otherPlayer.tokens) {
            if (opToken.state === 'TRACK' && opToken.trackIndex === token.trackIndex) {
              // GOTI CUT!
              victimToken = opToken;
              opToken.state = 'BASE';
              opToken.trackIndex = null;
              opToken.stepsTraveled = 0;
              opToken.homeStep = null;

              // Register Kill
              player.killsCount++;
              const firstKill = !player.hasKilledOpponent;
              player.hasKilledOpponent = true;
              getsBonusRoll = true;

              this.onTokenKilled(player, opToken, otherPlayer);

              if (firstKill && this.killRequired) {
                this.onHomeGateUnlocked(player);
              }
              break; // cut one token
            }
          }
          if (victimToken) break;
        }
      }
    }

    // Check if token FINISHED
    if (token.state === 'FINISHED') {
      player.tokensFinished++;
      getsBonusRoll = true;
      this.onTokenFinished(player, token);

      if (player.tokensFinished === this.tokensPerPlayer) {
        player.rank = this.winnerRankings.length + 1;
        this.winnerRankings.push(player);

        // Check if game is over (all or all-but-one finished)
        if (this.winnerRankings.length >= this.players.length - 1) {
          this.gameOver = true;
          // Assign last player
          const remaining = this.players.find((p) => !p.rank);
          if (remaining) {
            remaining.rank = this.players.length;
            this.winnerRankings.push(remaining);
          }
          this.onGameOver(this.winnerRankings);
          this.onTokenMoved(player, token, prevPos, move, victimToken);
          this.onStateChange();
          return true;
        }
      }
    }

    this.onTokenMoved(player, token, prevPos, move, victimToken);

    // Turn resolution
    if (getsBonusRoll && !this.gameOver) {
      this.turnState = 'WAITING_FOR_ROLL';
      this.onBonusRoll(player, this.currentRoll === 6 ? 'SIX' : victimToken ? 'KILL' : 'HOME');
      this.onStateChange();
    } else {
      this.turnState = 'WAITING_FOR_ROLL';
      this.consecutiveSixes = 0;
      this.passTurn();
    }

    return true;
  }

  // Pass turn to next active player
  passTurn() {
    if (this.gameOver) return;

    let nextIdx = (this.currentPlayerIndex + 1) % this.players.length;
    let attempts = 0;

    // Skip already ranked/finished players
    while (this.players[nextIdx].rank !== null && attempts < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      attempts++;
    }

    this.currentPlayerIndex = nextIdx;
    this.currentRoll = 0;
    this.validMoves = [];
    this.turnState = 'WAITING_FOR_ROLL';
    this.onStateChange();
  }
}

window.LudoGame = LudoGame;
