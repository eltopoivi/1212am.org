document.addEventListener("DOMContentLoaded", () => {

  window.openProduct = function(title, price, emoji) {
    document.getElementById("product-page-title").innerText = title;
    document.getElementById("product-page-price").innerText = `$${price} USD`;
    document.getElementById("product-page-emoji").innerText = emoji;
    window.navigate('product');
  };

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

  window.openCartDrawer = function() { drawerOverlay.classList.add('open'); drawer.classList.add('open'); }
  window.closeCartDrawer = function() { drawerOverlay.classList.remove('open'); drawer.classList.remove('open'); }
  
  if(openCartBtn) openCartBtn.addEventListener('click', window.openCartDrawer);
  if(closeCartBtn) closeCartBtn.addEventListener('click', window.closeCartDrawer);
  if(drawerOverlay) drawerOverlay.addEventListener('click', window.closeCartDrawer);

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
    if(cart.length === 0 && window.location.pathname === "/checkout") window.navigate("store");
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
      window.renderCart(); window.openCartDrawer(); 
    });
  }

  if(drawerCheckoutBtn) {
    drawerCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return alert("Your cart is empty!");
      window.closeCartDrawer(); window.navigate('checkout');
    });
  }

  window.renderCart();

  let stripe; let elements;
  window.initializeStripeCheckout = async function() {
    if (cart.length === 0 || !window.Stripe) return;
    stripe = Stripe("pk_test_51OSyRzJBofJrA2IJwoX5nP2M0EEr503OnYe644dU61WPlomTvWVcTnODZ7ASU436LWO8i3TsmZK8hnNzvxwQTsQ800mkXMQUFL");

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const appearance = { theme: 'night', variables: { fontFamily: '"Exo 2", sans-serif', colorText: '#ffffff', colorBackground: '#161616', colorDanger: '#ff0000', colorPrimary: '#FFD600', borderColor: '#1e1e1e', borderRadius: '4px' } };
      elements = stripe.elements({ appearance, clientSecret: data.clientSecret });
      const paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");
    } catch (error) {
      console.error("Stripe Error:", error);
    }
  }

  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.querySelector("#submit-payment").disabled = true;
      const { error } = await stripe.confirmPayment({
        elements, confirmParams: { return_url: window.location.origin + "/success", receipt_email: document.getElementById("checkout-email").value, }, redirect: 'if_required' 
      });
      if (error) { alert(error.message); document.querySelector("#submit-payment").disabled = false; } 
      else { cart = []; window.renderCart(); window.navigate("success"); document.querySelector("#submit-payment").disabled = false; }
    });
  }
});
