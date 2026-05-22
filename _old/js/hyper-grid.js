// ════════════════════════════════════════════
//  HYPERGRID PAGE INTERACTION SCRIPT
// ════════════════════════════════════════════

(function () {
  'use strict';

  // --- Navbar scroll hide/show ---
  var navbar = document.getElementById('navbar');
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y < 50) {
      navbar.classList.remove('nav-hidden');
    } else if (y > lastY + 5) {
      navbar.classList.add('nav-hidden');
    } else if (y < lastY - 5) {
      navbar.classList.remove('nav-hidden');
    }
    lastY = y;
  }, { passive: true });

  // --- Mobile menu ---
  var hamburger = document.getElementById('hamburger-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileClose = document.getElementById('mobile-close-btn');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    });
    if (mobileClose) {
      mobileClose.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    }
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Hero Video Modal/Lightbox ---
  var btnWatch = document.getElementById('hero-btn-video');
  var modal = document.getElementById('video-modal');
  var modalVideo = document.getElementById('modal-video');
  var btnCloseVideo = document.getElementById('btn-close-video');

  // Also wire the game-modes "Watch Gameplay" button to the same modal
  var modesBtnVideo = document.getElementById('modes-btn-video');
  if (modesBtnVideo && modal && modalVideo) {
    modesBtnVideo.addEventListener('click', function () {
      modal.classList.add('open');
      modalVideo.currentTime = 0;
      modalVideo.play();
      modalVideo.muted = false;
    });
  }

  if (btnWatch && modal && modalVideo && btnCloseVideo) {
    btnWatch.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('open');
      modalVideo.currentTime = 0;
      modalVideo.play();
      modalVideo.muted = false;
    });

    var closeModal = function () {
      modal.classList.remove('open');
      modalVideo.pause();
      modalVideo.muted = true;
    };

    btnCloseVideo.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // --- Smooth Scroll for Dive Button ---
  var btnDive = document.getElementById('hero-btn-dive');
  if (btnDive) {
    btnDive.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('what-is-hypergrid');
      if (target) {
        if (typeof Lenis !== 'undefined') {
          // If Lenis is active, use it for smooth scroll
          var lenisInstance = window.lenis || new Lenis();
          lenisInstance.scrollTo(target, { offset: 0, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // ════════════════════════════════════════════
  //  COUNTRY SEARCHABLE COMBOBOX
  // ════════════════════════════════════════════
  var COUNTRIES = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
    "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
    "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
    "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
    "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
    "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
    "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
    "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
    "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
    "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
    "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
    "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
    "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
    "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
    "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
    "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
    "Vietnam","Yemen","Zambia","Zimbabwe"
  ];

  var searchInput = document.getElementById('gf-country-search');
  var hiddenInput = document.getElementById('gf-country-value');
  var list = document.getElementById('gf-country-list');
  var group = document.getElementById('gf-country-group');

  if (searchInput && list) {
    var renderList = function (filter) {
      var term = (filter || '').toLowerCase().trim();
      var matches = term ? COUNTRIES.filter(function(c){ return c.toLowerCase().indexOf(term) !== -1; }) : COUNTRIES;
      list.innerHTML = '';
      matches.forEach(function(country) {
        var li = document.createElement('li');
        li.textContent = country;
        li.setAttribute('role','option');
        li.addEventListener('mousedown', function(e) {
          e.preventDefault();
          selectCountry(country);
        });
        list.appendChild(li);
      });
      list.classList.toggle('open', matches.length > 0);
      searchInput.setAttribute('aria-expanded', matches.length > 0 ? 'true' : 'false');
    };

    var selectCountry = function (country) {
      searchInput.value = country;
      hiddenInput.value = country;
      group.classList.add('is-filled');
      list.classList.remove('open');
      searchInput.setAttribute('aria-expanded', 'false');
    };

    searchInput.addEventListener('input', function() {
      hiddenInput.value = '';
      group.classList.toggle('is-filled', !!searchInput.value);
      renderList(searchInput.value);
    });

    searchInput.addEventListener('focus', function() {
      renderList(searchInput.value);
    });

    searchInput.addEventListener('blur', function() {
      setTimeout(function() {
        list.classList.remove('open');
        searchInput.setAttribute('aria-expanded', 'false');
        if (hiddenInput.value === '' && searchInput.value !== '') {
          var exact = COUNTRIES.find(function(c){ return c.toLowerCase() === searchInput.value.toLowerCase(); });
          if (exact) { selectCountry(exact); } else { searchInput.value = ''; group.classList.remove('is-filled'); }
        }
      }, 150);
    });
  }

  // ════════════════════════════════════════════
  //  GET IN TOUCH FORM — FLOATING LABELS + UX
  // ════════════════════════════════════════════
  document.querySelectorAll('.gf-group--select .gf-select').forEach(function (sel) {
    function syncFilled() {
      sel.closest('.gf-group').classList.toggle('is-filled', !!sel.value);
    }
    sel.addEventListener('change', syncFilled);
    syncFilled();
  });

  document.querySelectorAll('.gf-textarea').forEach(function (ta) {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // ════════════════════════════════════════════
  //  GET IN TOUCH FORM — SUBMISSION
  // ════════════════════════════════════════════
  var form = document.getElementById('gitch-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn     = form.querySelector('.gf-btn');
      var btnText = btn.querySelector('span');
      var original = btnText.textContent;

      btn.disabled = true;
      btnText.textContent = 'Sending…';
      btn.classList.add('is-loading');

      var payload = {
        firstName: (document.getElementById('gf-first')         || {}).value || '',
        lastName:  (document.getElementById('gf-last')          || {}).value || '',
        email:     (document.getElementById('gf-email')         || {}).value || '',
        phone:     (document.getElementById('gf-phone')         || {}).value || '',
        company:   (document.getElementById('gf-company')       || {}).value || '',
        country:   (document.getElementById('gf-country-value') || {}).value || '',
        product:   (document.getElementById('gf-product')       || {}).value || '',
        message:   (document.getElementById('gf-message')       || {}).value || '',
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.ok) {
            btnText.textContent = 'Message Sent!';
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
            form.reset();
            form.querySelectorAll('.gf-group').forEach(function (g) { g.classList.remove('is-filled'); });
            var selProd = document.getElementById('gf-product');
            if (selProd) {
              selProd.value = 'hypergrid';
              selProd.closest('.gf-group').classList.add('is-filled');
            }
            setTimeout(function () {
              btnText.textContent = original;
              btn.disabled = false;
              btn.classList.remove('is-success');
            }, 4000);
          } else {
            throw new Error('Server error');
          }
        })
        .catch(function () {
          btnText.textContent = 'Failed — try again';
          btn.classList.remove('is-loading');
          btn.classList.add('is-error');
          setTimeout(function () {
            btnText.textContent = original;
            btn.disabled = false;
            btn.classList.remove('is-error');
          }, 4000);
        });
    });
  }

  // --- Initialize Lenis if available ---
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;

    // Anchor links smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        }
      });
    });
  }

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

})();

