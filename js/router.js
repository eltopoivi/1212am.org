document.addEventListener("DOMContentLoaded", () => {
  
  // === NAVEGACIÓN URL Y MENÚ ===
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const homeLinks = document.querySelectorAll("[data-home], [data-back]");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".nav__hamburger");

  function navigate(pageId, updateUrl = true) {
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

    if (pageId === 'checkout') {
      initializeStripeCheckout();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.getAttribute("data-page")); 
    });
  });

  homeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.getAttribute("data-page") || "home");
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


  // === FUNCIONES PÁGINA DE PRODUCTO ===
  window.openProduct = function(title, price, emoji) {
    document.getElementById("product-page-title").innerText = title;
    document.getElementById("product-page-price").innerText = `$${price} USD`;
    document.getElementById("product-page-emoji").innerText = emoji;
    navigate('product');
  };


  // === LÓGICA DE FILTROS EN LA TIENDA ===
  let filterState = { gender: 'women', type: 'apparel', category: 'all' };
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
        if (val === 'accessories') { rowCategory.classList.add('hidden'); } 
        else { rowCategory.classList.remove('hidden'); }
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

        if (matchGender && matchType && matchCat) { card.classList.remove('hidden'); } 
        else { card.classList.add('hidden'); }
      });
    });
  });

  const defaultFilter = document.querySelector('[data-filter="gender"][data-val="women"]');
  if (defaultFilter) defaultFilter.click();


  // === LÓGICA DEL CARRITO LATERAL ===
  let cart = []; 
  
  const drawerOverlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  
  const drawerItemsContainer = document.getElementById('drawer-items-container');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const cartBadge = document.getElementById('cart-badge');
  const drawerCheckoutBtn = document.getElementById('drawer-checkout-btn');

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
    let total = 0; let totalItems = 0;

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
      total += itemTotal; totalItems += item.qty;

      drawerItemsContainer.innerHTML += `
        <div class="drawer-item">
          <div class="drawer-emoji"><span>${item.emoji}</span></div>
          <div class="drawer-info">
            <div><p class="drawer-title">${item.name}</p><p class="drawer-variant">Size: ${item.size}</p></div>
            <div class="drawer-actions">
              <div class="qty-control-mini"><button onclick="updateItemQty(${index}, -1)">-</button><input type="text" value="${item.qty}" readonly><button onclick="updateItemQty(${index}, 1)">+</button></div>
              <button class="drawer-remove" onclick="removeItem(${index})">Remove</button>
            </div>
            <div class="drawer-price">$${itemTotal.toFixed(2)}</div>
          </div>
        </div>
      `;

      if(checkoutSummary) {
        checkoutSummary.innerHTML += `
          <div class="checkout-sum-item">
            <div class="checkout-sum-emoji"><span>${item.emoji}</span><div class="checkout-sum-qty">${item.qty}</div></div>
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
    if(cart.length === 0 && window.location.pathname === "/checkout") navigate("store");
  };

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const sizeSelect = document.getElementById('prod-size');
      const selectedSize = sizeSelect && sizeSelect.value !== "Choose your size" ? sizeSelect.value : "M";
      const pTitle = document.getElementById("product-page-title").innerText;
      const pPriceStr = document.getElementById("product-page-price").innerText;
      const pEmoji = document.getElementById("product-page-emoji").innerText;
      const pPriceNum = parseFloat(pPriceStr.replace(/[^0-9.]/g, '')); 

      cart.push({ name: pTitle, price: pPriceNum, size: selectedSize, qty: 1, emoji: pEmoji });
      window.renderCart(); openCartDrawer(); 
    });
  }

  if(drawerCheckoutBtn) {
    drawerCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return alert("Your cart is empty!");
      closeCartDrawer(); navigate('checkout');
    });
  }

  window.renderCart();

  // === STRIPE PAYMENTS INTEGRATION ===
  let stripe;
  let elements;
  
  async function initializeStripeCheckout() {
    if (cart.length === 0 || !window.Stripe) return;
    stripe = Stripe("pk_test_51OSyRzJBofJrA2IJwoX5nP2M0EEr503OnYe644dU61WPlomTvWVcTnODZ7ASU436LWO8i3TsmZK8hnNzvxwQTsQ800mkXMQUFL");

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const appearance = {
        theme: 'night',
        variables: { fontFamily: '"Exo 2", sans-serif', colorText: '#ffffff', colorBackground: '#161616', colorDanger: '#ff0000', colorPrimary: '#FFD600', borderColor: '#1e1e1e', borderRadius: '4px' }
      };

      elements = stripe.elements({ appearance, clientSecret: data.clientSecret });
      const paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");
    } catch (error) {
      console.error("Stripe Error:", error);
      document.querySelector("#payment-message").textContent = "Error initializing payment.";
      document.querySelector("#payment-message").classList.remove("hidden");
    }
  }

  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/success",
          receipt_email: document.getElementById("checkout-email").value,
        },
        redirect: 'if_required' 
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") showMessage(error.message);
        else showMessage("An unexpected error occurred.");
        setLoading(false);
      } else {
        cart = []; window.renderCart(); navigate("success"); setLoading(false);
      }
    });
  }

  function showMessage(messageText) {
    const msgContainer = document.querySelector("#payment-message");
    msgContainer.classList.remove("hidden"); msgContainer.textContent = messageText;
    setTimeout(() => { msgContainer.classList.add("hidden"); msgContainer.textContent = ""; }, 4000);
  }

  function setLoading(isLoading) {
    if (isLoading) {
      document.querySelector("#submit-payment").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit-payment").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }


  // ==========================================
  // LÓGICA CHATBOT 36912AI (RAG N8N PREPARADO)
  // ==========================================
  const chatInput = document.getElementById("chat-input-field");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatContainer = document.getElementById("chat-messages-container");

  // Al clickar en "New Chat" limpiamos la pantalla
  window.clearChat = function() {
    if(chatContainer) {
      chatContainer.innerHTML = `
        <div class="chat-msg ai-msg">
          <div class="chat-avatar">AI</div>
          <div class="chat-bubble">We are time. Welcome to 36912ai. How can I assist you today?</div>
        </div>
      `;
    }
  };

  // Ajuste altura textarea dinámico
  if(chatInput) {
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      if(this.value.trim() === '') this.style.height = 'auto';
    });

    // Enviar con Enter (sin shift)
    chatInput.addEventListener('keydown', function(e) {
      if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if(chatSendBtn) {
    chatSendBtn.addEventListener('click', handleSendMessage);
  }

  async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // 1. Mostrar mensaje del usuario
    appendMessage('user', message);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // 2. Mostrar indicador de "Escribiendo..."
    const loadingId = appendMessage('ai', '...');

    // 3. Enviar al Backend RAG (n8n)
    const reply = await fetchN8nResponse(message);

    // 4. Reemplazar indicador con respuesta real
    const loadingNode = document.getElementById(loadingId);
    if(loadingNode) {
      loadingNode.innerText = reply;
    }
  }

  function appendMessage(role, text) {
    const uniqueId = 'msg-' + Date.now();
    const isAi = role === 'ai';
    
    const msgHTML = `
      <div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
        <div class="chat-avatar">${isAi ? 'AI' : 'U'}</div>
        <div class="chat-bubble" id="${uniqueId}">${text}</div>
      </div>
    `;
    
    chatContainer.insertAdjacentHTML('beforeend', msgHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return uniqueId;
  }

  // --- CONEXIÓN BACKEND n8n ---
  async function fetchN8nResponse(userMessage) {
    // 🔥 AQUÍ PEGARÁS LA URL DE TU WEBHOOK DE n8n
    const N8N_WEBHOOK_URL = 'https://tu-dominio-n8n.com/webhook/tu-endpoint'; 

    try {
      /* === DESCOMENTAR ESTO CUANDO TENGAS EL N8N LISTO ===
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      return data.reply || data.output || "Error: Formato de respuesta no reconocido.";
      */

      // === SIMULACIÓN FRONTEND TEMPORAL ===
      return new Promise(resolve => {
        setTimeout(() => {
          resolve("This is a simulated response. To connect the real AI, add your n8n webhook URL in router.js.");
        }, 1500);
      });

    } catch (error) {
      console.error("AI Fetch Error:", error);
      return "Temporal connection severed. Please try again later.";
    }
  }

});
