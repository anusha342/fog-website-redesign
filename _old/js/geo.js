// ════════════════════════════════════════════
//  GEO.JS — GeoIP detection, regional logos,
//           testimonial ordering, language
// ════════════════════════════════════════════

(function () {
  'use strict';

  // Country code → region mapping
  var REGION_MAP = {
    IN: 'india',
    AE: 'gulf', SA: 'gulf', QA: 'gulf', KW: 'gulf', BH: 'gulf', OM: 'gulf', YE: 'gulf',
    AU: 'australia', NZ: 'australia'
  };

  // Language to use per region
  var REGION_LANG = {
    gulf: 'ar'
  };

  function detectRegion() {
    // Check sessionStorage first (avoids repeat API calls within same session)
    var cached = sessionStorage.getItem('fogRegion');
    if (cached) return Promise.resolve(cached);

    return fetch('https://ip-api.com/json/?fields=countryCode')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var region = REGION_MAP[data.countryCode] || 'global';
        sessionStorage.setItem('fogRegion', region);
        return region;
      })
      .catch(function () {
        return 'global';
      });
  }

  // ── LOGOS ──────────────────────────────────
  function applyRegionToLogos(region) {
    document.querySelectorAll('.marquee-track img[data-regions]').forEach(function (img) {
      var regions = img.getAttribute('data-regions').split(',').map(function (s) { return s.trim(); });
      var visible = regions.indexOf(region) !== -1 || regions.indexOf('global') !== -1;
      img.style.display = visible ? '' : 'none';
    });
  }

  // ── TESTIMONIALS ────────────────────────────
  function sortOperatorsByRegion(operators, region) {
    if (region === 'global') return operators;
    return operators.slice().sort(function (a, b) {
      var aMatch = a.region === region ? 0 : 1;
      var bMatch = b.region === region ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  function applyRegionToTestimonials(operators, region) {
    var sorted = sortOperatorsByRegion(operators, region);
    window._fogOperators = sorted;
    if (typeof window._fogInitCarousel === 'function') {
      window._fogInitCarousel(sorted);
    }
  }

  // ── LANGUAGE ───────────────────────────────
  function applyLanguage(region) {
    var lang = REGION_LANG[region] || 'en';
    if (lang === 'en') return; // English is default, no fetch needed

    fetch('lang/' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (strings) {
        // Apply to elements with data-lang-key attribute
        Object.keys(strings).forEach(function (key) {
          var el = document.querySelector('[data-lang-key="' + key + '"]');
          if (el) el.textContent = strings[key];
        });
        // RTL for Arabic
        if (lang === 'ar') {
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('lang', 'ar');
        }
      })
      .catch(function () { /* language file not found, stay in English */ });
  }

  // ── MAIN ───────────────────────────────────
  detectRegion().then(function (region) {
    window._fogRegion = region;

    applyRegionToLogos(region);
    applyLanguage(region);

    // If operators data is already fetched by main.js, sort and re-init carousel
    if (window._fogRawOperators) {
      applyRegionToTestimonials(window._fogRawOperators, region);
    } else {
      // Fetch operators here with fallback and let main.js use window._fogOperators when it arrives
      async function loadOperatorsData() {
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

      loadOperatorsData()
        .then(function (data) {
          window._fogRawOperators = data;
          applyRegionToTestimonials(data, region);
        })
        .catch(function (err) {
          console.error('Error fetching operators in geo.js:', err);
        });
    }
  });

}());