// ════════════════════════════════════════════
//  GAME MODES V2 — HOVER INTERACTION
// ════════════════════════════════════════════
(function () {
  var MODES = [
    {
      name: 'Escape the Lava',
      img:  'images/hyper-grid/modes/escape-the-lava.jpg',
      // desc: 'Tiles are turning lava-red. Step on them and you\'re out. Race across the surviving tiles until only one player remains standing.',
    },
    {
      name: 'Find that Color',
      img:  'images/hyper-grid/modes/find-the-color.jpg',
      // desc: 'The grid flashes a colour — find it and stomp it fast. Miss it and lose a life. Rounds get quicker until only the sharpest eyes survive.',
    },
    {
      name: 'Sharp Shooter',
      img:  'images/hyper-grid/modes/sharp-shooter.jpg',
      // desc: 'Glowing targets appear across the grid. Hit them all before the timer runs out. Both precision and speed count.',
    },
    {
      name: 'Red Light Green Light',
      img:  'images/hyper-grid/modes/red-light-green-light.jpg',
      // desc: 'On green, move across the grid. On red, freeze completely. Any movement when you shouldn\'t ends the game.',
    },
    {
      name: 'Football',
      img:  'images/hyper-grid/modes/football.png',
      // desc: 'Two teams face off on the grid. Pass, dribble, and shoot by stomping the right tiles. Strategy meets speed in the ultimate multiplayer face-off.',
    },
  ];

  var imgEl  = document.getElementById('hg-mode-img');
  var nameEl = document.getElementById('hg-mode-name');
  var descEl = document.getElementById('hg-mode-desc');
  var items  = document.querySelectorAll('.hg-mode-item');

  if (!imgEl || !items.length) return;

  var current = 0;

  function activate(idx) {
    if (idx === current) return;
    current = idx;
    var m = MODES[idx];

    // Crossfade the preview image
    imgEl.style.opacity = '0';
    setTimeout(function () {
      imgEl.src = m.img;
      imgEl.alt = m.name;
      imgEl.style.opacity = '1';
    }, 300);

    // Update left-panel text
    nameEl.textContent = m.name;
    descEl.textContent = m.desc;

    // Toggle active state on rows
    items.forEach(function (item, i) {
      item.classList.toggle('hg-mode-item--active', i === idx);
    });
  }

  items.forEach(function (item, i) {
    item.addEventListener('mouseenter', function () { activate(i); });
  });
}());

