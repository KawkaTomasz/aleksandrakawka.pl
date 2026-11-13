/* Aleksandra Kawka – interakcje strony. Bez zależności, ładowany z `defer`. */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Bieżący rok w stopce
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  // ---------- Menu mobilne ----------
  const toggle = $('.menu-toggle');
  const menu = $('#menu-mobilne');
  if (toggle && menu) {
    const setMenu = (open, returnFocus = false) => {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      if (!open && returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
    });
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 75em)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  // ---------- Hero: karuzela zdjęć (przełącza się sama) ----------
  // Przy „ogranicz ruch” w systemie nie przewija się sama – zostają tylko wskaźniki.
  // Zatrzymuje się, gdy karta przeglądarki jest w tle.
  const heroSlides = $$('[data-hero-slide]');
  const heroDots = $('[data-hero-dots]');
  if (heroSlides.length > 1 && heroDots) {
    const INTERVAL = 6000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let timer = 0;

    heroDots.setAttribute('role', 'group');
    heroDots.setAttribute('aria-label', 'Zdjęcia w tle');
    const dots = heroSlides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero__dot';
      b.setAttribute('aria-label', `Zdjęcie ${i + 1} z ${heroSlides.length}`);
      b.append(document.createElement('span'));
      b.addEventListener('click', () => { show(i); play(); });
      heroDots.append(b);
      return b;
    });

    function show(i) {
      current = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((s, n) => s.classList.toggle('is-active', n === current));
      dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
    }
    function stop() { window.clearInterval(timer); }
    function play() {
      stop();
      if (!reduceMotion.matches && !document.hidden) timer = window.setInterval(() => show(current + 1), INTERVAL);
    }

    document.addEventListener('visibilitychange', play);
    reduceMotion.addEventListener('change', play);
    show(0);
    play();
  }

  // ---------- Filtry portfolio ----------
  const filters = $('[data-filters]');
  const gallery = $('[data-gallery]');
  const status = $('[data-filter-status]');
  if (filters && gallery) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const value = btn.dataset.filter;
      $$('[data-filter]', filters).forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      let shown = 0;
      $$('.gallery__item', gallery).forEach((item) => {
        const show = value === 'all' || item.dataset.cat === value;
        item.hidden = !show;
        item.classList.remove('is-in');
        if (show) {
          shown += 1;
          void item.offsetWidth; // restart animacji
          item.classList.add('is-in');
        }
      });
      if (status) status.textContent = `Pokazano prace: ${shown}`;
    });
  }

  // ---------- Opinie (karuzela bez autoodtwarzania) ----------
  $$('[data-carousel]').forEach((root) => {
    const slides = $$('[data-slide]', root);
    const nav = $('[data-carousel-nav]', root);
    const dotsWrap = $('[data-dots]', root);
    if (slides.length < 2 || !nav || !dotsWrap) { nav?.remove(); return; }

    let index = 0;
    const track = $('.quotes__track', root);
    track.setAttribute('aria-live', 'polite');

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', `Opinia ${i + 1} z ${slides.length}`);
      b.append(document.createElement('span'));
      b.addEventListener('click', () => go(i));
      dotsWrap.append(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        const on = n === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach((d, n) => d.setAttribute('aria-current', n === index ? 'true' : 'false'));
    }

    $('[data-prev]', root).addEventListener('click', () => go(index - 1));
    $('[data-next]', root).addEventListener('click', () => go(index + 1));
    go(0);
  });

  // ---------- Podświetlenie aktywnej sekcji w menu (tylko linki do sekcji bieżącej strony) ----------
  // Podstrony (/oferta/ itd.) są oznaczane na stałe przez aria-current="page" (scripts/layout.mjs).
  const navLinks = $$('.primary-nav .nav-link').filter((a) => a.hash && a.pathname === location.pathname);
  if ('IntersectionObserver' in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        byId.get(entry.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section, .site-footer').forEach((s) => observer.observe(s));
  }
})();
