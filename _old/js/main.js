// ════════════════════════════════════════════
//  COUNTRY SEARCHABLE COMBOBOX
// ════════════════════════════════════════════
(function () {
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
  if (!searchInput || !list) return;

  function renderList(filter) {
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
  }

  function selectCountry(country) {
    searchInput.value = country;
    hiddenInput.value = country;
    group.classList.add('is-filled');
    list.classList.remove('open');
    searchInput.setAttribute('aria-expanded', 'false');
  }

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
      // If typed text doesn't match a valid country, clear it
      if (hiddenInput.value === '' && searchInput.value !== '') {
        var exact = COUNTRIES.find(function(c){ return c.toLowerCase() === searchInput.value.toLowerCase(); });
        if (exact) { selectCountry(exact); } else { searchInput.value = ''; group.classList.remove('is-filled'); }
      }
    }, 150);
  });
}());

// ════════════════════════════════════════════
//  GET IN TOUCH FORM — FLOATING LABELS + UX
// ════════════════════════════════════════════
(function () {
  // Floating label for select fields
  document.querySelectorAll('.gf-group--select .gf-select').forEach(function (sel) {
    function syncFilled() {
      sel.closest('.gf-group').classList.toggle('is-filled', !!sel.value);
    }
    sel.addEventListener('change', syncFilled);
    syncFilled();
  });

  // Auto-grow textarea
  document.querySelectorAll('.gf-textarea').forEach(function (ta) {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });
}());

// ════════════════════════════════════════════
//  GET IN TOUCH FORM — SUBMISSION
// ════════════════════════════════════════════
(function () {
  var form = document.getElementById('gitch-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn     = form.querySelector('.gf-btn');
    var btnText = btn.querySelector('span');
    var original = btnText.textContent;

    // Loading state
    btn.disabled = true;
    btnText.textContent = 'Sending…';
    btn.classList.add('is-loading');

    var payload = {
      firstName: (document.getElementById('gf-first')  || {}).value || '',
      lastName:  (document.getElementById('gf-last')   || {}).value || '',
      email:     (document.getElementById('gf-email')  || {}).value || '',
      phone:     (document.getElementById('gf-phone')  || {}).value || '',
      company:   (document.getElementById('gf-company')|| {}).value || '',
      country:   (document.getElementById('gf-country-value') || {}).value || '',
      product:   (document.getElementById('gf-product')|| {}).value || '',
      message:   (document.getElementById('gf-message')|| {}).value || '',
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
          // Reset floating-label states
          form.querySelectorAll('.gf-group').forEach(function (g) { g.classList.remove('is-filled'); });
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
}());

// ════════════════════════════════════════════
//  LENIS SMOOTH SCROLL + GSAP BRIDGE
// ════════════════════════════════════════════
(function(){
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Bridge Lenis scroll position → GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Anchor link smooth scroll via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ e.preventDefault(); lenis.scrollTo(target, {offset:0, duration:1.4}); }
    });
  });

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll('[data-reveal]');
  if(revealEls.length){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
    window._fogRevealObserver = obs;
  }
})();

// ════════════════════════════════════════════
//  GSAP — REGISTER SCROLLTRIGGER (used by footer reveal)
// ════════════════════════════════════════════
gsap.registerPlugin(ScrollTrigger);

// ════════════════════════════════════════════
//  NAVBAR — SCROLL SHOW/HIDE
// ════════════════════════════════════════════
(function(){
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Hide/Show navbar on scroll
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Don't hide navbar at the very top of the page
    if (currentScrollY <= 50) {
      navbar.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Don't hide navbar if mobile menu is open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      navbar.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Add a small tolerance/threshold of 5px to avoid jitter
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        navbar.classList.add('nav-hidden');
      } else {
        // Scrolling up
        navbar.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }
  }, { passive: true });
})();

// ════════════════════════════════════════════
//  HAMBURGER MENU
// ════════════════════════════════════════════
(function(){
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger-btn');
  const close = document.getElementById('mobile-close-btn');
  btn.addEventListener('click', () => { menu.classList.add('open'); btn.setAttribute('aria-expanded','true'); });
  close.addEventListener('click', () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }));
})();

// ════════════════════════════════════════════
//  ABOUT — WORD ANIMATION
// ════════════════════════════════════════════
(function(){
  const h = document.querySelector('.an-headline');
  if(!h) return;
  h.innerHTML = h.innerHTML.split(/(<br\s*\/?>)/gi).map(part => {
    if (part.toLowerCase().indexOf('<br') === 0) {
      return part;
    }
    return part.replace(/([a-zA-Z0-9'+%]+)/g, '<span class="word">$1</span>');
  }).join('');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        gsap.from(h.querySelectorAll('.word'), {y:24, opacity:0, duration:.6, stagger:.04, ease:'power2.out'});
        obs.disconnect();
      }
    });
  }, {threshold:.3});
  obs.observe(document.getElementById('about'));
})();

