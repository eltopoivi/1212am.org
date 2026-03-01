/* ============================================
   12⋮12am™ — SPA Router
   ============================================ */

const App = (() => {
  function navigate(page) {
    if (!document.getElementById('pg-' + page)) return;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('pg-' + page);
    target.classList.add('active');
    target.scrollTop = 0;

    document.querySelectorAll('.nav__links a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    if (page === 'home') {
      history.pushState(null, '', window.location.pathname);
    } else {
      history.pushState(null, '', '#' + page);
    }
  }

  function toggleMobile() {
    document.getElementById('mobileMenu').classList.toggle('open');
  }

  function init() {
    // Nav links
    document.querySelectorAll('[data-page]').forEach(a => {
      a.addEventListener('click', () => {
        navigate(a.dataset.page);
        document.getElementById('mobileMenu').classList.remove('open');
      });
    });

    // Logo / home
    document.querySelectorAll('[data-home]').forEach(el => {
      el.addEventListener('click', () => navigate('home'));
    });

    // Back buttons
    document.querySelectorAll('[data-back]').forEach(el => {
      el.addEventListener('click', () => navigate('home'));
    });

    // Hamburger
    document.querySelector('.nav__hamburger')?.addEventListener('click', toggleMobile);

    // Browser history
    window.addEventListener('popstate', () => {
      navigate(location.hash.replace('#', '') || 'home');
    });

    // Initial route
    const hash = location.hash.replace('#', '');
    if (hash) navigate(hash);
  }

  return { init, navigate };
})();

document.addEventListener('DOMContentLoaded', App.init);
