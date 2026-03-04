document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  // Sistema de navegación
  function navigate(pageId) {
    pages.forEach(page => page.classList.remove("active"));
    navLinks.forEach(link => link.classList.remove("active"));

    const target = document.getElementById("pg-" + pageId);
    if (target) target.classList.add("active");

    const activeLinks = document.querySelectorAll(`[data-page="${pageId}"]`);
    activeLinks.forEach(link => link.classList.add("active"));

    window.scrollTo(0, 0);

    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
    }
  }

  // Click en cualquier enlace data-page (menú, tarjetas tienda, botones checkout)
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");
      navigate(pageId);
    });
  });

  // Logos y botones back
  homeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page") || "home";
      navigate(pageId);
    });
  });

  // Menú hamburguesa móvil
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }
});

// Función E-commerce Global: Cambiar Cantidad (+ y -)
window.updateQty = function(inputId, change) {
  const input = document.getElementById(inputId);
  if (input) {
    let currentVal = parseInt(input.value);
    if (isNaN(currentVal)) currentVal = 1;
    let newVal = currentVal + change;
    
    if (newVal < 1) newVal = 1;
    input.value = newVal;
  }
};
