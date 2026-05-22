/* ══════════════════════════════════════════
   LASER TAG PAGE — Interactive JS
   ══════════════════════════════════════════ */

(function () {

  /* ── Smooth scroll (Lenis) ── */
  const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  /* ── Navbar scroll-hide ── */
  const navbar = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', function () {
    const y = window.scrollY;
    if (navbar) {
      navbar.style.transform = (y > lastY && y > 80) ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastY = y;
  }, { passive: true });

  /* ── Game Modes ── */
  const MODES = [
    {
      img: 'images/laser-tag/modes/team-death-match.png',
      name: 'Team Deathmatch',
      desc: 'Two squads enter. Only one dominates. Coordinate with your team, take out the enemy, and claim the arena.'
    },
    {
      img: 'images/laser-tag/modes/solo-death-match.png',
      name: 'Solo Deathmatch',
      desc: 'Every player for themselves. No allies, no backup — just your aim and your instincts against everyone in the arena.'
    },
    {
      img: 'images/laser-tag/modes/save-the-president.png',
      name: 'Save the President',
      desc: 'One player is the President. One team protects. One team hunts. The most tactical game mode in the arena.'
    }
  ];

  const modeImg = document.getElementById('lt-mode-img');
  const modeItems = document.querySelectorAll('.lt-mode-item');
  const processStageName = document.getElementById('lt-process-name');
  const processStageDesc = document.getElementById('lt-process-desc');

  function setMode(idx) {
    const m = MODES[idx];
    if (!m) return;

    modeItems.forEach(function (el) { el.classList.remove('lt-mode-item--active'); });
    modeItems[idx] && modeItems[idx].classList.add('lt-mode-item--active');

    if (modeImg) {
      modeImg.style.opacity = '0';
      setTimeout(function () {
        modeImg.src = m.img;
        modeImg.alt = m.name;
        modeImg.style.opacity = '1';
      }, 200);
    }
  }

  modeItems.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      const idx = parseInt(el.dataset.ltModeIdx, 10);
      setMode(idx);
    });
  });

  /* ── Video Modal ── */
  const modal = document.getElementById('lt-video-modal');
  const modalVideo = document.getElementById('lt-modal-video');
  const closeBtn = document.getElementById('lt-btn-close-video');
  const heroBtnVideo = document.getElementById('hero-btn-video');
  const modesBtnVideo = document.getElementById('lt-modes-btn-video');

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (modalVideo) modalVideo.play().catch(function () {});
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalVideo) { modalVideo.pause(); modalVideo.currentTime = 0; }
  }

  if (heroBtnVideo) {
    heroBtnVideo.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  }

  if (modesBtnVideo) {
    modesBtnVideo.addEventListener('click', openModal);
  }

  if (closeBtn) { closeBtn.addEventListener('click', closeModal); }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ── Process Steps ── */
  const STEPS = [
    { name: 'Suit Up', desc: 'Players gear up with combat vests and laser guns. Ready to battle in under 2 minutes.' },
    { name: 'Select Game Mode', desc: 'Choose from Team Deathmatch, Solo Deathmatch, or Save the President at the kiosk.' },
    { name: 'Enter & Battle', desc: 'Players enter the arena and battle begins. Moments AI captures every highlight automatically.' },
    { name: 'Share & Return', desc: 'Review your score, claim your highlight clip, and challenge your squad to a rematch.' }
  ];

  const stepBtns = document.querySelectorAll('.lt-process-btn');
  const stepSlides = document.querySelectorAll('.lt-process-slide');
  const stepNameEl = document.getElementById('lt-process-name');
  const stepDescEl = document.getElementById('lt-process-desc');

  function setStep(idx) {
    stepBtns.forEach(function (b) { b.classList.remove('lt-process-btn--active'); });
    stepSlides.forEach(function (s) { s.classList.remove('lt-process-slide--active'); });

    if (stepBtns[idx]) stepBtns[idx].classList.add('lt-process-btn--active');
    if (stepSlides[idx]) stepSlides[idx].classList.add('lt-process-slide--active');
    if (stepNameEl && STEPS[idx]) stepNameEl.textContent = STEPS[idx].name;
    if (stepDescEl && STEPS[idx]) stepDescEl.textContent = STEPS[idx].desc;
  }

  stepBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const idx = parseInt(btn.dataset.ltStepBtn, 10);
      setStep(idx);
    });
  });

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.revealDelay || '0';
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ── Nav theme (data-nav-theme) ── */
  const themeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && navbar) {
        const theme = entry.target.dataset.navTheme || 'dark';
        navbar.setAttribute('data-theme', theme);
      }
    });
  }, { threshold: 0.4, rootMargin: '-60px 0px 0px 0px' });

  document.querySelectorAll('[data-nav-theme]').forEach(function (section) {
    themeObserver.observe(section);
  });

})();
