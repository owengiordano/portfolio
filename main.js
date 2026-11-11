/* Builds the page from content.js and wires up all animation + interaction. */
(() => {
  'use strict';

  const C = window.CONTENT || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const md = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); // *text* -> italic accent
  const pad2 = (n) => String(n).padStart(2, '0');

  const portfolio = C.portfolio || [];
  const HUES = [12, 255, 165, 38, 205, 325, 95, 350];

  function media(item, i, { autoplay = false } = {}) {
    const alt = esc(`${item.brand || ''} ${item.title || ''}`.trim());
    if (item.video) {
      return `<video class="media" src="${esc(item.video)}"${item.poster ? ` poster="${esc(item.poster)}"` : ''} muted loop playsinline preload="metadata"${autoplay ? ' autoplay' : ''} aria-label="${alt}"></video>`;
    }
    if (item.poster) return `<img class="media" src="${esc(item.poster)}" alt="${alt}" loading="lazy">`;
    return `<div class="media media--placeholder" style="--h:${HUES[i % HUES.length]}"><span>${esc(item.brand || item.category || 'Your video')}</span></div>`;
  }

  // Wrap each word of an element's text in spans (keeps nested tags like <em>).
  function splitWords(root, cls, inner) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = cls;
            w.style.setProperty('--i', i++);
            if (inner) {
              const s = document.createElement('span');
              s.className = `${cls}__i`;
              s.textContent = part;
              w.appendChild(s);
            } else w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
    return i;
  }

  /* ------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------ */
  document.title = `${C.name} — ${C.role}`;
  $('meta[name="description"]').setAttribute('content', `${C.name} — ${C.role}. ${C.hero?.sub || ''}`);

  $('#preloaderName').textContent = C.name;
  $('#navLogo').innerHTML = `${esc(C.logo || C.name)}<i>.</i>`;

  // hero
  const hero = C.hero || {};
  $('#heroBadge').textContent = [C.role, C.availability].filter(Boolean).join(' · ');
  const [first, ...rest] = (C.name || '').split(' ');
  $('#heroTitle').innerHTML =
    `<span class="line" style="--i:0"><span>${esc(first)}</span></span>` +
    (rest.length ? `<span class="line" style="--i:1"><span><em>${esc(rest.join(' '))}</em></span></span>` : '');
  $('#heroStats').innerHTML = (C.stats || []).map((s) =>
    `<div class="hero__stat">
       <div class="hero__stat-value"><span data-hero-count="${esc(s.value)}">0</span><i>${esc(s.suffix || '')}</i></div>
       <div class="hero__stat-label">${esc(s.label)}</div>
     </div>`).join('');
  $('#heroPhoto').innerHTML = hero.photo
    ? `<img class="media" src="${esc(hero.photo)}" alt="${esc(C.name)}">`
    : `<div class="media media--placeholder" style="--h:14"><span>Your photo</span></div>`;
  if (hero.statsImage) {
    $('.hero__photo-wrap').insertAdjacentHTML('beforeend',
      `<a class="proof" href="${esc(hero.statsLink || '#')}" target="_blank" rel="noopener" data-cursor="Open" aria-label="${esc(C.name)} on TikTok">
         <img src="${esc(hero.statsImage)}" alt="TikTok profile: ${esc((C.stats || []).map((s) => `${s.value}${s.suffix || ''} ${s.label}`).join(', '))}">
       </a>`);
    $('.hero__photo-wrap').classList.add('has-proof');
  }
  $('#spinText').textContent = `${C.role} ✦ Available for collabs ✦ `;
  $('#heroLocation').textContent = C.location ? `Based in ${C.location}` : '';
  $('#heroRole').textContent = C.role || '';

  // marquee
  const brands = C.brands || [];
  if (brands.length) {
    let group = brands.slice();
    while (group.length < 10) group = group.concat(brands);
    const html = group.map((b) => {
      const name = typeof b === 'string' ? b : b.name;
      const inner = typeof b === 'object' && b.logo ? `<img src="${esc(b.logo)}" alt="${esc(name)}">` : `<span>${esc(name)}</span>`;
      return `<div class="marquee__item">${inner}<span class="star">✦</span></div>`;
    }).join('');
    $('#marqueeTrack').innerHTML = html + html;
    if (C.marqueeLabel) $('.marquee__label').textContent = C.marqueeLabel;
  } else $('.marquee').hidden = true;

  // about
  const about = C.about || {};
  const statement = $('#aboutStatement');
  statement.innerHTML = md(about.statement || '');
  splitWords(statement, 'word', false);
  if (about.photo) $('#aboutPhoto').innerHTML = `<img class="media" src="${esc(about.photo)}" alt="${esc(C.name)}">`;
  else { $('#aboutPhotoWrap').hidden = true; $('#aboutGrid').classList.add('about__grid--solo'); }
  $('#aboutParagraphs').innerHTML = (about.paragraphs || []).map((p, i) => `<p data-reveal style="--d:${i * 0.1}s">${esc(p)}</p>`).join('');
  $('#niches').innerHTML = (about.niches || []).map((n) => `<span class="niche">${esc(n)}</span>`).join('');
  $('#niches').setAttribute('data-reveal', '');

  // big view/like numbers under a video card ("3M" -> counts up to 3, suffix M)
  function cardStats(p) {
    const items = [['views', p.views], ['likes', p.likes]].filter(([, v]) => v);
    if (!items.length) return '';
    return `<div class="card__stats">${items.map(([label, v]) => {
      const m = String(v).match(/^([\d.,]+)\s*(.*)$/);
      const num = m ? `<span data-count="${esc(m[1].replace(/,/g, ''))}">0</span><i>${esc(m[2])}</i>` : esc(v);
      return `<div class="card__stat"><div class="card__stat-value">${num}</div><div class="card__stat-label">${label}</div></div>`;
    }).join('')}</div>`;
  }

  // work
  const cats = ['All', ...new Set(portfolio.map((p) => p.category).filter(Boolean))];
  const filters = $('#filters');
  filters.insertAdjacentHTML('beforeend', cats.map((c, i) =>
    `<button class="filter${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join(''));
  if (cats.length <= 2 || portfolio.length <= 5) filters.hidden = true; // filters only earn their place on bigger grids
  $('#workGrid').dataset.n = portfolio.length;

  $('#workGrid').innerHTML = portfolio.map((p, i) =>
    `<article class="card" data-reveal style="--d:${(i % 4) * 0.08}s" data-index="${i}" data-cat="${esc(p.category || '')}" data-cursor="${p.video ? 'Play' : p.link ? 'Open' : 'Soon'}" tabindex="0" role="button" aria-label="${esc([p.brand, p.title].filter(Boolean).join(': '))}">
       <div class="card__inner">
         ${media(p, i)}
         <div class="card__overlay">
           <div class="card__top">
             ${p.category ? `<span class="card__tag">${esc(p.category)}</span>` : '<span></span>'}
             ${p.metric ? `<span class="card__metric">${esc(p.metric)}</span>` : ''}
           </div>
           <div>
             <div class="card__brand">${esc(p.brand)}</div>
             <h3 class="card__title">${esc(p.title)}</h3>
           </div>
         </div>
       </div>
       ${cardStats(p)}
     </article>`).join('');

  // services
  $('#servicesList').innerHTML = (C.services || []).map((s, i) =>
    `<div class="service" data-reveal style="--d:${i * 0.05}s">
       <span class="service__num">${pad2(i + 1)}</span>
       <h3 class="service__title">${esc(s.title)}</h3>
       <p class="service__desc">${esc(s.desc)}</p>
       <span class="service__arrow">↗</span>
     </div>`).join('');

  if (!(C.services || []).length) {
    $('#services').hidden = true;
    $('.nav__links a[href="#services"]').hidden = true;
  }

  // process
  $('#processGrid').innerHTML = (C.process || []).map((s, i) =>
    `<div class="step" data-reveal style="--d:${i * 0.15}s">
       <div class="step__num">${pad2(i + 1)}</div>
       <h3 class="step__title">${esc(s.title)}</h3>
       <p class="step__desc">${esc(s.desc)}</p>
     </div>`).join('');
  if (!(C.process || []).length) $('.process').hidden = true;

  // testimonials
  const T = C.testimonials || [];
  if (T.length) {
    $('#storyBars').innerHTML = T.map((_, i) => `<button class="story-bar" aria-label="Testimonial ${i + 1}"><span></span></button>`).join('');
    $('#quotes').innerHTML = T.map((t) =>
      `<figure class="quote">
         <blockquote class="quote__text">${esc(t.quote)}</blockquote>
         <figcaption class="quote__by">
           <span class="quote__avatar">${esc((t.name || '?').charAt(0))}</span>
           <span><span class="quote__name">${esc(t.name)}</span><br><span class="quote__role">${esc(t.role)}</span></span>
         </figcaption>
       </figure>`).join('');
  } else $('#testimonials').hidden = true;

  // rates
  const rates = C.rates || {};
  if (C.showRates && rates.packages?.length) {
    $('#ratesNote').textContent = rates.note || '';
    $('#packages').innerHTML = rates.packages.map((p, i) =>
      `<div class="package${p.featured ? ' package--featured' : ''}" data-reveal style="--d:${i * 0.1}s">
         <div class="package__lift">
           ${p.featured ? '<span class="package__flag">Most popular</span>' : ''}
           <div class="package__name">${esc(p.name)}</div>
           <div class="package__price">${esc(p.price)}</div>
           <div class="package__per">${esc(p.per || '')}</div>
           <ul class="package__features">${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
           <a href="#contact" class="btn"><span>Book ${esc(p.name)}</span><span class="arrow">→</span></a>
         </div>
       </div>`).join('');
  } else {
    $('#rates').hidden = true;
    $('#navRates').hidden = true;
  }

  // contact + footer
  const contact = C.contact || {};
  $('#contactTitle').innerHTML = md(contact.heading || "Let's work *together*.");
  $('#contactSub').textContent = contact.sub || '';
  $('#emailText').textContent = C.email || '';
  $('#mailLink').href = `mailto:${C.email || ''}`;
  $('#socials').innerHTML = (C.socials || []).filter((s) => s.url).map((s) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span>↗</span></a></li>`).join('');
  $('#footerName').innerHTML = [...(C.name || '')].map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
  $('#footerName').style.setProperty('--fs', `${Math.min(17, 150 / Math.max(1, (C.name || '').length)).toFixed(2)}vw`);
  $('#footerCopy').textContent = `© ${new Date().getFullYear()} ${C.name}. All rights reserved.`;

  if (C.timezone) {
    const el = $('#localTime');
    const tick = () => {
      try {
        el.textContent = `${C.location ? C.location + ' · ' : ''}${new Date().toLocaleTimeString('en-US', { timeZone: C.timezone, hour: 'numeric', minute: '2-digit' })} local time`;
      } catch { el.textContent = C.location || ''; }
    };
    tick();
    setInterval(tick, 30000);
  }

  // split headings into words for the rise-up reveal
  $$('[data-split]').forEach((el) => splitWords(el, 'w', true));

  /* ------------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------------ */
  (() => {
    const count = $('#preloaderCount');
    const pre = $('#preloader');
    const dur = reduce ? 150 : 1500;
    const t0 = performance.now();
    const done = () => {
      document.body.classList.add('loaded');
      document.body.classList.remove('is-loading');
      setTimeout(() => $$('[data-hero-count]').forEach((el) => { el.dataset.count = el.dataset.heroCount; countUp(el); }), 700);
      setTimeout(() => pre.remove(), 1500);
    };
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      count.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(done, 180);
    };
    requestAnimationFrame(step);
    setTimeout(() => { if (!document.body.classList.contains('loaded')) done(); }, dur + 2500); // safety net
  })();

  /* ------------------------------------------------------------------------
     Hero: photo parallax
     ------------------------------------------------------------------------ */
  const phoneWraps = $$('.hero__photo-wrap');
  if (!reduce && phoneWraps.length) {
    let tx = 0, ty = 0, px = 0, py = 0;
    if (fine) addEventListener('mousemove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; });
    (function loop() {
      if (scrollY < innerHeight * 1.2) {
        px = lerp(px, tx, 0.06); py = lerp(py, ty, 0.06);
        phoneWraps.forEach((w) => {
          const d = +w.dataset.depth;
          w.style.transform = `translate3d(${px * -34 * d}px, ${py * -26 * d - scrollY * 0.12 * d}px, 0)`;
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------------
     Scroll: progress bar, nav, word-by-word statement, marquee velocity
     ------------------------------------------------------------------------ */
  const nav = $('#nav');
  const progress = $('#progress');
  const stWords = $$('.word', statement);
  let lastY = scrollY, ticking = false, mDir = -1, mBoost = 0;

  function onScroll() {
    ticking = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-scrolled', y > 20);
    nav.classList.toggle('is-hidden', y > lastY && y > 300);

    if (!reduce && stWords.length) {
      const r = statement.getBoundingClientRect();
      const start = innerHeight * 0.85, end = innerHeight * 0.4;
      const p = clamp((start - r.top) / (start - end + r.height), 0, 1);
      const n = Math.round(p * stWords.length);
      stWords.forEach((w, i) => w.classList.toggle('on', i < n));
    }

    const v = y - lastY;
    if (v) { mDir = v > 0 ? -1 : 1; mBoost = Math.min(mBoost + Math.abs(v) * 0.05, 14); }
    lastY = y;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  const track = $('#marqueeTrack');
  if (!reduce && brands.length) {
    let x = 0;
    (function loop() {
      const half = track.scrollWidth / 2;
      x += mDir * (0.7 + mBoost);
      mBoost *= 0.93;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll + counters
     ------------------------------------------------------------------------ */
  function countUp(el) {
    const raw = el.dataset.count;
    const target = parseFloat(raw) || 0;
    const dec = (raw.split('.')[1] || '').length;
    const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) { el.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1900;
    const f = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      el.textContent = fmt(target * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.count !== undefined) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-split], [data-count], .footer__name').forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------------
     Cursor, magnetic buttons, card tilt
     ------------------------------------------------------------------------ */
  if (fine && !reduce) {
    const cursor = $('#cursor'), label = $('#cursorLabel');
    let mx = -100, my = -100, cx = mx, cy = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; cursor.classList.add('is-visible'); });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    (function loop() {
      cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22);
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', (e) => {
      const labelled = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .niche');
      cursor.classList.toggle('is-label', !!labelled);
      cursor.classList.toggle('is-hover', !labelled && !!link);
      if (labelled) label.textContent = labelled.dataset.cursor;
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    $$('.card').forEach((card) => {
      const inner = $('.card__inner', card);
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateZ(8px)`;
      });
      card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------------
     Work: hover-to-play, filters, lightbox
     ------------------------------------------------------------------------ */
  const cards = $$('.card');
  const play = (v) => v && v.play().catch(() => {});

  if (fine) {
    cards.forEach((card) => {
      const v = $('video', card);
      if (!v) return;
      card.addEventListener('mouseenter', () => play(v));
      card.addEventListener('mouseleave', () => v.pause());
    });
  } else {
    // touch devices: play whichever videos are on screen
    const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play(e.target) : e.target.pause())), { threshold: 0.6 });
    $$('.card video').forEach((v) => vio.observe(v));
  }

  const pill = $('#filtersPill');
  const movePill = () => {
    const a = $('.filter.is-active', filters);
    if (!a) return;
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  movePill();
  addEventListener('resize', movePill);
  document.fonts?.ready.then(movePill);

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn || btn.classList.contains('is-active')) return;
    $$('.filter', filters).forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    movePill();
    const cat = btn.dataset.cat;
    cards.forEach((c) => c.classList.add('is-out'));
    setTimeout(() => {
      let n = 0;
      cards.forEach((c) => {
        const show = cat === 'All' || c.dataset.cat === cat;
        c.hidden = !show;
        if (show) {
          c.classList.add('in');
          const delay = n++ * 60;
          setTimeout(() => c.classList.remove('is-out'), 30 + delay);
        }
      });
    }, reduce ? 0 : 350);
  });

  const lightbox = $('#lightbox'), lbVideo = $('#lightboxVideo');
  let lastFocus = null;
  function openItem(i) {
    const p = portfolio[i];
    if (!p) return;
    if (!p.video) { if (p.link) window.open(p.link, '_blank', 'noopener'); return; }
    lastFocus = document.activeElement;
    $('#lightboxBrand').textContent = p.brand || '';
    $('#lightboxTitle').textContent = p.title || '';
    lbVideo.src = p.video;
    if (p.poster) lbVideo.poster = p.poster; else lbVideo.removeAttribute('poster');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    play(lbVideo);
    $('#lightboxClose').focus();
  }
  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();
    lastFocus?.focus?.();
  }
  $('#workGrid').addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openItem(+c.dataset.index); });
  $('#workGrid').addEventListener('keydown', (e) => {
    const c = e.target.closest('.card');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openItem(+c.dataset.index); }
  });
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ------------------------------------------------------------------------
     Testimonials (story-style auto-advance)
     ------------------------------------------------------------------------ */
  if (T.length) {
    const bars = $$('.story-bar'), quotes = $$('.quote');
    let ti = -1;
    const go = (i) => {
      ti = (i + T.length) % T.length;
      bars.forEach((b, j) => { b.classList.toggle('is-done', j < ti); b.classList.remove('is-active'); });
      quotes.forEach((q, j) => q.classList.toggle('is-active', j === ti));
      void bars[ti].offsetWidth; // restart the fill animation
      if (T.length > 1) bars[ti].classList.add('is-active'); else bars[ti].classList.add('is-done');
    };
    bars.forEach((b, i) => {
      b.addEventListener('click', () => go(i));
      b.addEventListener('animationend', () => go(ti + 1));
    });
    // start the timer only once the section is on screen
    const tio = new IntersectionObserver((es) => { if (es[0].isIntersecting) { go(0); tio.disconnect(); } }, { threshold: 0.3 });
    quotes[0].classList.add('is-active');
    tio.observe($('#testimonials'));
  }

  /* ------------------------------------------------------------------------
     Contact: copy email
     ------------------------------------------------------------------------ */
  const copyBtn = $('#copyEmail'), hint = $('#emailHint');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(C.email);
      hint.textContent = 'Copied ✓';
      copyBtn.classList.add('is-copied');
      setTimeout(() => { hint.textContent = 'Click to copy'; copyBtn.classList.remove('is-copied'); }, 2200);
    } catch {
      location.href = `mailto:${C.email}`;
    }
  });
})();