// ════════════════════════════════════════════
//  HOW IT WORKS — PROCESS STEP SWITCHER
// ════════════════════════════════════════════
(function () {
  var STEPS = [
    {
      name: 'Tap the Card',
      desc: 'Comes integrated with your card reader / coin slot machine.',
    },
    {
      name: 'Select the Game',
      desc: 'Use our touch-operated software to select your game.',
    },
    {
      name: 'Enter Grid & Watch Tutorial',
      desc: 'Players enter the grid to start the tutorial video.',
    },
    {
      name: 'Play, Enjoy & Repeat',
      desc: 'Can you beat the grid?',
    },
  ];

  var slides = document.querySelectorAll('[data-step-slide]');
  var btns   = document.querySelectorAll('[data-step-btn]');
  var nameEl = document.getElementById('hg-process-name');
  var descEl = document.getElementById('hg-process-desc');

  if (!slides.length || !btns.length) return;

  var current = 0;

  function activateStep(idx) {
    if (idx === current) return;
    slides[current].classList.remove('hg-process-slide--active');
    btns[current].classList.remove('hg-process-btn--active');
    current = idx;
    slides[current].classList.add('hg-process-slide--active');
    btns[current].classList.add('hg-process-btn--active');
    if (nameEl) nameEl.textContent = STEPS[idx].name;
    if (descEl) descEl.textContent = STEPS[idx].desc;
  }

  btns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { activateStep(i); });
  });
}());

