/* ============================================
   12⋮12am™ — SPA Router & Navigation
   ============================================ */

const App = (() => {
  let currentPage = 'home';

  // Navigate to a page
  function navigate(page) {
    if (!document.getElementById('pg-' + page)) return;

    // Remove active from all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Activate target
    const target = document.getElementById('pg-' + page);
    target.classList.add('active');

    // Update nav highlights
    document.querySelectorAll('.nav__links a').forEach(a => {
      a.classList.remove('active');
      const dest = a.dataset.page;
      if (dest === page) a.classList.add('active');
    });

    // Scroll page content to top
    target.scrollTop = 0;

    // Update hash
    if (page === 'home') {
      history.pushState(null, '', window.location.pathname);
    } else {
      history.pushState(null, '', '#' + page);
    }

    currentPage = page;
  }

  // Toggle mobile menu
  function toggleMobile() {
    document.getElementById('mobileMenu').classList.toggle('open');
  }

  function closeMobile() {
    document.getElementById('mobileMenu').classList.remove('open');
  }

  // Initialize
  function init() {
    // Desktop nav clicks
    document.querySelectorAll('.nav__links a').forEach(a => {
      a.addEventListener('click', () => navigate(a.dataset.page));
    });

    // Mobile nav clicks
    document.querySelectorAll('.nav__mobile a').forEach(a => {
      a.addEventListener('click', () => {
        navigate(a.dataset.page);
        closeMobile();
      });
    });

    // Logo click
    document.querySelectorAll('[data-home]').forEach(el => {
      el.addEventListener('click', () => navigate('home'));
    });

    // Back buttons
    document.querySelectorAll('[data-back]').forEach(el => {
      el.addEventListener('click', () => navigate('home'));
    });

    // Hamburger
    document.querySelector('.nav__hamburger')?.addEventListener('click', toggleMobile);

    // Browser back/forward
    window.addEventListener('popstate', () => {
      const hash = location.hash.replace('#', '') || 'home';
      navigate(hash);
    });

    // Initial route
    const hash = location.hash.replace('#', '');
    if (hash && hash !== '') {
      navigate(hash);
    }
  }

  return { init, navigate };
})();

document.addEventListener('DOMContentLoaded', App.init);
