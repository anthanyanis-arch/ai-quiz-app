(function () {
  const NAV = [
    { href: 'index.html', label: 'Home', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { href: 'register.html', label: 'Register', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>` },
    { href: 'instructions.html', label: 'Instructions', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
  ];

  const LOGO_SVG = ``;
  const CSS = `
    #nb-root {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
      background: rgba(2,20,23,0.85);
      border-bottom: 1px solid rgba(63,208,230,0.10);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      box-shadow: 0 1px 32px rgba(0,0,0,0.4);
      transition: background 0.3s ease, box-shadow 0.3s ease;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
    }
    #nb-neural-canvas {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; display: block;
    }
    .nb-inner { position: relative; z-index: 1; }
    #nb-root.nb-scrolled {
      background: rgba(2,20,23,0.97);
      box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(63,208,230,0.10);
    }
    .nb-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 20px; min-height: 64px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .nb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; max-width: calc(100% - 60px); }
    .nb-logo-icon { display: none; }
    .nb-logo { gap: 0; }
    .nb-logo-text { align-items: center; text-align: center; }
    .nb-inner { justify-content: center; position: relative; }
    .nb-actions { position: absolute; right: 20px; }
    .nb-logo:hover .nb-logo-icon { transform: translateY(-2px) scale(1.06); box-shadow: 0 8px 24px rgba(63,208,230,0.35); }
    .nb-logo-text { display: flex; flex-direction: column; line-height: 1.3; }
    .nb-logo-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #d9f3f7; letter-spacing: -0.01em; line-height: 1.3; word-break: break-word; }
    .nb-logo-sub { font-size: 10px; color: #3fd0e6; letter-spacing: 0.06em; font-weight: 600; }
    .nb-links { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0; padding: 0; }
    .nb-link {
      position: relative; display: flex; align-items: center; gap: 7px;
      padding: 7px 13px; border-radius: 10px; text-decoration: none;
      font-size: 13.5px; font-weight: 500; color: #8fb3bb;
      transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
      white-space: nowrap;
    }
    .nb-link:hover { color: #3fd0e6; background: rgba(63,208,230,0.07); transform: translateY(-1px); }
    .nb-link.nb-active { color: #3fd0e6; background: rgba(63,208,230,0.08); font-weight: 600; }
    .nb-link.nb-active::after {
      content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
      width: 60%; height: 2px; border-radius: 2px;
      background: linear-gradient(90deg, transparent, #3fd0e6, transparent);
    }
    .nb-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .nb-cta {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 18px; border-radius: 999px;
      background: linear-gradient(135deg, #0e7490 0%, #0a5c73 100%);
      color: #d9f3f7; font-weight: 700; font-size: 13.5px;
      text-decoration: none; white-space: nowrap;
      border: 1px solid rgba(63,208,230,0.25);
      box-shadow: 0 4px 16px rgba(63,208,230,0.18);
      transition: all 0.3s cubic-bezier(.34,1.56,.64,1);
    }
    .nb-cta:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 28px rgba(63,208,230,0.28); }
    .nb-cta:active { transform: scale(0.97); }
    .nb-logout {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 13px; border-radius: 10px;
      color: #f87171; font-size: 13px; font-weight: 500;
      text-decoration: none; cursor: pointer; background: none; border: none;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .nb-logout:hover { color: #fca5a5; background: rgba(239,68,68,0.08); }
    .nb-ham {
      display: none; width: 38px; height: 38px; border-radius: 10px;
      border: 1.5px solid rgba(63,208,230,0.18); background: rgba(6,47,54,0.5);
      cursor: pointer; color: #3fd0e6;
      align-items: center; justify-content: center;
      transition: all 0.2s ease; flex-shrink: 0;
    }
    .nb-ham:hover { background: rgba(63,208,230,0.12); }
    .nb-drawer { display: none; position: fixed; inset: 0; z-index: 200; }
    .nb-drawer.nb-open { display: block; }
    .nb-drawer-backdrop { position: absolute; inset: 0; background: rgba(2,20,23,0.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
    .nb-drawer-panel {
      position: absolute; top: 0; right: 0; bottom: 0; width: min(320px, 88vw);
      background: rgba(2,20,23,0.97);
      border-left: 1px solid rgba(63,208,230,0.12);
      backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
      display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform 0.32s cubic-bezier(.23,1,.32,1);
      box-shadow: -8px 0 48px rgba(0,0,0,0.4);
    }
    .nb-drawer.nb-open .nb-drawer-panel { transform: translateX(0); }
    .nb-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid rgba(63,208,230,0.08); }
    .nb-drawer-close {
      width: 36px; height: 36px; border-radius: 10px;
      border: 1.5px solid rgba(63,208,230,0.15); background: rgba(6,47,54,0.5);
      cursor: pointer; color: #3fd0e6;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
    }
    .nb-drawer-close:hover { background: rgba(63,208,230,0.12); }
    .nb-drawer-nav { flex: 1; overflow-y: auto; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nb-drawer-link {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px;
      text-decoration: none; color: #8fb3bb; font-size: 15px; font-weight: 500;
      transition: all 0.2s ease; min-height: 52px;
    }
    .nb-drawer-link:hover, .nb-drawer-link.nb-active { background: rgba(63,208,230,0.07); color: #3fd0e6; }
    .nb-drawer-icon-wrap {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(6,47,54,0.5); border: 1px solid rgba(63,208,230,0.12);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.2s ease;
    }
    .nb-drawer-link:hover .nb-drawer-icon-wrap, .nb-drawer-link.nb-active .nb-drawer-icon-wrap { background: rgba(63,208,230,0.12); }
    .nb-drawer-footer { padding: 16px 20px; border-top: 1px solid rgba(63,208,230,0.08); display: flex; flex-direction: column; gap: 10px; }
    .nb-drawer-cta {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 13px; border-radius: 14px;
      background: linear-gradient(135deg, #0e7490 0%, #0a5c73 100%);
      color: #d9f3f7; font-weight: 700; font-size: 14px; text-decoration: none;
      border: 1px solid rgba(63,208,230,0.25);
      box-shadow: 0 4px 16px rgba(63,208,230,0.18); transition: all 0.25s ease;
    }
    .nb-drawer-cta:hover { box-shadow: 0 8px 28px rgba(63,208,230,0.28); }
    @media (max-width: 767px) {
      .nb-links { display: none !important; }
      .nb-cta { display: none !important; }
      .nb-logout { display: none !important; }
      .nb-ham { display: flex !important; }
      .nb-logo-sub { display: none; }
      .nb-inner { padding: 0 16px; min-height: 56px; }
      .nb-logo { flex: 1; justify-content: center; }
      .nb-logo-icon { width: 36px; height: 36px; flex-shrink: 0; }
      .nb-logo-title { font-size: 12px; }
    }
    @media (max-width: 380px) { .nb-logo-title { font-size: 11px; } .nb-logo-icon { width: 30px; height: 30px; } }
  `;

  function buildNavbar() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
    const isLoggedIn = !!(user && localStorage.getItem('token'));

    const desktopLinks = NAV.map(n => {
      const active = page === n.href ? ' nb-active' : '';
      return `<li><a href="${n.href}" class="nb-link${active}">${n.icon}<span>${n.label}</span></a></li>`;
    }).join('');

    const mobileLinks = NAV.map(n => {
      const active = page === n.href ? ' nb-active' : '';
      return `<a href="${n.href}" class="nb-drawer-link${active}"><span class="nb-drawer-icon-wrap">${n.icon}</span><span>${n.label}</span></a>`;
    }).join('');

    const ctaHref  = 'login.html';
    const ctaLabel = 'Login';
    const ctaIcon  = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;

    const logoutBtn = isLoggedIn
      ? `<button class="nb-logout" onclick="nbLogout()"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>` : '';

    return `
      <nav id="nb-root">
        <canvas id="nb-neural-canvas"></canvas>
        <div class="nb-inner">
          <a href="index.html" class="nb-logo">
            <div class="nb-logo-icon">${LOGO_SVG}</div>
            <div class="nb-logo-text">
              <span class="nb-logo-title"><h1>AI T20 Championship</h1></span>
              <span class="nb-logo-sub">Competition 2026 · AAACET</span>
            </div>
          </a>
          <ul class="nb-links">${desktopLinks}</ul>
          <div class="nb-actions">
            ${logoutBtn}
            <a href="${ctaHref}" class="nb-cta">${ctaIcon}${ctaLabel}</a>
            <button class="nb-ham" id="nb-ham" onclick="nbOpenDrawer()" aria-label="Open menu">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </nav>
      <div class="nb-drawer" id="nb-drawer">
        <div class="nb-drawer-backdrop" onclick="nbCloseDrawer()"></div>
        <div class="nb-drawer-panel">
          <div class="nb-drawer-head">
            <a href="index.html" class="nb-logo" onclick="nbCloseDrawer()">
              <div class="nb-logo-icon">${LOGO_SVG}</div>
              <div class="nb-logo-text"><span class="nb-logo-title">AAACET AI Championship</span></div>
            </a>
            <button class="nb-drawer-close" onclick="nbCloseDrawer()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <nav class="nb-drawer-nav">${mobileLinks}</nav>
          <div class="nb-drawer-footer">
            <a href="${ctaHref}" class="nb-drawer-cta" onclick="nbCloseDrawer()">${ctaIcon} ${ctaLabel}</a>
            ${isLoggedIn ? `<button class="nb-logout" style="justify-content:center;width:100%;padding:10px;border-radius:12px;border:1px solid rgba(239,68,68,0.15);background:rgba(239,68,68,0.04)" onclick="nbLogout()"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  function startNeuralAnimation() {
    const canvas = document.getElementById('nb-neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];

    function resize() {
      const isMobile = window.innerWidth < 768;
      canvas.width = window.innerWidth;
      canvas.height = isMobile ? 56 : 64;
      nodes = [];
      const count = isMobile ? 15 : Math.floor(canvas.width / 40);
      const maxDist = isMobile ? 60 : 120;
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: isMobile ? 1.5 : Math.random() * 2 + 1.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 28; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.04;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      // Draw connections
      const maxDist = window.innerWidth < 768 ? 55 : 120;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(63,208,230,${0.18 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(n => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(63,208,230,${0.5 + glow * 0.4})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(63,208,230,0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function inject() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    const root = document.getElementById('navbar-root');
    if (!root) return;
    root.innerHTML = buildNavbar();
    startNeuralAnimation();
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('nb-root');
      if (!nav) return;
      const current = window.scrollY;
      nav.classList.toggle('nb-scrolled', current > 20);
      if (current > lastScroll && current > 80) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastScroll = current;
    }, { passive: true });
  }

  window.nbOpenDrawer  = function () { const d = document.getElementById('nb-drawer'); if (d) { d.classList.add('nb-open'); document.body.style.overflow = 'hidden'; } };
  window.nbCloseDrawer = function () { const d = document.getElementById('nb-drawer'); if (d) { d.classList.remove('nb-open'); document.body.style.overflow = ''; } };
  window.nbLogout      = function () { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'login.html'; };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', inject); } else { inject(); }
})();