// ════════════════════════════════════════════
//  ROI CALCULATOR
// ════════════════════════════════════════════
(function () {
  if (typeof Chart === 'undefined') return;

  var floor      = document.getElementById('calc-floor');
  var footfall   = document.getElementById('calc-footfall');
  var hours      = document.getElementById('calc-hours');
  var ticket     = document.getElementById('calc-ticket');
  var conversion = document.getElementById('calc-conversion');

  if (!floor) return;

  var valFloor      = document.getElementById('val-floor');
  var valFootfall   = document.getElementById('val-footfall');
  var valTicket     = document.getElementById('val-ticket');
  var valConversion = document.getElementById('val-conversion');

  var mInvestment = document.getElementById('m-investment');
  var mMonthly    = document.getElementById('m-monthly');
  var mPayback    = document.getElementById('m-payback');
  var mRoi        = document.getElementById('m-roi');

  var dPlayers = document.getElementById('d-players');
  var dRevenue = document.getElementById('d-revenue');
  var dHourly  = document.getElementById('d-hourly');

  var sharedDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.6)',
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
        border: { display: false }
      }
    }
  };

  var lineChart = new Chart(document.getElementById('chart-cumulative').getContext('2d'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 60 }, function (_, i) {
        return (i + 1) % 12 === 0 ? 'Y' + ((i + 1) / 12) : '';
      }),
      datasets: [{
        data: [],
        borderColor: '#F05023',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.3,
      }]
    },
    options: JSON.parse(JSON.stringify(sharedDefaults))
  });

  lineChart.options.plugins.tooltip.callbacks = {
    label: function (ctx) { return '₹' + ctx.parsed.y.toFixed(1) + 'L'; },
    title: function (ctx) { return 'Month ' + (ctx[0].dataIndex + 1); }
  };
  lineChart.update('none');

  var barChart = new Chart(document.getElementById('chart-revenue').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Product Cost', 'Monthly Rev.', 'Yearly Rev.', '5-Year Rev.'],
      datasets: [{
        data: [],
        backgroundColor: ['rgba(240,80,35,0.35)', '#F05023', '#F05023', '#F05023'],
        borderRadius: 3,
      }]
    },
    options: (function () {
      var opts = JSON.parse(JSON.stringify(sharedDefaults));
      opts.indexAxis = 'y';
      return opts;
    }())
  });

  barChart.options.plugins.tooltip.callbacks = {
    label: function (ctx) { return '₹' + ctx.parsed.x.toFixed(1) + 'L'; }
  };
  barChart.update('none');

  function fmt(lakhs) {
    return '₹' + lakhs.toFixed(1) + 'L';
  }

  function recalc() {
    var floorVal      = parseInt(floor.value);
    var footfallVal   = parseInt(footfall.value);
    var hoursVal      = parseInt(hours.value);
    var ticketVal     = parseInt(ticket.value);
    var conversionVal = parseInt(conversion.value);

    valFloor.textContent      = floorVal;
    valFootfall.textContent   = footfallVal;
    valTicket.textContent     = '₹' + ticketVal;
    valConversion.textContent = conversionVal + '%';

    var productCost    = floorVal * 2500;
    var dailyPlayers   = footfallVal * (conversionVal / 100);
    var dailyRevenue   = dailyPlayers * ticketVal;
    var monthlyRevenue = dailyRevenue * 30;
    var yearlyRevenue  = monthlyRevenue * 12;
    var paybackMonths  = monthlyRevenue > 0 ? Math.ceil(productCost / monthlyRevenue) : 0;
    var fiveYearProfit = (yearlyRevenue * 5) - productCost;
    var roi            = productCost > 0 ? ((fiveYearProfit / productCost) * 100) : 0;

    mInvestment.textContent = fmt(productCost / 100000);
    mMonthly.textContent    = fmt(monthlyRevenue / 100000);
    mPayback.textContent    = paybackMonths + ' mo';
    mRoi.textContent        = roi.toFixed(0) + '%';

    dPlayers.textContent = Math.round(dailyPlayers);
    dRevenue.textContent = '₹' + Math.round(dailyRevenue).toLocaleString('en-IN');
    dHourly.textContent  = Math.round(dailyPlayers / hoursVal);

    lineChart.data.datasets[0].data = Array.from({ length: 60 }, function (_, i) {
      return ((monthlyRevenue * (i + 1)) - productCost) / 100000;
    });
    lineChart.update('none');

    barChart.data.datasets[0].data = [
      productCost / 100000,
      monthlyRevenue / 100000,
      yearlyRevenue / 100000,
      (yearlyRevenue * 5) / 100000
    ];
    barChart.update('none');
  }

  floor.addEventListener('input', recalc);
  footfall.addEventListener('input', recalc);
  hours.addEventListener('change', recalc);
  ticket.addEventListener('input', recalc);
  conversion.addEventListener('input', recalc);

  recalc();
}());

