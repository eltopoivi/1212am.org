document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  window.navigate = function(pageId, updateUrl = true) {
    if(pageId === 'cart') {
      if(window.openCartDrawer) window.openCartDrawer();
      if(mobileMenu) mobileMenu.classList.remove("open");
      return; 
    }

    pages.forEach(page => page.classList.remove("active"));
    navLinks.forEach(link => link.classList.remove("active"));

    const target = document.getElementById("pg-" + pageId);
    if (target) target.classList.add("active");

    const activeLinks = document.querySelectorAll(`nav [data-page="${pageId}"], .nav__mobile [data-page="${pageId}"]`);
    activeLinks.forEach(link => link.classList.add("active"));

    window.scrollTo(0, 0);

    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
    }

    if (updateUrl) {
      const newUrl = pageId === "home" ? "/" : "/" + pageId;
      history.pushState({ page: pageId }, "", newUrl);
    }

    if (pageId === 'checkout' && window.initializeStripeCheckout) {
      window.initializeStripeCheckout();
    }

    if (pageId === 'ai36912' && window.renderChatUI) {
      window.renderChatUI();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.navigate(link.getAttribute("data-page")); 
    });
  });

  homeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.navigate(link.getAttribute("data-page") || "home");
    });
  });

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.page) {
      window.navigate(e.state.page, false);
    } else {
      window.navigate("home", false);
    }
  });

  const path = window.location.pathname.replace("/", "");
  const initialPage = path ? path : "home";
  
  if (document.getElementById("pg-" + initialPage)) {
    window.navigate(initialPage, false);
    history.replaceState({ page: initialPage }, "", window.location.pathname);
  } else {
    window.navigate("home", false);
    history.replaceState({ page: "home" }, "", "/");
  }
});
