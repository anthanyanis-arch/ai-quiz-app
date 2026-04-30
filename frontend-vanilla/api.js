// api.js — drop this in frontend-vanilla/ and include before any page script
// Automatically load-balances between 2 Render backend instances
(function () {
  const BACKENDS = [
    'https://ai-quiz-backend-1.onrender.com/api',
    'https://ai-quiz-backend-2.onrender.com/api',
  ];

  // Pick backend based on a random sticky session stored in sessionStorage
  // Same user always hits the same backend during their session
  let idx = sessionStorage.getItem('_backend_idx');
  if (idx === null) {
    idx = Math.floor(Math.random() * BACKENDS.length);
    sessionStorage.setItem('_backend_idx', idx);
  }

  window.API = BACKENDS[parseInt(idx)];
  console.log('[LB] Using backend:', window.API);
})();
