// ════════════════════════════════════════════
//  BLOG PAGE — tab navigation + content render
// ════════════════════════════════════════════

(function () {
  'use strict';

  var tabsInner   = document.getElementById('blog-tabs-inner');
  var contentEl   = document.getElementById('blog-content-inner');
  var posts       = [];
  var activeIdx   = 0;

  // --- Navbar scroll hide/show (same as main.js) ---
  var navbar  = document.getElementById('navbar');
  var lastY   = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y < 50) {
      navbar.classList.remove('nav--hidden');
    } else if (y > lastY + 5) {
      navbar.classList.add('nav--hidden');
    } else if (y < lastY - 5) {
      navbar.classList.remove('nav--hidden');
    }
    lastY = y;
  }, { passive: true });

  // --- Mobile menu ---
  var hamburger  = document.getElementById('hamburger-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileClose= document.getElementById('mobile-close-btn');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
    });
    mobileClose.addEventListener('click', function () {
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Helpers ---
  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function slugFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('post') || '';
  }

  function setActiveTab(idx) {
    activeIdx = idx;
    // Update tab states
    tabsInner.querySelectorAll('.blog-tab').forEach(function (t, i) {
      t.classList.toggle('is-active', i === idx);
      t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    renderContent(posts[idx]);
    // Update URL without reloading
    var post = posts[idx];
    if (post && history.replaceState) {
      history.replaceState(null, '', '?post=' + encodeURIComponent(post.id));
    }
    // Scroll content to top on tab switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderTabs(postsArr) {
    tabsInner.innerHTML = '';
    postsArr.forEach(function (post, i) {
      var btn = document.createElement('button');
      btn.className = 'blog-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('data-idx', i);

      btn.innerHTML =
        '<span class="blog-tab-cat">' + post.category + '</span>' +
        '<span class="blog-tab-title">' + post.title + '</span>' +
        '<span class="blog-tab-meta">' + formatDate(post.date) + ' &middot; ' + post.readTime + ' min read</span>';

      btn.addEventListener('click', function () { setActiveTab(i); });
      tabsInner.appendChild(btn);
    });
  }

  function renderContent(post) {
    if (!post) {
      contentEl.innerHTML = '<p class="blog-content-empty">No post selected.</p>';
      return;
    }

    // Use marked.js to convert markdown → HTML
    var htmlContent = (typeof marked !== 'undefined')
      ? marked.parse(post.content)
      : post.content.replace(/\n/g, '<br>');

    contentEl.innerHTML =
      '<header class="blog-post-header">' +
        '<p class="blog-post-cat">' + post.category + '</p>' +
        '<h1 class="blog-post-title">' + post.title + '</h1>' +
        '<p class="blog-post-meta">' + formatDate(post.date) + ' &nbsp;&middot;&nbsp; ' + post.readTime + ' min read</p>' +
        (post.image ? '<div class="blog-post-cover" style="background-image:url(\'' + post.image + '\')"></div>' : '') +
      '</header>' +
      '<div class="blog-post-body">' + htmlContent + '</div>' +
      '<div class="blog-post-cta">' +
        '<a href="index.html#get-in-touch" class="blog-cta-btn">Get In Touch <span aria-hidden="true">&#x2192;</span></a>' +
      '</div>';
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
    .then(function (data) {
      posts = data;
      if (!posts.length) {
        tabsInner.innerHTML = '<p class="blog-tabs-empty">No posts yet.</p>';
        return;
      }

      renderTabs(posts);

      // Auto-select from ?post= query param
      var slug = slugFromQuery();
      var initIdx = 0;
      if (slug) {
        var found = posts.findIndex(function (p) { return p.id === slug; });
        if (found !== -1) initIdx = found;
      }
      setActiveTab(initIdx);
    })
    .catch(function (err) {
      console.error('Error rendering blog:', err);
      tabsInner.innerHTML = '<p class="blog-tabs-error">Could not load posts.</p>';
      contentEl.innerHTML = '<p class="blog-content-empty">Please refresh the page.</p>';
    });

}());