// ════════════════════════════════════════════
//  NUMBERS — COUNT-UP
// ════════════════════════════════════════════
(function(){
  const numEls = document.querySelectorAll('.an-num-value[data-count]');
  function countUp(el){
    const target=+el.dataset.count;
    const suffix=el.dataset.suffix||'';
    const fmt=el.dataset.format==='comma';
    const dur=1800;
    const start=performance.now();
    function update(now){
      const p=Math.min((now-start)/dur,1);
      const ease=1-Math.pow(1-p,3);
      const val=Math.round(ease*target);
      el.textContent=(fmt?val.toLocaleString():val)+suffix;
      if(p<1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){countUp(e.target);obs.unobserve(e.target);}
    });
  },{threshold:.5});
  numEls.forEach(el=>obs.observe(el));
})();

// ════════════════════════════════════════════
//  NUMBERS CARDS — FADE IN
// ════════════════════════════════════════════
(function(){
  const cards = document.querySelectorAll('.an-card');
  gsap.set(cards,{opacity:0,y:24});
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        gsap.to(cards,{opacity:1,y:0,duration:.6,stagger:.12,ease:'power2.out'});
        obs.disconnect();
      }
    });
  },{threshold:.3});
  obs.observe(document.getElementById('about'));
})();


// ════════════════════════════════════════════
//  MOMENTS AI BREAK — ANIMATION
// ════════════════════════════════════════════
(function(){
  const brk=document.getElementById('prod-moments-break');
  const headline=brk.querySelector('.break-headline');
  const aiWord=document.getElementById('ai-word');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        gsap.from(headline,{scale:.82,opacity:0,duration:.75,ease:'power3.out'});
        gsap.to(aiWord,{color:'#ff7a5a',duration:.3,delay:.2,yoyo:true,repeat:1});
        obs.disconnect();
      }
    });
  },{threshold:.4});
  obs.observe(brk);
})();

