/* ============================================
   12⋮12am™ — Last Survivors Research Lab
   Filtering & interactions
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ── Category filter buttons ──
  const filterBtns = document.querySelectorAll('.lab-filter-btn');
  const pubs = document.querySelectorAll('.lab-pub');

  function filterResearch(cat) {
    // Update active button
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-labcat') === cat);
    });

    // Show/hide publications
    pubs.forEach(pub => {
      if (cat === 'all' || pub.getAttribute('data-cat') === cat) {
        pub.classList.remove('lab-hidden');
      } else {
        pub.classList.add('lab-hidden');
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterResearch(btn.getAttribute('data-labcat'));
    });
  });

  // ── Domain card "Explore" buttons → scroll to research + filter ──
  const domainBtns = document.querySelectorAll('.lab-domain-card__btn[data-labfilter]');
  const researchSection = document.getElementById('lab-research');
  const labPage = document.getElementById('pg-lastsurvivors');

  domainBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-labfilter');

      // Activate the filter
      filterResearch(cat);

      // Scroll to research section within the page container
      if (researchSection && labPage) {
        const offset = researchSection.offsetTop - 20;
        labPage.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    });
  });

});
