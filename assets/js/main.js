/* ════════════════════════════════════════════════════════════
   MONLEBU COOKIES — comportamento
   LRGZ · lrgz.com.br
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══ Ajustes rápidos ═══════════════════════════════════════
     TRILHA.autostart:
       'off'   — a trilha só toca se o visitante apertar play. É o padrão,
                 e é de propósito: o embed do Spotify roda numa moldura de
                 outro domínio e não deixa o site ajustar o volume dela.
                 Sem controle de volume, começar sozinha significa começar
                 no volume do aparelho — alto demais, e assusta.
       'sala'  — começa ao chegar na Sala III (depois do primeiro toque
                 do visitante na página, como os navegadores exigem).
       'gesto' — começa no primeiro clique/toque em qualquer lugar do site.
     ═════════════════════════════════════════════════════════ */
  var TRILHA = {
    autostart: 'off',
    playlist: '1uchC57iReiHSt9jHB1esq'
  };

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isCoarse = window.matchMedia('(hover: none)').matches;
  var isNarrow = function () { return window.innerWidth <= 860; };
  /* Alguns webviews devolvem 0 aqui durante a abertura; nunca confiar cegamente */
  var viewportH = function () {
    return window.innerHeight || document.documentElement.clientHeight || 800;
  };

  /* ── Medidas vivas: altura da barra e da navegação ─────── */
  var nav = document.getElementById('nav');
  var ribbon = document.getElementById('ribbon');

  function measureChrome() {
    if (nav) root.style.setProperty('--nav-h', Math.round(nav.offsetHeight) + 'px');
    var rh = (ribbon && !ribbon.classList.contains('is-gone')) ? Math.round(ribbon.offsetHeight) : 0;
    root.style.setProperty('--ribbon-h', rh + 'px');
  }
  measureChrome();
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(measureChrome);
    if (nav) ro.observe(nav);
    if (ribbon) ro.observe(ribbon);
  } else {
    window.addEventListener('resize', measureChrome);
  }
  window.addEventListener('orientationchange', function () { setTimeout(measureChrome, 250); });

  /* ── Abertura ─────────────────────────────────────────── */
  (function boot() {
    document.querySelectorAll('[data-seq]').forEach(function (el) {
      el.style.setProperty('--i', el.getAttribute('data-seq'));
    });
    document.querySelectorAll('.drawer__nav a').forEach(function (el, i) {
      el.style.setProperty('--i', i + 1);
    });

    var done = false;
    var open = function () {
      if (done) return;
      done = true;
      root.classList.add('is-loaded');
      measureChrome();
      setTimeout(function () {
        var l = document.getElementById('loader');
        if (l) l.remove();
      }, 900);
    };

    if (reduce.matches) { open(); return; }
    window.addEventListener('load', function () { setTimeout(open, 380); });
    setTimeout(open, 2600); // rede lenta não trava a entrada
  })();

  /* ── Ano no rodapé ────────────────────────────────────── */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ── Barra do cupom (a escolha do visitante é lembrada) ── */
  (function ribbonBar() {
    var close = document.getElementById('ribbonClose');
    if (!ribbon || !close) return;

    var KEY = 'monlebu:cupom';
    try {
      if (window.localStorage && localStorage.getItem(KEY) === 'off') {
        ribbon.classList.add('is-gone');
        measureChrome();
      }
    } catch (e) {}

    close.addEventListener('click', function () {
      ribbon.classList.add('is-gone');
      measureChrome();
      try { if (window.localStorage) localStorage.setItem(KEY, 'off'); } catch (e) {}
    });
  })();

  /* ── Menu mobile ──────────────────────────────────────── */
  var drawerOpen = false;
  (function drawer() {
    var burger = document.getElementById('burger');
    var panel = document.getElementById('drawer');
    if (!burger || !panel) return;

    var scrollLock = 0;
    var closeTimer = null;

    function focusables() {
      return Array.prototype.slice.call(
        panel.querySelectorAll('a[href], button:not([disabled])')
      );
    }

    function set(open) {
      drawerOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      clearTimeout(closeTimer);

      if (open) {
        scrollLock = window.scrollY;
        document.body.classList.add('is-locked');
        document.body.style.position = 'fixed';
        document.body.style.top = (-scrollLock) + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        panel.hidden = false;
        // Força o cálculo de layout para a transição pegar o estado inicial.
        // Não usa requestAnimationFrame: se os quadros estiverem represados,
        // o menu abriria invisível.
        void panel.offsetWidth;
        panel.classList.add('is-open');
      } else {
        panel.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollLock);
        closeTimer = setTimeout(function () { panel.hidden = true; }, 420);
      }
    }

    burger.addEventListener('click', function () {
      set(burger.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) set(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!drawerOpen) return;
      if (e.key === 'Escape') { set(false); burger.focus(); return; }
      if (e.key !== 'Tab') return;
      // O foco não escapa do menu enquanto ele está aberto
      var items = focusables();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === burger)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); burger.focus();
      }
    });

    // Se a tela crescer até o menu de desktop, o painel não pode ficar aberto
    window.addEventListener('resize', function () {
      if (drawerOpen && window.innerWidth > 860) set(false);
    });
  })();

  /* ── Títulos em linhas ────────────────────────────────── */
  (function splitLines() {
    if (reduce.matches) return;
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));
    if (!targets.length) return;

    targets.forEach(function (el) { el.dataset.raw = el.textContent.trim(); });

    function build(el) {
      var words = el.dataset.raw.split(/\s+/);
      el.textContent = '';
      var frag = document.createDocumentFragment();
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w + (i < words.length - 1 ? ' ' : '');
        frag.appendChild(s);
      });
      el.appendChild(frag);

      // agrupa por linha real
      var rows = [], current = null, top = null;
      el.querySelectorAll('.w').forEach(function (w) {
        var t = Math.round(w.offsetTop);
        if (top === null || Math.abs(t - top) > 4) { current = []; rows.push(current); top = t; }
        current.push(w);
      });

      el.textContent = '';
      rows.forEach(function (row, i) {
        var line = document.createElement('span');
        line.className = 'line';
        var inner = document.createElement('span');
        inner.style.setProperty('--l', i);
        row.forEach(function (w) { inner.appendChild(document.createTextNode(w.textContent)); });
        line.appendChild(inner);
        el.appendChild(line);
      });
    }

    function buildAll() { targets.forEach(build); }
    buildAll();

    // As fontes mudam a quebra de linha: refaz quando elas terminam de carregar
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { buildAll(); });
    }

    var t, w = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - w) < 60) return;
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(buildAll, 220);
    });
  })();

  /* ── Revelações e estado da navegação ─────────────────── */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  reveals.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  if (reduce.matches) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    reveals = [];
  }

  /* Revelações, estado da barra e sala atual.
     Fica fora do requestAnimationFrame de propósito: em aba de fundo,
     modo de economia de bateria ou webview que segura os quadros, o
     conteúdo jamais pode ficar invisível. */
  var navPrevY = window.scrollY;
  var navPinned = false; // durante uma navegação por âncora a barra fica visível
  (function uiEngine() {
    var last = 0;
    var timer = null;

    function sweep() {
      last = Date.now();
      var sy = window.scrollY;

      /* Qualquer coisa que já passou do limiar entra — mesmo que o
         visitante tenha voado pela página num único gesto. */
      if (reveals.length) {
        var limit = viewportH() * 0.9;
        for (var i = reveals.length - 1; i >= 0; i--) {
          if (reveals[i].getBoundingClientRect().top < limit) {
            reveals[i].classList.add('is-in');
            reveals.splice(i, 1);
          }
        }
      }

      /* A barra ganha fundo ao sair do topo e some ao descer */
      if (nav) {
        nav.classList.toggle('is-solid', sy > 40);
        if (!drawerOpen && !navPinned) {
          nav.classList.toggle('is-hidden', sy > navPrevY && sy > 260);
        }
      }

      /* Sala atual em destaque no menu */
      if (sections.length) {
        var best = -1, bestTop = -Infinity;
        var mark = viewportH() * 0.35;
        for (var s = 0; s < sections.length; s++) {
          if (!sections[s]) continue;
          var top = sections[s].getBoundingClientRect().top;
          if (top <= mark && top > bestTop) { bestTop = top; best = s; }
        }
        navLinks.forEach(function (a, k) {
          var on = k === best;
          a.classList.toggle('is-current', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }

      navPrevY = sy;
      if (!reveals.length && timer) { clearInterval(timer); timer = null; }
    }

    if (reveals.length) timer = setInterval(sweep, 400);

    window.addEventListener('scroll', function () {
      if (Date.now() - last > 80) sweep();
    }, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    window.addEventListener('load', sweep);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sweep);
    sweep();
    setTimeout(sweep, 600);
    setTimeout(sweep, 1800);
  })();

  /* ── Botões magnéticos ────────────────────────────────── */
  (function magnet() {
    if (reduce.matches || isCoarse) return;
    document.querySelectorAll('.js-magnet').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var yy = (e.clientY - r.top - r.height / 2) * 0.32;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.setProperty('--mx', x.toFixed(1) + 'px');
          el.style.setProperty('--my', yy.toFixed(1) + 'px');
        });
      });
      el.addEventListener('pointerleave', function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  })();

  /* ── Aberto agora? (Qua–Dom, 12h–18h, horário de SP) ──── */
  (function hours() {
    var box = document.getElementById('status');
    var label = document.getElementById('statusLabel');
    if (!box || !label) return;

    var DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    var OPEN_DAYS = [3, 4, 5, 6, 0]; // qua, qui, sex, sáb, dom
    var FROM = 12, TO = 18;

    function saoPaulo() {
      try {
        var parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Sao_Paulo',
          weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
        }).formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
        var h = parseInt(map.hour, 10);
        return { day: idx, hour: h === 24 ? 0 : h, min: parseInt(map.minute, 10) };
      } catch (err) {
        var d = new Date();
        return { day: d.getDay(), hour: d.getHours(), min: d.getMinutes() };
      }
    }

    function nextOpenDay(from) {
      for (var i = 1; i <= 7; i++) {
        var d = (from + i) % 7;
        if (OPEN_DAYS.indexOf(d) !== -1) return d;
      }
      return 3;
    }

    function paint() {
      var now = saoPaulo();
      var opensToday = OPEN_DAYS.indexOf(now.day) !== -1;
      var isOpen = opensToday && now.hour >= FROM && now.hour < TO;

      box.classList.remove('is-open', 'is-closed');
      if (isOpen) {
        box.classList.add('is-open');
        label.textContent = 'Aberto agora · até as ' + TO + 'h';
      } else if (opensToday && now.hour < FROM) {
        box.classList.add('is-closed');
        label.textContent = 'Abre hoje às ' + FROM + 'h';
      } else {
        box.classList.add('is-closed');
        var d = nextOpenDay(now.day);
        label.textContent = 'Fechado · abre ' + DAYS[d] + ' às ' + FROM + 'h';
      }
    }

    paint();
    setInterval(paint, 60000); // a placa vira sozinha na hora de abrir
  })();

  /* ── Âncoras internas ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      // A barra some ao descer; durante a navegação ela fica visível
      navPinned = true;
      if (nav) nav.classList.remove('is-hidden');
      setTimeout(function () { navPinned = false; }, 900);

      if (target === document.getElementById('topo')) {
        window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
      } else {
        target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
      }

      // O leitor de tela precisa ir junto
      if (target.hasAttribute('tabindex') || /^(A|BUTTON|INPUT)$/.test(target.tagName)) {
        target.focus({ preventScroll: true });
      }
      history.replaceState(null, '', id);
    });
  });

  /* Link direto com #secao: reposiciona depois que as imagens acomodam */
  if (location.hash && location.hash.length > 1) {
    var deep = document.querySelector(location.hash);
    if (deep) {
      window.addEventListener('load', function () {
        setTimeout(function () { deep.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 120);
      });
    }
  }

  /* ── Pausa o vídeo fora da tela (bateria) ─────────────── */
  (function videoGuard() {
    var v = document.getElementById('heroVideo');
    if (!v || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.01 }).observe(v);
  })();

  /* ══ Sala III — a trilha ═══════════════════════════════════
     Nada toca sozinho: quem aperta o play é o visitante. Assim que
     ele aperta, um controle de pausa aparece no canto da tela e
     acompanha a rolagem pelas salas.
     ═════════════════════════════════════════════════════════ */
  (function trilha() {
    var mount = document.getElementById('spotifyMount');
    var pill = document.getElementById('trilhaPill');
    var toggle = document.getElementById('trilhaToggle');
    var dismiss = document.getElementById('trilhaDismiss');
    var note = document.getElementById('trilhaNote');
    var section = document.getElementById('trilha');
    if (!mount) return;

    var KEY = 'monlebu:trilha';
    var controller = null;
    var apiArrived = false;
    var playing = false;
    var started = false;
    var wantsPlay = false;
    var hasGesture = false;
    var stopped = false;

    try { stopped = window.sessionStorage && sessionStorage.getItem(KEY) === 'off'; } catch (e) {}

    function remember(v) {
      try { if (window.sessionStorage) sessionStorage.setItem(KEY, v); } catch (e) {}
    }

    function embedHeight() { return window.innerWidth <= 560 ? 152 : 352; }

    /* Se o script do Spotify não chegar (bloqueador, rede), o embed
       comum entra no lugar e a sala continua funcionando. */
    function fallbackEmbed() {
      if (apiArrived || mount.childElementCount) return;
      var f = document.createElement('iframe');
      f.title = 'Playlist Monlebu Cookies no Spotify';
      f.src = 'https://open.spotify.com/embed/playlist/' + TRILHA.playlist + '?utm_source=generator&theme=0';
      f.width = '100%';
      f.height = String(embedHeight());
      f.loading = 'lazy';
      f.style.border = '0';
      f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      mount.appendChild(f);
    }
    setTimeout(fallbackEmbed, 5000);

    function setPlaying(on) {
      playing = on;
      if (pill) {
        pill.classList.toggle('is-playing', on);
        if (toggle) {
          toggle.setAttribute('aria-pressed', String(on));
          toggle.setAttribute('aria-label', on ? 'Pausar a trilha' : 'Retomar a trilha');
        }
      }
    }

    function showPill() {
      if (note) note.hidden = false;
      if (!pill || !pill.hidden) return;
      pill.hidden = false;
      void pill.offsetWidth;
      pill.classList.add('is-in');
    }

    function tryStart() {
      if (!controller || started || stopped || TRILHA.autostart === 'off') return;
      if (!wantsPlay || !hasGesture) return;
      started = true;
      try { controller.play(); } catch (e) {}
      showPill();
    }

    function armGesture() {
      if (hasGesture) return;
      hasGesture = true;
      if (TRILHA.autostart === 'gesto') wantsPlay = true;
      tryStart();
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, armGesture, { once: true, passive: true, capture: true });
    });

    /* Chegou na Sala III */
    if (section && 'IntersectionObserver' in window && TRILHA.autostart === 'sala') {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { wantsPlay = true; tryStart(); }
        });
      }, { threshold: 0.35 }).observe(section);
    }

    /* "Ouvir a trilha" no hero é um pedido explícito */
    /* "Ouvir a trilha", no hero, apenas leva até a Sala III — quem
       aperta o play é o visitante. Só vale como pedido explícito de
       tocar se o autostart estiver ligado nos ajustes lá em cima. */
    var cta = document.querySelector('.js-trilha-cta');
    if (cta && TRILHA.autostart !== 'off') {
      cta.addEventListener('click', function () {
        stopped = false; remember('on');
        wantsPlay = true; hasGesture = true;
        setTimeout(tryStart, 700);
      });
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (!controller) return;
        if (playing) { controller.pause(); stopped = true; remember('off'); }
        else { controller.resume(); stopped = false; remember('on'); }
      });
    }

    if (dismiss) {
      dismiss.addEventListener('click', function () {
        if (controller) { try { controller.pause(); } catch (e) {} }
        stopped = true; remember('off');
        if (pill) {
          pill.classList.remove('is-in');
          setTimeout(function () { pill.hidden = true; }, 500);
        }
      });
    }

    window.onSpotifyIframeApiReady = function (IFrameAPI) {
      apiArrived = true;
      var host = document.createElement('div');
      mount.appendChild(host);

      IFrameAPI.createController(
        host,
        { uri: 'spotify:playlist:' + TRILHA.playlist, width: '100%', height: embedHeight() },
        function (ctrl) {
          controller = ctrl;

          ctrl.addListener('playback_update', function (e) {
            if (!e || !e.data) return;
            var on = !e.data.isPaused;
            if (on) showPill();
            setPlaying(on);
          });

          tryStart();
        }
      );
    };
  })();

})();
