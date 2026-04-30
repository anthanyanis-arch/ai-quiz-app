/**
 * AI Quiz — Global Ambient Background System
 * Drop-in: <script src="ambient.js"></script>  (anywhere in <body>)
 *
 * Creates a fixed z-index:-1 layer of subtle AI-themed SVG icons
 * with layered parallax (3 depth bands) + idle float animations.
 * Mobile-safe: reduces icon count and disables parallax on small screens.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. SVG ICON LIBRARY  (stroke-only, no fill)
  ───────────────────────────────────────────── */
  const ICONS = {
    brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.16Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.16Z"/>
    </svg>`,

    chip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1"/>
      <path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/>
    </svg>`,

    robot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <rect x="8" y="7" width="8" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="4"/>
      <circle cx="12" cy="3" r="1"/>
      <circle cx="8.5" cy="15" r="1.5"/>
      <circle cx="15.5" cy="15" r="1.5"/>
      <path d="M8 19h8"/>
    </svg>`,

    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>`,

    network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="2"/>
      <circle cx="5" cy="19" r="2"/>
      <circle cx="19" cy="19" r="2"/>
      <line x1="12" y1="7" x2="5" y2="17"/>
      <line x1="12" y1="7" x2="19" y2="17"/>
      <line x1="7" y1="19" x2="17" y2="19"/>
    </svg>`,

    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>`,

    lightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,

    question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,

    cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/>
      <line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/>
      <line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/>
      <line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/>
      <line x1="1" y1="14" x2="4" y2="14"/>
    </svg>`,

    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,
  };

  const ICON_KEYS = Object.keys(ICONS);

  /* ─────────────────────────────────────────────
     2. ICON DEFINITIONS  (position + layer)
     layer: 0=far(slow), 1=mid, 2=near(fast)
  ───────────────────────────────────────────── */
  // Each entry: [icon, top%, left%, size(px), opacity, layer, floatDuration, floatDelay]
  const DESKTOP_ICONS = [
    // ── far layer (layer 0) ──
    ['brain',     4,   3,   64, 0.35, 0, 7.0, 0.0],
    ['chip',      8,  92,   56, 0.32, 0, 8.5, 1.2],
    ['network',  22,   1,   60, 0.35, 0, 9.0, 0.5],
    ['cpu',      38,  95,   62, 0.32, 0, 7.5, 2.1],
    ['chart',    55,   2,   58, 0.35, 0, 8.0, 1.8],
    ['code',     70,  94,   54, 0.32, 0, 9.5, 0.3],
    ['brain',    85,   4,   62, 0.35, 0, 7.2, 2.5],
    ['lightning',92,  91,   52, 0.32, 0, 8.8, 1.0],

    // ── mid layer (layer 1) ──
    ['robot',    12,  88,   50, 0.40, 1, 6.0, 0.8],
    ['question', 28,   6,   48, 0.42, 1, 5.5, 1.5],
    ['eye',      45,  90,   46, 0.40, 1, 6.5, 0.2],
    ['lightning',60,   8,   50, 0.42, 1, 5.8, 2.0],
    ['network',  75,  87,   48, 0.40, 1, 6.2, 1.1],
    ['chart',    88,   7,   46, 0.42, 1, 5.5, 0.6],

    // ── near layer (layer 2) ──
    ['code',      6,  78,   40, 0.48, 2, 4.5, 0.4],
    ['chip',     32,  18,   38, 0.45, 2, 4.8, 1.7],
    ['cpu',      50,  80,   40, 0.48, 2, 4.2, 0.9],
    ['brain',    68,  16,   38, 0.45, 2, 4.6, 2.3],
    ['robot',    82,  79,   40, 0.48, 2, 4.4, 0.1],
    ['question', 96,  20,   36, 0.45, 2, 4.9, 1.4],
  ];

  // Mobile: fewer icons, only far layer, smaller
  const MOBILE_ICONS = [
    ['brain',     5,   4,  48, 0.32, 0, 8.0, 0.0],
    ['chip',     25,  90,  44, 0.30, 0, 9.0, 1.0],
    ['network',  50,   3,  46, 0.32, 0, 8.5, 0.5],
    ['chart',    72,  88,  42, 0.30, 0, 9.5, 1.5],
    ['code',     90,   5,  44, 0.32, 0, 8.2, 2.0],
  ];

  /* ─────────────────────────────────────────────
     3. PARALLAX SPEEDS per layer
  ───────────────────────────────────────────── */
  const PARALLAX = [0.08, 0.18, 0.28]; // layer 0,1,2 — scrollY multiplier

  /* ─────────────────────────────────────────────
     4. CSS INJECTION
  ───────────────────────────────────────────── */
  const CSS = `
    #amb-layer {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }
    .amb-icon {
      position: absolute;
      color: #3fd0e6;
      will-change: transform;
      line-height: 0;
    }
    .amb-icon svg {
      display: block;
      filter:
        drop-shadow(0 0 8px rgba(63,208,230,0.55))
        drop-shadow(0 0 20px rgba(63,208,230,0.25));
    }
    /* Float keyframes — 8 variants for variety */
    @keyframes ambFloat0 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-7px) rotate(1deg)} }
    @keyframes ambFloat1 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-5px) rotate(-1.5deg)} }
    @keyframes ambFloat2 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-9px) rotate(2deg)} }
    @keyframes ambFloat3 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-6px) rotate(-1deg)} }
    @keyframes ambFloat4 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-8px) rotate(1.5deg)} }
    @keyframes ambFloat5 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-4px) rotate(-2deg)} }
    @keyframes ambFloat6 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-10px) rotate(1deg)} }
    @keyframes ambFloat7 { 0%,100%{transform:translateY(0px) rotate(0deg)}   50%{transform:translateY(-6px) rotate(-1.5deg)} }

    /* Mobile: only gentle float, no rotate */
    @media (max-width: 767px) {
      @keyframes ambFloat0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
      @keyframes ambFloat1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
      @keyframes ambFloat2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
      @keyframes ambFloat3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
      @keyframes ambFloat4 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
      @keyframes ambFloat5 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-3px)} }
      @keyframes ambFloat6 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
      @keyframes ambFloat7 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
    }
  `;

  /* ─────────────────────────────────────────────
     5. BUILD & INJECT
  ───────────────────────────────────────────── */
  function init() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const isMobile = window.innerWidth < 768;
    const iconSet = isMobile ? MOBILE_ICONS : DESKTOP_ICONS;

    // Create fixed layer
    const layer = document.createElement('div');
    layer.id = 'amb-layer';

    // Store refs for parallax
    const parallaxItems = []; // { el, layer, baseTop }

    iconSet.forEach(([key, topPct, leftPct, size, opacity, layerIdx, dur, delay], i) => {
      const wrap = document.createElement('div');
      wrap.className = 'amb-icon';

      // Position
      wrap.style.cssText = `
        top: ${topPct}%;
        left: ${leftPct}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${opacity};
      `;

      // Float animation lives on an inner wrapper so JS parallax on wrap.style.transform won't clobber it
      const inner = document.createElement('div');
      inner.style.cssText = `animation: ambFloat${i % 8} ${dur}s ease-in-out ${delay}s infinite;`;
      inner.innerHTML = ICONS[key] || ICONS.chip;
      inner.querySelector('svg').style.width  = size + 'px';
      inner.querySelector('svg').style.height = size + 'px';
      wrap.appendChild(inner);

      layer.appendChild(wrap);

      if (!isMobile) {
        parallaxItems.push({ el: wrap, layer: layerIdx, baseTop: topPct });
      }
    });

    // Insert layer as first child of body so it sits behind everything
    document.body.insertBefore(layer, document.body.firstChild);

    /* ── Parallax via rAF ── */
    if (!isMobile && parallaxItems.length) {
      let ticking = false;
      let lastScrollY = window.scrollY;

      function applyParallax() {
        const sy = window.scrollY;
        parallaxItems.forEach(({ el, layer: lyr, baseTop }) => {
          const speed  = PARALLAX[lyr];
          const drift  = lyr === 2 ? sy * 0.015 : lyr === 1 ? sy * 0.008 : 0;
          const rotate = lyr === 2 ? sy * 0.004 : lyr === 1 ? -sy * 0.002 : 0;
          const ty     = -(sy * speed);
          // No translateZ — perspective container removed; parallax via translateY only
          el.style.transform = `translateY(${ty}px) translateX(${drift}px) rotate(${rotate}deg)`;
        });
        ticking = false;
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(applyParallax);
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────────
     6. RUN
  ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
