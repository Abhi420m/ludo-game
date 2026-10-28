/**
 * Ludo Game Rules Engine
 * Implements:
 * - "Bina tod ke andar na jana" (Kill / Tod required to enter Home):
 *   If no opponent killed yet, the token stops at the entrance and cannot turn in.
 * - Rolling 6: opens token from base + bonus roll. Max 2 sixes in a row (3 consecutive sixes cancels turn).
 * - Safe Zones: Stars ⭐ and Start tiles are safe. Tokens cannot be captured there. Multiple tokens can share.
 * - Exact roll required to reach center Home.
 * - Team Mode (Team A: Blue + Green vs Team B: Red + Yellow). Teammates cannot cut each other.
 */

class LudoGame {
  constructor(options = {}) {
    this.playerCount = options.playerCount || 4;
    this.boardType = options.boardType || (this.playerCount > 4 ? 6 : 4);
    this.tokensPerPlayer = options.tokensPerPlayer || 4;
    this.killRequired = options.killRequired !== false; // Default: TRUE as requested!
    this.teamMode = options.teamMode === true && this.playerCount === 4; // 2v2 Team Play
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
    this.winningTeam = null;
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
        colorList = ['blue', 'green']; // Opposite corners
      } else if (this.playerCount === 3) {
        colorList = ['blue', 'red', 'green'];
      } else {
        // Matches User Reference Image: Player 1 (Blue), Player 2 (Red), Player 3 (Green), Player 4 (Yellow)
        colorList = ['blue', 'red', 'green', 'yellow'];
      }
    } else {
      const all6 = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
      colorList = all6.slice(0, this.playerCount);
    }

    colorList.forEach((colorKey, idx) => {
      const customConfig = this.playerConfigs[idx] || {};
      const colorMeta = this.boardConfig.colors[colorKey];

      // Team Assignment in 4-Player Team Mode
      // Blue (P1) + Green (P3) = Team 1 (A)
      // Red (P2) + Yellow (P4) = Team 2 (B)
      let teamId = null;
      let teamName = null;
      if (this.teamMode) {
        teamId = (idx === 0 || idx === 2) ? 'A' : 'B';
        teamName = teamId === 'A' ? 'Team 1 (Blue + Green)' : 'Team 2 (Red + Yellow)';
      }

      const player = {
        id: idx,
        colorKey,
        name: customConfig.name || `Player ${idx + 1}`,
        teamId,
        teamName,
        isBot: customConfig.isBot || false,
        botDifficulty: customConfig.botDifficulty || 'medium',
        config: colorMeta,
        hasKilledOpponent: false, // Core traditional "Tod" rule
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
          trackIndex: null,
          homeStep: null,
          stepsTraveled: 0,
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

  // Get teammate in 2v2 Team Mode (Blue + Green, Red + Yellow)
  getPartner(player) {
    if (!this.teamMode || !player) return null;
    return this.players.find((p) => p.teamId === player.teamId && p.id !== player.id) || null;
  }

  // Check if a player has finished their involvement
  // In solo mode: finished when own tokens are all in home.
  // In team mode: finished only when BOTH player AND partner have finished all 8 tokens!
  isPlayerFinished(player) {
    if (this.teamMode) {
      const partner = this.getPartner(player);
      return player.tokensFinished === this.tokensPerPlayer && (!partner || partner.tokensFinished === this.tokensPerPlayer);
    }
    return player.tokensFinished === this.tokensPerPlayer;
  }

  // Roll dice
  // Rule: Rolling 6 grants +1 bonus turn, max 2 consecutive sixes (3rd six cancelled / prohibited)
  rollDice(forcedValue = null) {
    if (this.turnState !== 'WAITING_FOR_ROLL' || this.gameOver) {
      return null;
    }

    let value = forcedValue;
    if (!value) {
      if (this.consecutiveSixes >= 2) {
        // User requested: "6 aane pe 2 chance milte 2 bar or 6 3 bar na aana chye"
        // After 2 sixes, generate 1 to 5 only:
        value = Math.floor(Math.random() * 5) + 1;
      } else {
        value = Math.floor(Math.random() * 6) + 1;
      }
    }

    this.currentRoll = value;

    if (value === 6) {
      this.consecutiveSixes++;
    } else {
      this.consecutiveSixes = 0;
    }

    // Three sixes cancellation rule
    if (this.consecutiveSixes >= 3) {
      this.consecutiveSixes = 0;
      this.turnState = 'WAITING_FOR_ROLL';
      this.onDiceRolled(value, this.getCurrentPlayer(), true);
      this.passTurn();
      return { value, penalty: true };
    }

    this.validMoves = this.calculateValidMoves(this.getCurrentPlayer(), value);

    if (this.validMoves.length === 0) {
      this.turnState = 'ANIMATING';
      this.onDiceRolled(value, this.getCurrentPlayer(), false);
      return { value, validMoves: [] };
    }

    this.turnState = 'WAITING_FOR_MOVE';
    this.onDiceRolled(value, this.getCurrentPlayer(), false);
    return { value, validMoves: this.validMoves };
  }

  // Check if player or team has killed an opponent to enter home
  hasKillPermission(player) {
    if (!this.killRequired) return true;
    if (this.teamMode) {
      // Team mode: if ANY partner in the team has a kill, home is open
      return this.players.some((p) => p.teamId === player.teamId && p.hasKilledOpponent);
    }
    return player.hasKilledOpponent;
  }

  // Calculate all valid moves
  // In Team Mode, if current player has finished all tokens, roll for partner!
  calculateValidMoves(player, roll) {
    let targetPlayer = player;
    let isRollingForPartner = false;

    if (this.teamMode && player.tokensFinished === this.tokensPerPlayer) {
      const partner = this.getPartner(player);
      if (partner && partner.tokensFinished < this.tokensPerPlayer) {
        targetPlayer = partner;
        isRollingForPartner = true;
      } else {
        return [];
      }
    }

    const valid = [];
    const N = this.totalTrackTiles; // 52
    const canEnterHome = this.hasKillPermission(targetPlayer);

    targetPlayer.tokens.forEach((token) => {
      if (token.state === 'FINISHED') return;

      // 1. BASE: Only opens on rolling 6!
      if (token.state === 'BASE') {
        if (roll === 6) {
          valid.push({
            tokenId: token.id,
            targetPlayerId: targetPlayer.id,
            controllingPlayerId: player.id,
            isPartnerMove: isRollingForPartner,
            action: 'EXIT_BASE',
            destination: {
              state: 'TRACK',
              trackIndex: targetPlayer.config.startIndex,
              stepsTraveled: 0
            }
          });
        }
        return;
      }

      // 2. TRACK: Moving on outer circuit
      if (token.state === 'TRACK') {
        const turnIndex = targetPlayer.config.turnIndex;
        const circuitLength = N - 1; // 51 steps from start to turn entrance
        const stepsLeftToEntrance = circuitLength - token.stepsTraveled;

        // If player DOES NOT have kill permission ("बिना तोड़ के अंदर ना जाना"):
        if (!canEnterHome) {
          if (token.stepsTraveled >= circuitLength) {
            // Already at the entrance! Cannot enter home!
            // Must stay at entrance waiting for kill, or take another round
            const nextTrackIndex = (token.trackIndex + roll) % N;
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'BYPASS_LOCKED_GATE',
              destination: {
                state: 'TRACK',
                trackIndex: nextTrackIndex,
                stepsTraveled: token.stepsTraveled + roll
              },
              stoppedAtEntrance: false
            });
          } else if (token.stepsTraveled + roll >= circuitLength) {
            // Reaches the entrance: Stops right at the entrance gate!
            // "आपकी गोटी घर के मुहाने (Entrance) पर आकर रुक जाएगी। वह तब तक अंदर नहीं मुड़ेगी जब तक आप किसी अन्य गोटी से तोड़ न कर लें।"
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'MOVE_TRACK',
              destination: {
                state: 'TRACK',
                trackIndex: turnIndex,
                stepsTraveled: circuitLength
              },
              stoppedAtEntrance: true
            });
          } else {
            // Normal track move before entrance
            const nextTrackIndex = (token.trackIndex + roll) % N;
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'MOVE_TRACK',
              destination: {
                state: 'TRACK',
                trackIndex: nextTrackIndex,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          }
          return;
        }

        // Player HAS kill permission: can enter colored home lane!
        if (token.stepsTraveled + roll >= circuitLength) {
          const stepsIntoHome = (token.stepsTraveled + roll) - circuitLength;

          if (stepsIntoHome === 0) {
            // Land exactly on entrance tile
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'MOVE_TRACK',
              destination: {
                state: 'TRACK',
                trackIndex: turnIndex,
                stepsTraveled: circuitLength
              }
            });
          } else if (stepsIntoHome <= this.homePathLength) {
            // Inside colored Home Path (steps 1..5)
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'ENTER_HOME_PATH',
              destination: {
                state: 'HOME_PATH',
                homeStep: stepsIntoHome - 1,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          } else if (stepsIntoHome === this.homePathLength + 1) {
            // Exact roll to enter Center Home!
            valid.push({
              tokenId: token.id,
              targetPlayerId: targetPlayer.id,
              controllingPlayerId: player.id,
              isPartnerMove: isRollingForPartner,
              action: 'ENTER_CENTER_HOME',
              destination: {
                state: 'FINISHED',
                homeStep: this.homePathLength,
                stepsTraveled: token.stepsTraveled + roll
              }
            });
          }
          // If stepsIntoHome > homePathLength + 1: Overshoot! Invalid move.
        } else {
          // Normal track move
          const nextTrackIndex = (token.trackIndex + roll) % N;
          valid.push({
            tokenId: token.id,
            targetPlayerId: targetPlayer.id,
            controllingPlayerId: player.id,
            isPartnerMove: isRollingForPartner,
            action: 'MOVE_TRACK',
            destination: {
              state: 'TRACK',
              trackIndex: nextTrackIndex,
              stepsTraveled: token.stepsTraveled + roll
            }
          });
        }
        return;
      }

      // 3. HOME PATH: Moving inside colored stretch towards Center Home
      if (token.state === 'HOME_PATH') {
        const nextStep = token.homeStep + roll;
        if (nextStep < this.homePathLength) {
          valid.push({
            tokenId: token.id,
            targetPlayerId: targetPlayer.id,
            controllingPlayerId: player.id,
            isPartnerMove: isRollingForPartner,
            action: 'MOVE_HOME_PATH',
            destination: {
              state: 'HOME_PATH',
              homeStep: nextStep,
              stepsTraveled: token.stepsTraveled + roll
            }
          });
        } else if (nextStep === this.homePathLength) {
          // Exact roll to reach Center Home!
          valid.push({
            tokenId: token.id,
            targetPlayerId: targetPlayer.id,
            controllingPlayerId: player.id,
            isPartnerMove: isRollingForPartner,
            action: 'ENTER_CENTER_HOME',
            destination: {
              state: 'FINISHED',
              homeStep: this.homePathLength,
              stepsTraveled: token.stepsTraveled + roll
            }
          });
        }
        // If nextStep > homePathLength: Overshoot! Cannot move without exact roll.
      }
    });

    return valid;
  }

  // Execute a move for chosen token
  async moveToken(tokenId, targetPlayerId = null) {
    if (this.turnState !== 'WAITING_FOR_MOVE') return false;

    const move = this.validMoves.find((m) =>
      m.tokenId === tokenId && (targetPlayerId === null || m.targetPlayerId === undefined || m.targetPlayerId === targetPlayerId)
    );
    if (!move) return false;

    this.turnState = 'ANIMATING';
    const activePlayer = this.getCurrentPlayer();
    const targetPlayer = move.targetPlayerId !== undefined ? this.players[move.targetPlayerId] : activePlayer;
    const token = targetPlayer.tokens[tokenId];
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
      const isSafe = (this.boardConfig.safeTiles || []).includes(token.trackIndex);
      if (!isSafe) {
        // Check if any opponent token is on this trackIndex
        for (const otherPlayer of this.players) {
          if (otherPlayer.id === targetPlayer.id) continue;

          // In Team Mode: Teammates NEVER cut each other!
          if (this.teamMode && otherPlayer.teamId === targetPlayer.teamId) {
            continue;
          }

          for (const opToken of otherPlayer.tokens) {
            if (opToken.state === 'TRACK' && opToken.trackIndex === token.trackIndex) {
              // GOTI CUT (TOD)!
              victimToken = opToken;
              opToken.state = 'BASE';
              opToken.trackIndex = null;
              opToken.stepsTraveled = 0;
              opToken.homeStep = null;

              // Register Kill / Tod
              activePlayer.killsCount++;
              if (activePlayer.id !== targetPlayer.id) {
                targetPlayer.killsCount++;
              }
              const firstKill = !activePlayer.hasKilledOpponent;
              activePlayer.hasKilledOpponent = true;
              targetPlayer.hasKilledOpponent = true;
              getsBonusRoll = true;

              // In Team Mode: Unlock gate for the whole team!
              if (this.teamMode) {
                this.players
                  .filter((p) => p.teamId === activePlayer.teamId)
                  .forEach((p) => (p.hasKilledOpponent = true));
              }

              this.onTokenKilled(activePlayer, opToken, otherPlayer);

              if (firstKill && this.killRequired) {
                this.onHomeGateUnlocked(activePlayer);
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
      targetPlayer.tokensFinished++;
      getsBonusRoll = true;
      this.onTokenFinished(targetPlayer, token);

      if (targetPlayer.tokensFinished === this.tokensPerPlayer && !this.teamMode) {
        targetPlayer.rank = this.winnerRankings.length + 1;
        this.winnerRankings.push(targetPlayer);
      }
    }

    // Check Game Over conditions
    if (this.teamMode) {
      const teamATokens = this.players.filter((p) => p.teamId === 'A').reduce((sum, p) => sum + p.tokensFinished, 0);
      const teamBTokens = this.players.filter((p) => p.teamId === 'B').reduce((sum, p) => sum + p.tokensFinished, 0);
      const targetTeamTokens = this.tokensPerPlayer * 2; // 8 tokens

      if (teamATokens >= targetTeamTokens) {
        this.gameOver = true;
        this.winningTeam = 'A';
        this.turnState = 'GAME_OVER';
        await this.onTokenMoved(targetPlayer, token, prevPos, move, victimToken, activePlayer);
        this.onGameOver({ teamMode: true, winningTeam: 'A', teamName: 'Team 1 (Blue + Green)' });
        return true;
      } else if (teamBTokens >= targetTeamTokens) {
        this.gameOver = true;
        this.winningTeam = 'B';
        this.turnState = 'GAME_OVER';
        await this.onTokenMoved(targetPlayer, token, prevPos, move, victimToken, activePlayer);
        this.onGameOver({ teamMode: true, winningTeam: 'B', teamName: 'Team 2 (Red + Yellow)' });
        return true;
      }
    } else {
      if (this.winnerRankings.length >= this.players.length - 1) {
        this.gameOver = true;
        this.turnState = 'GAME_OVER';
        await this.onTokenMoved(targetPlayer, token, prevPos, move, victimToken, activePlayer);
        this.onGameOver({ teamMode: false, rankings: this.winnerRankings });
        return true;
      }
    }

    // Broadcast move event with animation
    await this.onTokenMoved(targetPlayer, token, prevPos, move, victimToken, activePlayer);

    // Turn transition: Bonus roll or Pass turn
    this.turnState = 'WAITING_FOR_ROLL';

    if (getsBonusRoll && !this.gameOver) {
      const canStillRoll = this.teamMode
        ? !this.isPlayerFinished(activePlayer)
        : activePlayer.tokensFinished < this.tokensPerPlayer;

      if (canStillRoll) {
        const reason = this.currentRoll === 6 ? 'SIX' : (victimToken ? 'CAPTURE' : 'HOME');
        this.onBonusRoll(activePlayer, reason);
        this.onStateChange();
        return true;
      }
    }

    this.passTurn();
    return true;
  }

  // Advance turn to next active player
  passTurn() {
    if (this.gameOver) return;

    this.consecutiveSixes = 0;
    this.currentRoll = 0;
    this.validMoves = [];
    this.turnState = 'WAITING_FOR_ROLL';

    let nextIdx = (this.currentPlayerIndex + 1) % this.players.length;
    let loopGuard = 0;

    // Skip players who have finished all their tokens (and partner if in team mode)
    while (this.isPlayerFinished(this.players[nextIdx]) && loopGuard < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loopGuard++;
    }

    this.currentPlayerIndex = nextIdx;
    this.onStateChange();
  }
}

if (typeof window !== 'undefined') {
  window.LudoGame = LudoGame;
}