// ════════════════════════════════════════════
//  TESTIMONIALS CAROUSEL
// ════════════════════════════════════════════
(function () {
  var qEl    = document.getElementById('test-quote-text');
  var sEl    = document.getElementById('test-sub-text');
  var nEl    = document.getElementById('test-name-text');
  var rEl    = document.getElementById('test-role-text');
  var logoEl = document.getElementById('test-logo-img');
  var imgEl  = document.querySelector('.test-person-img');
  var grid   = document.querySelector('.test-grid');
  var content = document.querySelector('.testimonial-content');

  if (!qEl || !grid) return;

  var testimonials = [];
  var cur = 0, busy = false;
  var autoTimer;

  function show(idx, dir) {
    if (busy || !testimonials.length) return;
    busy = true;
    var xOut = dir === 'prev' ?  48 : -48;
    var xIn  = dir === 'prev' ? -48 :  48;
    gsap.to(imgEl, { opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(content, { x: xOut, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: function () {
      var t = testimonials[idx];
      qEl.textContent = t.quote || '';
      sEl.textContent = t.sub   || '';
      nEl.textContent = t.name  || '';
      rEl.textContent = (t.designation || '') + (t.company ? ', ' + t.company : '');
      if (logoEl) { logoEl.src = t.logo || ''; logoEl.alt = t.logoAlt || ''; }
      if (imgEl)  {
        imgEl.src = t.image || '';
        imgEl.onload = function () { gsap.to(imgEl, { opacity: 1, duration: 0.25, ease: 'power2.out' }); };
        if (imgEl.complete) { gsap.to(imgEl, { opacity: 1, duration: 0.25, ease: 'power2.out' }); }
      }
      gsap.fromTo(content,
        { x: xIn, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.28, ease: 'power2.out', onComplete: function () { busy = false; } }
      );
    }});
  }

  function startAuto() { autoTimer = setInterval(function () { cur = (cur + 1) % testimonials.length; show(cur, 'next'); }, 4000); }
  function stopAuto()  { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  function init(data) {
    testimonials = data;
    cur = 0;
    var t = testimonials[0];
    if (!t) return;
    qEl.textContent = t.quote || '';
    sEl.textContent = t.sub   || '';
    nEl.textContent = t.name  || '';
    rEl.textContent = (t.designation || '') + (t.company ? ', ' + t.company : '');
    if (logoEl) { logoEl.src = t.logo || ''; logoEl.alt = t.logoAlt || ''; }
    if (imgEl)  { imgEl.src = t.image || ''; }
    startAuto();
  }

  function parseOperators(raw) {
    var arr = [];
    var re  = /<!--OPERATOR-->([\s\S]*?)<!--ENDOPERATOR-->/g;
    var match;
    while ((match = re.exec(raw)) !== null) {
      var meta = {};
      match[1].trim().split('\n').forEach(function (line) {
        line = line.trim();
        var pos = line.indexOf(':');
        if (pos === -1) return;
        meta[line.substring(0, pos).trim()] = line.substring(pos + 1).trim().replace(/^["']|["']$/g, '');
      });
      if (meta.id) arr.push(meta);
    }
    return arr;
  }

  fetch('OPERATORS.md')
    .then(function (r) { return r.text(); })
    .then(function (raw) { init(parseOperators(raw)); })
    .catch(function () {});

  grid.addEventListener('mouseenter', stopAuto);
  grid.addEventListener('mouseleave', startAuto);

  document.getElementById('test-prev').addEventListener('click', function () {
    cur = (cur - 1 + testimonials.length) % testimonials.length;
    show(cur, 'prev');
    resetAuto();
  });
  document.getElementById('test-next').addEventListener('click', function () {
    cur = (cur + 1) % testimonials.length;
    show(cur, 'next');
    resetAuto();
  });
}());