// ════════════════════════════════════════════
//  TESTIMONIALS — CAROUSEL (auto-slide + horizontal + per-person photo)
// ════════════════════════════════════════════
(function(){
  // Testimonials data — loaded from OPERATORS.md via API.
  // geo.js sorts this array by region before initCarousel() runs.
  let testimonials = [];
  let cur=0, busy=false;
  const qEl=document.getElementById('test-quote-text');
  const sEl=document.getElementById('test-sub-text');
  const nEl=document.getElementById('test-name-text');
  const rEl=document.getElementById('test-role-text');
  const logoEl=document.getElementById('test-logo-img');
  const content=document.querySelector('.testimonial-content');
  const imgEl=document.querySelector('.test-person-img');
  const grid=document.querySelector('.test-grid');

  if (!qEl || !grid) return;

  // Horizontal slide + image crossfade
  function show(idx, dir){
    if(busy||!testimonials.length) return;
    busy=true;
    const xOut = dir==='prev' ?  48 : -48;
    const xIn  = dir==='prev' ? -48 :  48;
    gsap.to(imgEl,{opacity:0, duration:.2, ease:'power2.in'});
    gsap.to(content,{x:xOut, opacity:0, duration:.22, ease:'power2.in', onComplete:()=>{
      const t=testimonials[idx];
      // Map API fields to carousel fields
      qEl.textContent  = t.quote || t.quote || '';
      sEl.textContent  = t.sub   || t.sub   || '';
      nEl.textContent  = t.name;
      rEl.textContent  = (t.designation||'') + (t.company ? ', ' + t.company : '') || t.role || '';
      if (logoEl) { logoEl.src=t.logo; logoEl.alt=t.logoAlt||''; }
      imgEl.src = t.image || t.img || '';
      imgEl.onload=()=>{ gsap.to(imgEl,{opacity:1, duration:.25, ease:'power2.out'}); };
      if(imgEl.complete){ gsap.to(imgEl,{opacity:1, duration:.25, ease:'power2.out'}); }
      gsap.fromTo(content,
        {x:xIn, opacity:0},
        {x:0, opacity:1, duration:.28, ease:'power2.out', onComplete:()=>{ busy=false; }}
      );
    }});
  }

  let autoTimer;
  function startAuto(){
    autoTimer=setInterval(()=>{
      cur=(cur+1)%testimonials.length;
      show(cur,'next');
    },4000);
  }
  function stopAuto(){ clearInterval(autoTimer); }
  function resetAuto(){ stopAuto(); startAuto(); }

  // Exposed so geo.js can call it after sorting
  window._fogInitCarousel = function(data) {
    testimonials = data;
    cur = 0;
    // Seed initial state without animation
    const t = testimonials[0];
    if (!t) return;
    qEl.textContent  = t.quote || '';
    sEl.textContent  = t.sub   || '';
    nEl.textContent  = t.name  || '';
    rEl.textContent  = (t.designation||'') + (t.company ? ', ' + t.company : '');
    if (logoEl) { logoEl.src=t.logo||''; logoEl.alt=t.logoAlt||''; }
    if (imgEl)  { imgEl.src=t.image||t.img||''; }
    startAuto();
  };

  grid.addEventListener('mouseenter', stopAuto);
  grid.addEventListener('mouseleave', startAuto);

  document.getElementById('test-prev').addEventListener('click',()=>{
    cur=(cur-1+testimonials.length)%testimonials.length;
    show(cur,'prev');
    resetAuto();
  });
  document.getElementById('test-next').addEventListener('click',()=>{
    cur=(cur+1)%testimonials.length;
    show(cur,'next');
    resetAuto();
  });

  // --- Load operators ---
  async function loadOperatorsData() {
    // Fetch and parse OPERATORS.md directly in client
    var res = await fetch('OPERATORS.md');
    var raw = await res.text();
    var opsArr = [];
    var opRegex = /<!--OPERATOR-->([\s\S]*?)<!--ENDOPERATOR-->/g;
    var match;
    while ((match = opRegex.exec(raw)) !== null) {
      var block = match[1].trim();
      if (block === '') continue;

      var meta = {};
      var lines = block.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === '') continue;
        var colonPos = line.indexOf(':');
        if (colonPos === -1) continue;
        var key = line.substring(0, colonPos).trim();
        var value = line.substring(colonPos + 1).trim();
        value = value.replace(/^["']|["']$/g, '');
        meta[key] = value;
      }

      if (!meta.id) continue;

      opsArr.push({
        id:          meta.id || '',
        name:        meta.name || '',
        designation: meta.designation || '',
        company:     meta.company || '',
        region:      meta.region || 'global',
        image:       meta.image || '',
        logo:        meta.logo || '',
        logoAlt:     meta.logoAlt || '',
        quote:       meta.quote || '',
        sub:         meta.sub || ''
      });
    }
    return opsArr;
  }

  // Fetch operators — geo.js will call window._fogInitCarousel(sortedData) after sorting.
  // If geo.js has already set window._fogOperators, use that; otherwise fetch directly.
  if (window._fogOperators) {
    window._fogInitCarousel(window._fogOperators);
  } else {
    loadOperatorsData()
      .then(function(data){
        // Store globally so geo.js can sort and re-init if it loads after us
        window._fogRawOperators = data;
        // If geo.js already ran and gave us sorted operators, use those
        if (window._fogOperators) {
          window._fogInitCarousel(window._fogOperators);
        } else {
          window._fogInitCarousel(data);
        }
      })
      .catch(function(err){
        console.error('Error rendering operators:', err);
      });
  }
})();

// ════════════════════════════════════════════
//  PRODUCT THUMBNAILS — BG SWAP + AUTO-ADVANCE
// ════════════════════════════════════════════
(function(){
  // Click-to-swap handler
  document.querySelectorAll('.prod-thumb').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const targetId=btn.dataset.target;
      const bg=btn.dataset.bg;
      const pos=btn.dataset.pos||'center';
      const bgEl=document.getElementById(targetId);
      if(!bgEl) return;
      gsap.to(bgEl,{opacity:0,duration:.2,onComplete:()=>{
        bgEl.style.backgroundImage=`url('${bg}')`;
        bgEl.style.backgroundPosition=pos;
        gsap.to(bgEl,{opacity:1,duration:.2});
      }});
      btn.closest('.product-section').querySelectorAll('.prod-thumb').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Auto-advance every 6 s for each product section
  ['prod-hypergrid','prod-lasertag','prod-lasermaze'].forEach(sectionId=>{
    const section=document.getElementById(sectionId);
    if(!section) return;
    const thumbs=section.querySelectorAll('.prod-thumb');
    if(thumbs.length<=1) return;
    let idx=0;
    setInterval(()=>{
      idx=(idx+1)%thumbs.length;
      thumbs[idx].click();
    },6000);
  });
})();

