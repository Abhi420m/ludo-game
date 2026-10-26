/**
 * Smart Bot AI Engine for Ludo
 * Evaluates move priorities: Kill opponent > Enter Home > Exit Base > Escape Danger > Safe Tile > Advance
 */

class LudoAI {
  static chooseBestMove(game, player, validMoves) {
    if (!validMoves || validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    validMoves.forEach((move) => {
      const score = this.evaluateMove(game, player, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove;
  }

  static evaluateMove(game, player, move) {
    let score = 0;
    const token = player.tokens[move.tokenId];
    const N = game.totalTrackTiles;
    const dest = move.destination;

    // 1. FINISH TOKEN (Highest priority)
    if (dest.state === 'FINISHED') {
      score += 1000;
      return score;
    }

    // 2. KILL OPPONENT TOKEN (Critical priority, especially if gate locked)
    if (dest.state === 'TRACK') {
      const isDestSafe = game.boardConfig.safeTiles.includes(dest.trackIndex);
      if (!isDestSafe) {
        let wouldKill = false;
        for (const op of game.players) {
          if (op.id === player.id) continue;
          for (const opT of op.tokens) {
            if (opT.state === 'TRACK' && opT.trackIndex === dest.trackIndex) {
              wouldKill = true;
              break;
            }
          }
          if (wouldKill) break;
        }

        if (wouldKill) {
          // If gate is locked, killing an opponent is top priority!
          score += !player.hasKilledOpponent ? 950 : 800;
        }
      }
    }

    // 3. EXIT BASE ON 6
    if (move.action === 'EXIT_BASE') {
      // If player has few tokens on board, exiting is very important
      const activeTokens = player.tokens.filter((t) => t.state === 'TRACK' || t.state === 'HOME_PATH').length;
      if (activeTokens === 0) score += 750;
      else if (activeTokens === 1) score += 550;
      else score += 400;
    }

    // 4. ENTER HOME PATH (Safe from capture)
    if (dest.state === 'HOME_PATH') {
      score += 450;
      if (token.state === 'TRACK') {
        score += 150; // Transitioned from danger track into safe home path
      }
    }

    // 5. LAND ON SAFE TILE (Star or Start)
    if (dest.state === 'TRACK' && game.boardConfig.safeTiles.includes(dest.trackIndex)) {
      score += 300;
    }

    // 6. ESCAPE DANGER (Token was in danger on current square)
    if (token.state === 'TRACK' && !game.boardConfig.safeTiles.includes(token.trackIndex)) {
      let isThreatened = false;
      for (const op of game.players) {
        if (op.id === player.id) continue;
        for (const opT of op.tokens) {
          if (opT.state === 'TRACK') {
            const distance = (token.trackIndex - opT.trackIndex + N) % N;
            if (distance >= 1 && distance <= 6) {
              isThreatened = true;
              break;
            }
          }
        }
        if (isThreatened) break;
      }
      if (isThreatened) {
        score += 250; // Reward fleeing danger
      }
    }

    // 7. AVOID LANDING IN FRONT OF OPPONENT
    if (dest.state === 'TRACK' && !game.boardConfig.safeTiles.includes(dest.trackIndex)) {
      let landingDanger = false;
      for (const op of game.players) {
        if (op.id === player.id) continue;
        for (const opT of op.tokens) {
          if (opT.state === 'TRACK') {
            const dist = (dest.trackIndex - opT.trackIndex + N) % N;
            if (dist >= 1 && dist <= 6) {
              landingDanger = true;
              break;
            }
          }
        }
        if (landingDanger) break;
      }
      if (landingDanger) {
        score -= 180; // Penalty for placing token in danger
      }
    }

    // 8. PROGRESS FORWARD
    if (dest.stepsTraveled) {
      score += Math.min(dest.stepsTraveled, 100);
    }

    // Slight randomness for natural play
    score += Math.random() * 20;

    return score;
  }
}

window.LudoAI = LudoAI;
