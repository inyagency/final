/**
 * INYA — Landing Page Script
 * Animations, interactions, scroll effects
 */

'use strict';

/* ============================================================
   UTILITY: debounce  (declared first so IIFEs below can use it)
   ============================================================ */
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ============================================================
   PARTICLES SYSTEM
   ============================================================ */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const PARTICLE_COUNT = 50;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = (Math.random() * 2 + 1).toFixed(1);
    p.style.cssText = `
      left:               ${Math.random() * 100}%;
      top:                ${Math.random() * 100}%;
      width:              ${size}px;
      height:             ${size}px;
      opacity:            ${(Math.random() * 0.4 + 0.1).toFixed(2)};
      animation-delay:    ${(Math.random() * 20).toFixed(1)}s;
      animation-duration: ${(15 + Math.random() * 15).toFixed(1)}s;
    `;
    fragment.appendChild(p);
  }

  container.appendChild(fragment);
})();

/* ============================================================
   NAVBAR — sticky + scroll effect
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 80;

  const handleScroll = debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }, 10);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load
})();

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
})();

/** Called by mobile menu links */
function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ============================================================
   INTERSECTION OBSERVER — Scroll Reveal
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (!entry.isIntersecting) return;

        // stagger siblings inside same parent
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.revealed)')]
          .filter(el => el === entry.target);

        const delay = siblings.length > 0 ? idx * 80 : 0;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px',
    }
  );

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/**
 * Animate a counter from 0 to data-target value
 * @param {HTMLElement} el
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = 16; // ~60fps
  const steps = duration / step;
  const increment = target / steps;

  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, step);
}

/* ============================================================
   FLIP CARDS — tap to flip on mobile
   ============================================================ */
(function initFlipCards() {
  const isTouchDevice = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!isTouchDevice()) return; // desktop uses CSS hover
      card.classList.toggle('flipped');
    });
  });
})();

/* ============================================================
   DASHBOARD — chart bar hover glow
   ============================================================ */
(function initChartBars() {
  document.querySelectorAll('.chart-bar').forEach(bar => {
    bar.addEventListener('mouseenter', () => {
      bar.style.boxShadow = '0 0 12px rgba(194,158,84,0.6)';
    });
    bar.addEventListener('mouseleave', () => {
      bar.style.boxShadow = '';
    });
  });
})();

/* ============================================================
   PARALLAX — subtle background shift on scroll
   ============================================================ */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener(
    'scroll',
    debounce(() => {
      const scrolled = window.scrollY;
      const particleContainer = document.getElementById('particles');
      if (particleContainer) {
        particleContainer.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    }, 8),
    { passive: true }
  );
})();

/* ============================================================
   ACTIVE NAV LINK on scroll
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlight = debounce(() => {
    let currentId = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentId = sec.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === currentId
        ? 'var(--gold-500)'
        : '';
    });
  }, 50);

  window.addEventListener('scroll', highlight, { passive: true });
})();

/* ============================================================
   INIT LOG
   ============================================================ */
console.log('%c INYA · AI Enterprise Platform ', 'background:#0B3C49;color:#C29E54;font-weight:bold;font-size:14px;padding:4px 8px;border-radius:4px;');
console.log('%c Powered by Inya Automation ', 'color:#C29E54;font-size:11px;');

/* ============================================================
   MULTI-LANGUAGE SUPPORT
   ============================================================ */
function setLang(lang) {
  // Deactivate all lang buttons (desktop + mobile)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate desktop button
  const desktopBtn = document.getElementById('lang-' + lang);
  if (desktopBtn) desktopBtn.classList.add('active');

  // Activate mobile button
  const mobileBtn = document.getElementById('mob-lang-' + lang);
  if (mobileBtn) mobileBtn.classList.add('active');

  // Apply translations
  if (typeof translations !== 'undefined' && translations[lang]) {
    const dict = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });
  }

  try {
    localStorage.setItem('inya_lang', lang);
  } catch (e) {}
}

(function initLang() {
  let lang = 'es';
  try {
    const saved = localStorage.getItem('inya_lang');
    if (saved) {
      lang = saved;
    } else {
      const browserLang = navigator.language.slice(0, 2).toLowerCase();
      if (['es', 'en', 'de', 'pt'].includes(browserLang)) {
        lang = browserLang;
      }
    }
  } catch (e) {}

  if (typeof translations !== 'undefined') {
    // translations.js loaded sync before script.js, safe to call
    setLang(lang);
  } else {
    window.addEventListener('load', () => setLang(lang));
  }
})();