// ════════════════════════════════════════════
//  MOMENTS AI BREAK — CINEMATIC TRIGGER
// ════════════════════════════════════════════
(function(){
  const section = document.getElementById('prod-moments-break');
  if(!section) return;

  // Use GSAP ScrollTrigger — already loaded, works with sticky stack
  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    once: true,
    onEnter: function(){
      section.classList.add('mb-activated');
    }
  });
})();

// ════════════════════════════════════════════
//  ENDING SECTION — REVEAL AFTER 2 DOWNWARD
//  SCROLL EVENTS WHILE AT / PAST THE FOOTER
// ════════════════════════════════════════════
(function () {
  var ending     = document.getElementById('ending');
  var footerWrap = document.getElementById('footer-wrap');
  if (!ending || !footerWrap) return;

  var downCount = 0;
  var revealed  = false;

  function isPastFooter() {
    // Footer top has scrolled to within viewport
    return footerWrap.getBoundingClientRect().top <= window.innerHeight * 0.6;
  }

  window.addEventListener('wheel', function (e) {
    if (revealed) return;

    if (e.deltaY > 10) {           // meaningful downward scroll
      if (isPastFooter()) {
        downCount++;
        if (downCount >= 2) {
          revealed = true;
          ending.classList.add('is-revealed');
          // Smooth-scroll to show it
          setTimeout(function () {
            ending.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      }
    } else if (e.deltaY < -10) {   // scrolling back up → reset counter
      downCount = 0;
    }
  }, { passive: true });
}());

// ════════════════════════════════════════════
//  BLOG CARDS — dynamic render from BLOG.md
// ════════════════════════════════════════════
(function () {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function renderCards(posts) {
    var delays = [0, 0.12, 0.24];
    grid.innerHTML = posts.slice(0, 3).map(function (post, i) {
      var imgStyle = post.image
        ? 'style="background-image:url(\'' + post.image + '\');background-size:cover;background-position:center;"'
        : '';
      return '<article class="blog-card" tabindex="0" data-reveal data-reveal-delay="' + (delays[i] || 0) + '">' +
        '<a href="blog.html?post=' + encodeURIComponent(post.id) + '" class="blog-card-link" aria-label="Read: ' + post.title + '">' +
        '<div class="blog-img" ' + imgStyle + '></div>' +
        '<div class="blog-body">' +
        '<p class="blog-cat">' + post.category + '</p>' +
        '<h3 class="blog-title">' + post.title + '</h3>' +
        '<p class="blog-date">' + formatDate(post.date) + ' &middot; ' + post.readTime + ' min read</p>' +
        '<p class="blog-excerpt">' + post.excerpt + '</p>' +
        '<span class="blog-read">Read More &#x2192;</span>' +
        '</div></a></article>';
    }).join('');

    // Trigger scroll-reveal observer on new elements
    if (window._fogRevealObserver) {
      grid.querySelectorAll('[data-reveal]').forEach(function (el) {
        window._fogRevealObserver.observe(el);
      });
    }
  }

  // --- Load posts ---
  async function loadBlogPosts() {
    // Fetch and parse BLOG.md directly in client
    var res = await fetch('BLOG.md');
    var raw = await res.text();
    var postsArr = [];
    var postRegex = /<!--POST-->([\s\S]*?)<!--ENDPOST-->/g;
    var match;
    while ((match = postRegex.exec(raw)) !== null) {
      var block = match[1];
      var parts = block.split('<!--ENDMETA-->');
      if (parts.length < 2) continue;
      var metaBlock = parts[0].trim();
      var contentBlock = parts[1].trim();

      var meta = {};
      var lines = metaBlock.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === '') continue;
        var colonPos = line.indexOf(':');
        if (colonPos === -1) continue;
        var key = line.substring(0, colonPos).trim();
        var value = line.substring(colonPos + 1).trim();
        value = value.replace(/^["']|["']$/g, '');
        meta[key] = value;
      }

      if (!meta.id) continue;

      postsArr.push({
        id: meta.id || '',
        title: meta.title || '',
        category: meta.category || '',
        date: meta.date || '',
        readTime: meta.readTime ? parseInt(meta.readTime, 10) : 0,
        image: meta.image || '',
        excerpt: meta.excerpt || '',
        content: contentBlock
      });
    }
    return postsArr;
  }

  loadBlogPosts()
    .then(renderCards)
    .catch(function (err) {
      console.error('Error rendering homepage blog:', err);
      grid.innerHTML = '<p class="blog-error">Could not load posts. Please refresh.</p>';
    });
}());
