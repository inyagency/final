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
