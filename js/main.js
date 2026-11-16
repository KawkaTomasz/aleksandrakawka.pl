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

  // ---------- Podmenu (Oferta, Szkolenia): po kliknięciu pozycji pole się zwija ----------
  // Otwiera je samo CSS (:hover / :focus-within); tu tylko zamykamy po wyborze, aż kursor opuści menu.
  $$('.has-sub').forEach((li) => {
    $$('.subnav a', li).forEach((a) => a.addEventListener('click', () => {
      li.classList.add('is-closed');
      a.blur();
    }));
    li.addEventListener('mouseleave', () => li.classList.remove('is-closed'));
    li.addEventListener('focusin', (e) => { if (e.target === $('.nav-link', li)) li.classList.remove('is-closed'); });
  });

  // ---------- Hero: karuzela zdjęć (przełącza się sama) ----------
  // Przy „ogranicz ruch” w systemie nie przewija się sama – zostają tylko wskaźniki.
  // Zatrzymuje się, gdy karta przeglądarki jest w tle.
  // Slajdy z data-hero-mobile są pomijane od 48em (np. zdjęcie za małe na szeroki ekran).
  const allHeroSlides = $$('[data-hero-slide]');
  const heroDots = $('[data-hero-dots]');
  if (allHeroSlides.length && heroDots) {
    const INTERVAL = 6000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 48em)');
    let heroSlides = [];
    let dots = [];
    let current = 0;
    let timer = 0;

    heroDots.setAttribute('role', 'group');
    heroDots.setAttribute('aria-label', 'Zdjęcia w tle');

    function show(i) {
      current = (i + heroSlides.length) % heroSlides.length;
      allHeroSlides.forEach((s) => s.classList.toggle('is-active', s === heroSlides[current]));
      dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
    }
    function stop() { window.clearInterval(timer); }
    function play() {
      stop();
      if (heroSlides.length > 1 && !reduceMotion.matches && !document.hidden) timer = window.setInterval(() => show(current + 1), INTERVAL);
    }
    function build() {
      heroSlides = allHeroSlides.filter((s) => !(wide.matches && s.hasAttribute('data-hero-mobile')));
      heroDots.replaceChildren();
      dots = heroSlides.length > 1 ? heroSlides.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hero__dot';
        b.setAttribute('aria-label', `Zdjęcie ${i + 1} z ${heroSlides.length}`);
        b.append(document.createElement('span'));
        b.addEventListener('click', () => { show(i); play(); });
        heroDots.append(b);
        return b;
      }) : [];
      show(0);
      play();
    }

    document.addEventListener('visibilitychange', play);
    reduceMotion.addEventListener('change', play);
    wide.addEventListener('change', build);
    build();
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

  // ---------- Portfolio: powiększanie zdjęć (lightbox) ----------
  // Klik w zdjęcie → ciemne tło i duże zdjęcie. Strzałki / przesunięcie palcem = kolejne zdjęcie
  // (tylko spośród widocznych po filtrze), Esc / krzyżyk / klik w tło = zamknięcie.
  const galleryItems = gallery ? $$('.gallery__item', gallery) : [];
  if (galleryItems.length && typeof HTMLDialogElement === 'function') {
    const icon = (d) => `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">${d}</svg>`;
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Powiększone zdjęcie');
    box.innerHTML = `
      <p class="lightbox__count"></p>
      <figure class="lightbox__figure"><div class="lightbox__media"></div><figcaption class="lightbox__cap"></figcaption></figure>
      <button class="lightbox__btn lightbox__prev" type="button" aria-label="Poprzednie zdjęcie">${icon('<path d="M20 12H4M10 6l-6 6 6 6"/>')}</button>
      <button class="lightbox__btn lightbox__next" type="button" aria-label="Następne zdjęcie">${icon('<path d="M4 12h16M14 6l6 6-6 6"/>')}</button>
      <button class="lightbox__btn lightbox__close" type="button" aria-label="Zamknij" autofocus>${icon('<path d="M6 6l12 12M18 6L6 18"/>')}</button>`;
    document.body.append(box);
    const media = $('.lightbox__media', box);
    const cap = $('.lightbox__cap', box);
    const count = $('.lightbox__count', box);
    const prev = $('.lightbox__prev', box);
    const next = $('.lightbox__next', box);
    let list = [];
    let idx = 0;

    const titleOf = (item) => $('.work__title', item)?.textContent.trim() ?? '';
    function render() {
      const item = list[idx];
      const pic = $('picture', item).cloneNode(true);
      pic.className = '';
      pic.style.cssText = '';
      $$('source, img', pic).forEach((el) => el.setAttribute('sizes', '100vw'));
      const img = $('img', pic);
      img.removeAttribute('loading');
      img.removeAttribute('style');
      media.replaceChildren(pic);
      cap.textContent = [titleOf(item), $('.work__cat', item)?.textContent.trim()].filter(Boolean).join(' · ');
      count.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : '';
      prev.hidden = next.hidden = list.length < 2;
    }
    const go = (step) => { idx = (idx + step + list.length) % list.length; render(); };
    function open(item) {
      list = galleryItems.filter((i) => !i.hidden);
      idx = Math.max(0, list.indexOf(item));
      render();
      document.documentElement.classList.add('has-lightbox');
      box.showModal();
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    $('.lightbox__close', box).addEventListener('click', () => box.close());
    box.addEventListener('close', () => document.documentElement.classList.remove('has-lightbox'));
    // Klik poza zdjęciem i przyciskami zamyka
    box.addEventListener('click', (e) => { if (!e.target.closest('img, button')) box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    let touchX = null;
    box.addEventListener('touchstart', (e) => { touchX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (touchX === null || list.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      touchX = null;
    });

    galleryItems.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'work__open';
      b.setAttribute('aria-label', `Powiększ zdjęcie: ${titleOf(item)}`);
      b.addEventListener('click', () => open(item));
      $('.work', item).append(b);
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

  // ---------- Zdjęcia łagodnie „wyłaniają się z mgły” przy przewijaniu ----------
  // Zdjęcia są schowane od pierwszej klatki (krytyczny CSS: .js … :not(.is-shown)) i wjeżdżają, gdy
  // dojadą do ~80% wysokości ekranu – także te, których skrawek widać zaraz po otwarciu strony.
  // Zdjęcia, które pojawią się razem (np. rząd kart), startują kolejno co 0,12 s. Przy „ogranicz ruch” – bez animacji.
  const revealTargets = $$('.frame, .about__block, .card__media, .work picture, .studio-gallery picture');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-shown'));
  } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Obserwujemy rodzica, nie samo zdjęcie (schowany element bywa uznawany za niewidoczny).
    const watched = new Map();
    revealTargets.forEach((el) => {
      const box = el.parentElement;
      if (!watched.has(box)) watched.set(box, []);
      watched.get(box).push(el);
    });
    const photoObserver = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).flatMap((e) => {
        photoObserver.unobserve(e.target);
        return watched.get(e.target);
      }).forEach((el, i) => {
        el.style.setProperty('--d', `${i * 0.12}s`);
        el.classList.add('is-shown');
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    revealTargets.forEach((el) => el.classList.add('photo-reveal'));
    watched.forEach((_, box) => photoObserver.observe(box));
  }

  // ---------- Film (sekcja Studio) ----------
  // Pobiera się dopiero przy przewinięciu w pobliże i gra tylko, gdy jest na ekranie.
  // Przy „ogranicz ruch” nie startuje sam – pokazuje przyciski odtwarzania.
  $$('video[data-autoplay]').forEach((v) => {
    const load = () => { if (!v.src) v.src = v.dataset.src; };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      v.controls = true;
      load();
      return;
    }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { load(); v.play().catch(() => { v.controls = true; }); } else v.pause();
    }, { rootMargin: '200px 0px' }).observe(v);
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
