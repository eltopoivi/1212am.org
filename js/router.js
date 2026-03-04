document.addEventListener("DOMContentLoaded", () => {
  // === NAVEGACIÓN Y MENÚ ===
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  function navigate(pageId) {
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


  // === LÓGICA DE FILTROS EN LA TIENDA ===
  let filterState = {
    gender: 'women', // Estado por defecto
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
      
      // Actualizar estado
      filterState[type] = val;

      // Actualizar UI de los botones (poner active al pulsado y quitar a hermanos)
      const siblings = btn.parentElement.querySelectorAll('.filter-btn');
      siblings.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');

      // Si cambia a "Accessories", esconder subcategorías (T-shirts, pants...)
      if (type === 'type') {
        filterState.category = 'all'; // Reseteamos subcategoria
        const catBtns = rowCategory.querySelectorAll('.filter-btn');
        catBtns.forEach(s => s.classList.remove('active'));
        catBtns[0].classList.add('active'); // Ponemos "All" como activo
        
        if (val === 'accessories') {
          rowCategory.classList.add('hidden');
        } else {
          rowCategory.classList.remove('hidden');
        }
      }

      // Aplicar filtros a las tarjetas
      shopCards.forEach(card => {
        const cGender = card.getAttribute('data-gender').split(',');
        const cType = card.getAttribute('data-type');
        const cCategory = card.getAttribute('data-category');

        let matchGender = cGender.includes(filterState.gender) || cGender.includes('all');
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

  // Forzar un click inicial para configurar el estado por defecto
  const defaultFilter = document.querySelector('[data-filter="gender"][data-val="women"]');
  if (defaultFilter) defaultFilter.click();


  // === LÓGICA DEL CARRITO (AÑADIR, QUITAR, SUMAR) ===
  let cart = []; 
  
  const cartContainer = document.getElementById('cart-items-container');
  const cartSubtotal = document.getElementById('cart-subtotal-price');
  const checkoutSummary = document.getElementById('checkout-summary-items');
  const checkoutTotalPrice = document.getElementById('checkout-total-price');
  const checkoutFinalTotal = document.getElementById('checkout-final-total');

  // Función para re-dibujar el carrito y calcular totales
  window.renderCart = function() {
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    if(checkoutSummary) checkoutSummary.innerHTML = '';
    
    let total = 0;

    if (cart.length === 0) {
      cartContainer.innerHTML = '<p style="text-align:center; padding: 3rem 0; color: var(--gr-l);">Your cart is currently empty.</p>';
      cartSubtotal.innerText = '$0.00 USD';
      if(checkoutTotalPrice) checkoutTotalPrice.innerText = '$0.00 USD';
      if(checkoutFinalTotal) checkoutFinalTotal.innerText = '$0.00 USD';
      return;
    }

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      cartContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-product">
            <div class="cart-emoji-box"><span>${item.emoji}</span></div>
            <div class="cart-item-info">
              <span class="cart-item-name">${item.name}</span>
              <p class="cart-item-variant">Size: ${item.size}</p>
              <p class="cart-item-price">$${item.price.toFixed(2)} USD</p>
            </div>
          </div>
          <div class="cart-item-qty text-center">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
              <input type="text" value="${item.qty}" readonly>
              <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
            </div>
            <button class="cart-remove" onclick="removeItem(${index})">Remove</button>
          </div>
          <div class="cart-item-total text-right">$${itemTotal.toFixed(2)} USD</div>
        </div>
      `;

      if(checkoutSummary) {
        checkoutSummary.innerHTML += `
          <div class="checkout-sum-item">
            <div class="checkout-sum-emoji">
              <span>${item.emoji}</span>
              <div class="checkout-sum-qty">${item.qty}</div>
            </div>
            <div class="checkout-sum-info">
              <span style="font-weight:bold;">${item.name}</span>
              <span style="font-size:0.8rem; color:var(--gr-l)">Size: ${item.size}</span>
            </div>
            <div style="font-weight: 600;">$${itemTotal.toFixed(2)}</div>
          </div>
        `;
      }
    });

    cartSubtotal.innerText = `$${total.toFixed(2)} USD`;
    if(checkoutTotalPrice) checkoutTotalPrice.innerText = `$${total.toFixed(2)} USD`;
    if(checkoutFinalTotal) checkoutFinalTotal.innerText = `$${total.toFixed(2)} USD`;
  }

  // Modificar cantidad en el carrito (Global para el botón onClick del HTML)
  window.updateItemQty = function(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) cart[index].qty = 1; 
    window.renderCart();
  };

  // Eliminar producto del carrito
  window.removeItem = function(index) {
    cart.splice(index, 1);
    window.renderCart();
  };

  // Botón "Add to Cart" en la página de producto
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const sizeSelect = document.getElementById('prod-size');
      const selectedSize = sizeSelect && sizeSelect.value !== "Choose your size" ? sizeSelect.value : "M";

      // Lógica simple para añadir un producto base (Para escalarlo después puedes leer el title/price dinámico)
      cart.push({
        name: "12⋮12am Product",
        price: 39.00,
        size: selectedSize,
        qty: 1,
        emoji: "🎽"
      });

      window.renderCart();
    });
  }

  // Inicializar carrito
  window.renderCart();
});
