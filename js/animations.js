/* ============================================
   12⋮12am™ — Scroll Reveal & Animations
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ── Scroll-reveal via IntersectionObserver ──
  function initRevealObserver() {
    const revealElements = document.querySelectorAll('.reveal-up');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll('.reveal-up')) : [];
            const idx = siblings.indexOf(entry.target);
            const delay = idx >= 0 ? idx * 100 : 0;
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        root: document.getElementById('pg-home'),
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-visible'));
    }
  }

  initRevealObserver();

  // ── Scroll hint: click to scroll down ──
  const homeEl = document.getElementById('pg-home');
  const scrollHintBtn = document.getElementById('scroll-hint-btn');
  const firstSection = document.getElementById('section-signal');

  if (scrollHintBtn && homeEl && firstSection) {
    scrollHintBtn.addEventListener('click', () => {
      const targetTop = firstSection.offsetTop;
      homeEl.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  }

  // ── Hide scroll hint on scroll ──
  if (homeEl && scrollHintBtn) {
    homeEl.addEventListener('scroll', () => {
      if (homeEl.scrollTop > 100) {
        scrollHintBtn.style.opacity = '0';
        scrollHintBtn.style.pointerEvents = 'none';
        scrollHintBtn.style.transition = 'opacity 0.4s';
      } else {
        scrollHintBtn.style.opacity = '';
        scrollHintBtn.style.pointerEvents = '';
        scrollHintBtn.style.transition = '';
      }
    }, { passive: true });
  }

  // ── Eco-card navigation ──
  document.querySelectorAll('.eco-card[data-page]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const page = card.getAttribute('data-page');
      if (window.navigate) window.navigate(page);
    });
  });

});
