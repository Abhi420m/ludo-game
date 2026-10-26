/**
 * Main Application Bootstrapper
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI Controller
  const ui = new UIController();

  // Pre-populate 4-player setup by default
  ui.generatePlayerConfigRows(4);

  // Auto-start default game with 4 HUMAN players (Pass & Play for friends sitting together)
  // No AI by default, pure local multiplayer!
  ui.initGame({
    playerCount: 4,
    boardType: 4,
    tokensPerPlayer: 4,
    killRequired: true,
    players: [
      { name: 'खिलाड़ी 1 (Red)', isBot: false },
      { name: 'खिलाड़ी 2 (Green)', isBot: false },
      { name: 'खिलाड़ी 3 (Yellow)', isBot: false },
      { name: 'खिलाड़ी 4 (Blue)', isBot: false }
    ]
  });

  // Unlock Web Audio API on first user interaction anywhere
  const unlockAudio = () => {
    if (window.soundEngine) {
      window.soundEngine.ensureContext();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);

  // Register Service Worker for offline play on Android
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.log('SW registration skipped in local mode', err);
    });
  }
});
