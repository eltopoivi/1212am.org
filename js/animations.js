/* ============================================
   12⋮12am™ — Scroll Reveal & Animations
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ── Scroll-reveal via IntersectionObserver ──
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings slightly
          const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
          let delay = 0;
          siblings.forEach((sib, idx) => {
            if (sib === entry.target) delay = idx * 80;
          });
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // ── Hide scroll hint on scroll ──
  const homeEl = document.getElementById('pg-home');
  const scrollHint = document.querySelector('.home__scroll-hint');

  if (homeEl && scrollHint) {
    homeEl.addEventListener('scroll', () => {
      if (homeEl.scrollTop > 80) {
        scrollHint.style.opacity = '0';
        scrollHint.style.transition = 'opacity 0.5s';
      } else {
        scrollHint.style.opacity = '';
        scrollHint.style.transition = '';
      }
    }, { passive: true });
  }

  // ── Eco-card navigation (they have data-page) ──
  document.querySelectorAll('.eco-card[data-page]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const page = card.getAttribute('data-page');
      if (window.navigate) window.navigate(page);
    });
  });

});
