document.addEventListener("DOMContentLoaded", () => {
  // Obtenemos todos los elementos interactivos
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  // Función principal para cambiar de página
  function navigate(pageId) {
    // 1. Ocultar todas las páginas
    pages.forEach(page => page.classList.remove("active"));
    
    // 2. Quitar el color "activo" de todos los enlaces del menú
    navLinks.forEach(link => link.classList.remove("active"));

    // 3. Mostrar la página objetivo
    const target = document.getElementById("pg-" + pageId);
    if (target) {
      target.classList.add("active");
    }

    // 4. Marcar como activo el enlace pulsado (solo si existe en el nav principal)
    const activeLinks = document.querySelectorAll(`.nav__links [data-page="${pageId}"], .nav__mobile [data-page="${pageId}"]`);
    activeLinks.forEach(link => link.classList.add("active"));

    // 5. Volver siempre arriba al cargar la página
    window.scrollTo(0, 0);

    // 6. Si estábamos en el menú del móvil, lo cerramos
    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
    }
  }

  // Asignar evento click a todos los enlaces data-page (menu, productos, checkout)
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");
      navigate(pageId);
    });
  });

  // Asignar evento click al logo de "12:12am" y botones de "Volver"
  homeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page") || "home";
      navigate(pageId);
    });
  });

  // Funcionalidad de abrir/cerrar el menú en móviles (Hamburguesa)
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }
});
