/* ============================================
   12⋮12am™ — Base Animations & Navigation
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {

  // ── Reveal-up observer for non-GSAP elements ──
  const revealElements = document.querySelectorAll('.reveal-up');
  if (revealElements.length && 'IntersectionObserver' in window) {
    const homeEl = document.getElementById('pg-home');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { root: homeEl, threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach(el => obs.observe(el));
  }

  // ── Eco-panel navigation (click → page) ──
  document.querySelectorAll('.eco-panel[data-page]').forEach(panel => {
    panel.addEventListener('click', (e) => {
      e.preventDefault();
      const page = panel.getAttribute('data-page');
      if (window.navigate) window.navigate(page);
    });
  });

});
