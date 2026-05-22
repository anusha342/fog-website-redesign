// ════════════════════════════════════════════
//  FOG TEXT — HOVER MORPH INTERACTION
//  FOG → FUTURE OF GAMING
//  Reveal after 3s hover; conceal after 3s mouse-out
// ════════════════════════════════════════════
(function () {
  const fogZone    = document.getElementById('fog-zone');
  const fogWord    = document.getElementById('fog-word');
  const futureWord = document.getElementById('future-word');
  if (!fogZone || !fogWord || !futureWord) return;

  const fogLetters = fogWord.querySelectorAll('.fog-ltr');
  let revealed      = false;
  let revealTimer   = null;  // fires reveal after 3s on hover
  let concealTimer  = null;  // fires conceal after 3s on leave
  let glitchTimer   = null;

  // ── PERIODIC GLITCH on idle FOG ──────────────────
  function scheduleGlitch() {
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(function () {
      if (!revealed) {
        const ltr = fogLetters[Math.floor(Math.random() * fogLetters.length)];
        ltr.classList.add('glitch');
        setTimeout(function () { ltr.classList.remove('glitch'); }, 220);
      }
      scheduleGlitch();
    }, 2800 + Math.random() * 4000);
  }
  scheduleGlitch();

  // ── REVEAL ───────────────────────────────────────
  function reveal() {
    if (revealed) return;
    revealed = true;

    // Scatter FOG letters
    fogLetters.forEach(function (l) { l.classList.add('scatter'); });

    // Show FUTURE after short delay
    setTimeout(function () {
      futureWord.classList.add('active');
    }, 160);
  }

  // ── CONCEAL ──────────────────────────────────────
  function conceal() {
    if (!revealed) return;
    revealed = false;

    futureWord.classList.remove('active');

    // Return FOG letters after text fade
    setTimeout(function () {
      fogLetters.forEach(function (l) { l.classList.remove('scatter'); });
    }, 380);
  }

  // ── MOUSE ENTER: start 3-second reveal timer ─────
  fogZone.addEventListener('mouseenter', function () {
    // Cancel any pending conceal
    clearTimeout(concealTimer);
    concealTimer = null;

    if (!revealed) {
      revealTimer = setTimeout(reveal, 1000);
    }
  });

  // ── MOUSE LEAVE: start 3-second conceal timer ────
  fogZone.addEventListener('mouseleave', function () {
    // Cancel pending reveal
    clearTimeout(revealTimer);
    revealTimer = null;

    if (revealed) {
      concealTimer = setTimeout(conceal, 1000);
    }
  });

  // Touch fallback — tap to toggle immediately
  fogZone.addEventListener('click', function () {
    clearTimeout(revealTimer);
    clearTimeout(concealTimer);
    revealTimer = null;
    concealTimer = null;
    if (revealed) conceal(); else reveal();
  });
}());
