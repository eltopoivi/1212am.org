document.addEventListener("DOMContentLoaded", () => {
  
  // === NAVEGACIÓN URL Y MENÚ ===
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  function navigate(pageId, updateUrl = true) {
    // Evitar que el carrito abra una pagina entera (ahora es el Drawer lateral)
    if(pageId === 'cart') {
      openCartDrawer();
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
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");
      navigate(pageId); 
    });
  });

  homeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page") || "home";
      navigate(pageId);
    });
  });

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.page) {
      navigate(e.state.page, false);
    } else {
      navigate("home", false);
    }
  });

  const path = window.location.pathname.replace("/", "");
  const initialPage = path ? path : "home";
  
  if (document.getElementById("pg-" + initialPage)) {
    navigate(initialPage, false);
    history.replaceState({ page: initialPage }, "", window.location.pathname);
  } else {
    navigate("home", false);
    history.replaceState({ page: "home" }, "", "/");
  }


  // === FUNCIONES PARA LLAMAR A LA PÁGINA DE PRODUCTO ===
  window.openProduct = function(title, price, emoji) {
    document.getElementById("product-page-title").innerText = title;
    document.getElementById("product-page-price").innerText = `$${price} USD`;
    document.getElementById("product-page-emoji").innerText = emoji;
    navigate('product');
  };


  // === LÓGICA DE FILTROS EN LA TIENDA ===
  let filterState = {
    gender: 'women', 
    type: 'apparel',
    category: 'all'
  };

  const filterBtns = document.querySelectorAll('.filter-btn');
  const shopCards = document.querySelectorAll('.shop-card');
  const rowCategory = document.getElementById('filter-category');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter');
      const val = btn.getAttribute('data-val');
      
      filterState[type] = val;

      const siblings = btn.parentElement.querySelectorAll('.filter-btn');
      siblings.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');

      if (type === 'type') {
        filterState.category = 'all'; 
        const catBtns = rowCategory.querySelectorAll('.filter-btn');
        catBtns.forEach(s => s.classList.remove('active'));
        if(catBtns.length > 0) catBtns[0].classList.add('active');
        
        if (val === 'accessories') {
          rowCategory.classList.add('hidden');
        } else {
          rowCategory.classList.remove('hidden');
        }
      }

      shopCards.forEach(card => {
        const cGender = card.getAttribute('data-gender');
        const cType = card.getAttribute('data-type');
        const cCategory = card.getAttribute('data-category');

        if(!cGender || !cType || !cCategory) return;

        const genderArr = cGender.split(',');
        let matchGender = genderArr.includes(filterState.gender) || genderArr.includes('all');
        let matchType = (cType === filterState.type);
        let matchCat = (filterState.category === 'all') || (cCategory === filterState.category);

        if (matchGender && matchType && matchCat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  const defaultFilter = document.querySelector('[data-filter="gender"][data-val="women"]');
  if (defaultFilter) defaultFilter.click();


  // === LÓGICA DEL CARRITO LATERAL (DRAWER) E-COMMERCE ===
  let cart = []; 
  
  const drawerOverlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  
  const drawerItemsContainer = document.getElementById('drawer-items-container');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const cartBadge = document.getElementById('cart-badge');
  const drawerCheckoutBtn = document.getElementById('drawer-checkout-btn');

  // Checkout page elements
  const checkoutSummary = document.getElementById('checkout-summary-items');
  const checkoutTotalPrice = document.getElementById('checkout-total-price');
  const checkoutFinalTotal = document.getElementById('checkout-final-total');

  function openCartDrawer() {
    drawerOverlay.classList.add('open');
    drawer.classList.add('open');
  }

  function closeCartDrawer() {
    drawerOverlay.classList.remove('open');
    drawer.classList.remove('open');
  }

  if(openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
  if(closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if(drawerOverlay) drawerOverlay.addEventListener('click', closeCartDrawer);

  window.renderCart = function() {
    if (!drawerItemsContainer) return;
    
    drawerItemsContainer.innerHTML = '';
    if(checkoutSummary) checkoutSummary.innerHTML = '';
    
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
      drawerItemsContainer.innerHTML = '<p style="text-align:center; margin-top: 3rem; color: var(--gr-l);">Your cart is empty.</p>';
      drawerSubtotal.innerText = '$0.00 USD';
      cartBadge.innerText = '0';
      if(checkoutTotalPrice) checkoutTotalPrice.innerText = '$0.00 USD';
      if(checkoutFinalTotal) checkoutFinalTotal.innerText = '$0.00 USD';
      return;
    }

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      totalItems += item.qty;

      // HTML del item dentro del cajón lateral
      drawerItemsContainer.innerHTML += `
        <div class="drawer-item">
          <div class="drawer-emoji"><span>${item.emoji}</span></div>
          <div class="drawer-info">
            <div>
              <p class="drawer-title">${item.name}</p>
              <p class="drawer-variant">Size: ${item.size}</p>
            </div>
            <div class="drawer-actions">
              <div class="qty-control-mini">
                <button onclick="updateItemQty(${index}, -1)">-</button>
                <input type="text" value="${item.qty}" readonly>
                <button onclick="updateItemQty(${index}, 1)">+</button>
              </div>
              <button class="drawer-remove" onclick="removeItem(${index})">Remove</button>
            </div>
            <div class="drawer-price">$${itemTotal.toFixed(2)}</div>
          </div>
        </div>
      `;

      // HTML del item en la página de Checkout
      if(checkoutSummary) {
        checkoutSummary.innerHTML += `
          <div class="checkout-sum-item">
            <div class="checkout-sum-emoji">
              <span>${item.emoji}</span>
              <div class="checkout-sum-qty">${item.qty}</div>
            </div>
            <div class="checkout-sum-info">
              <span style="font-weight:bold; font-size:0.9rem;">${item.name}</span>
              <span style="font-size:0.8rem; color:var(--gr-l)">Size: ${item.size}</span>
            </div>
            <div style="font-weight: 600; font-size:0.95rem;">$${itemTotal.toFixed(2)}</div>
          </div>
        `;
      }
    });

    cartBadge.innerText = totalItems;
    drawerSubtotal.innerText = `$${total.toFixed(2)} USD`;
    if(checkoutTotalPrice) checkoutTotalPrice.innerText = `$${total.toFixed(2)} USD`;
    if(checkoutFinalTotal) checkoutFinalTotal.innerText = `$${total.toFixed(2)} USD`;
  }

  window.updateItemQty = function(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) cart[index].qty = 1; 
    window.renderCart();
  };

  window.removeItem = function(index) {
    cart.splice(index, 1);
    window.renderCart();
  };

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const sizeSelect = document.getElementById('prod-size');
      const selectedSize = sizeSelect && sizeSelect.value !== "Choose your size" ? sizeSelect.value : "M";

      // Leemos los datos de la UI actual de la página de producto
      const pTitle = document.getElementById("product-page-title").innerText;
      const pPriceStr = document.getElementById("product-page-price").innerText; // "$39.00 USD"
      const pEmoji = document.getElementById("product-page-emoji").innerText;
      const pPriceNum = parseFloat(pPriceStr.replace(/[^0-9.]/g, '')); // Extraemos solo el número

      cart.push({
        name: pTitle,
        price: pPriceNum,
        size: selectedSize,
        qty: 1,
        emoji: pEmoji
      });

      window.renderCart();
      openCartDrawer(); // Abrimos la animación del carrito automáticamente
    });
  }

  // Si damos click a Checkout en el carrito lateral
  if(drawerCheckoutBtn) {
    drawerCheckoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      navigate('checkout');
    });
  }

  window.renderCart();
});