/* ============================================================
   VIP ANIMATIONS — Premium Agency Layer
   ============================================================ */

/* ── 1. SPOTLIGHT CURSOR ── */
(function initSpotlight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', debounce(function(e) {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    hero.style.setProperty('--my', (e.clientY - rect.top)  + 'px');
  }, 10), { passive: true });
})();

/* ── 2. MAGNETIC BUTTONS ── */
(function initMagnetic() {
  const targets = document.querySelectorAll('.btn-primary, .nav-cta, .btn-outline');
  targets.forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      this.style.transition = 'transform 0.15s ease';
      this.style.transform  = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      this.style.transform  = '';
    });
  });
})();

/* ── 3. 3D TILT ON CARDS ── */
(function initTilt() {
  const cards = document.querySelectorAll(
    '.who-card, .spotify-card, .process-step, .feature-card, .stat-box'
  );
  const INTENSITY = 6; // max degrees
  cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width  - 0.5;
      const yPct = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transition = 'transform 0.1s ease';
      this.style.transform  =
        `perspective(700px) rotateX(${-yPct * INTENSITY}deg) rotateY(${xPct * INTENSITY}deg) translateZ(6px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', function() {
      this.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      this.style.transform  = '';
    });
  });
})();

/* ── 4. TEXT SCRAMBLE on section labels ── */
(function initScramble() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—∴';
  function scramble(el) {
    const original = el.textContent;
    let frame = 0;
    const FRAMES = 18;
    // Don't scramble if it has children/icons (preserve ::before)
    const interval = setInterval(() => {
      el.textContent = original.split('').map((ch, i) => {
        if (i < (frame / FRAMES) * original.length) return ch;
        return ch === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      frame++;
      if (frame > FRAMES) { el.textContent = original; clearInterval(interval); }
    }, 35);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      scramble(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('.section-label').forEach(el => observer.observe(el));
})();

/* ── 5. SPLIT TEXT STAGGER on section titles ── */
(function initSplitText() {
  document.querySelectorAll('.section-title').forEach((el, elIdx) => {
    // Skip titles that have nested HTML (gradient spans etc.) — animate whole block instead
    if (el.innerHTML.includes('<')) {
      el.style.animation = `fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) ${elIdx * 60}ms both`;
      return;
    }
    // Plain text titles: do word-by-word stagger
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((word, i) =>
      `<span class="word-wrap"><span class="word" style="animation-delay:${i * 90}ms">${word}</span></span>`
    ).join(' ');
  });
})();

/* ── 6. ANIMATED GRADIENT BORDER — featured package ── */
(function initGradientBorder() {
  const featured = document.querySelector('.spot-featured');
  if (!featured) return;
  let angle = 0;
  // Subtle shimmer effect on the gold border
  setInterval(() => {
    angle = (angle + 1.2) % 360;
    featured.style.borderColor = `hsl(${40 + Math.sin(angle * Math.PI / 180) * 8}, 55%, ${48 + Math.sin(angle * Math.PI / 180) * 6}%)`;
  }, 30);
})();

/* ── 7. FLOATING WHATSAPP BUTTON ── */
(function initWhatsAppFloat() {
  const PABLO = '351930946625'; // Portugal
  const FARID = '491753320351'; // Rest of world

  function getNumber() {
    const lang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    return lang.startsWith('pt') ? PABLO : FARID;
  }

  function getLabel() {
    const lang = (navigator.language || 'es').toLowerCase();
    if (lang.startsWith('pt')) return { name: 'Pablo', sub: 'Portugal' };
    if (lang.startsWith('de')) return { name: 'Farid', sub: 'Deutschland' };
    return { name: 'Farid', sub: 'Especialista INYA' };
  }

  const { name, sub } = getLabel();
  const num = getNumber();

  const btn = document.createElement('div');
  btn.className = 'wa-float';
  btn.setAttribute('aria-label', 'Contactar por WhatsApp');
  btn.innerHTML = `
    <div class="wa-tooltip">
      <strong>¿Hablamos?</strong>
      <span>${name} · ${sub}</span>
    </div>
    <button class="wa-btn" aria-label="WhatsApp">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </button>
  `;

  btn.addEventListener('click', () => {
    const msg = encodeURIComponent('Hola, me interesa saber más sobre INYA y cómo puede ayudar a mi negocio.');
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  });

  document.body.appendChild(btn);
})();
