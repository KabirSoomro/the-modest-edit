/**
 * THE MODEST EDIT - Cart Management & LocalStorage Engine
 * Assignment: University E-Commerce Project (2026)
 * Student: Kabir
 * 
 * Provides cart CRUD operations, dynamic subtotal & shipping calculation,
 * free delivery progress thresholds, and auto-syncing navbar badges.
 */

const CART_STORAGE_KEY = 'tme_shopping_cart';
const FREE_SHIPPING_THRESHOLD = 3000;
const STANDARD_SHIPPING_FEE = 200;

/**
 * Retrieves the current cart array from localStorage
 * @returns {Array} Array of cart items
 */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
    return [];
  }
}

/**
 * Saves the cart array to localStorage, syncs badges, and dispatches event
 * @param {Array} cart 
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateNavCartBadge();
    // Dispatch custom event for reactive UI updates across components
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
}

/**
 * Adds an item to the cart or increments its quantity
 * @param {number|string} productId 
 * @param {number} qty 
 * @param {string} size 
 * @returns {boolean} Success status
 */
function addToCart(productId, qty = 1, size = null) {
  const product = getProductById(productId);
  if (!product) {
    console.error(`Product ID ${productId} not found.`);
    return false;
  }

  // Determine size default
  const chosenSize = size || (product.sizes && product.sizes.length ? product.sizes[0] : 'Standard');
  const addQty = Math.max(1, parseInt(qty, 10) || 1);

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id && item.size === chosenSize);

  if (existingIndex > -1) {
    const currentQty = cart[existingIndex].quantity;
    const newQty = Math.min(product.stock, currentQty + addQty);
    cart[existingIndex].quantity = newQty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      size: chosenSize,
      quantity: Math.min(product.stock, addQty),
      maxStock: product.stock
    });
  }

  saveCart(cart);

  // Trigger toast notification if showToast is available
  if (typeof showToast === 'function') {
    showToast(`✓ Added to cart: ${product.name} (${chosenSize})`, 'success');
  }

  return true;
}

/**
 * Updates the quantity of a specific item in the cart
 * @param {number|string} productId 
 * @param {string} size 
 * @param {number} newQty 
 */
function updateQty(productId, size, newQty) {
  const pId = parseInt(productId, 10);
  let cart = getCart();
  const index = cart.findIndex(item => item.id === pId && item.size === size);

  if (index > -1) {
    const product = getProductById(pId);
    const maxStock = product ? product.stock : 99;
    const sanitizedQty = parseInt(newQty, 10);

    if (sanitizedQty <= 0) {
      removeFromCart(pId, size);
      return;
    } else {
      cart[index].quantity = Math.min(maxStock, sanitizedQty);
      saveCart(cart);
    }
  }
}

/**
 * Removes an item from the cart
 * @param {number|string} productId 
 * @param {string} size 
 */
function removeFromCart(productId, size) {
  const pId = parseInt(productId, 10);
  let cart = getCart();
  const targetItem = cart.find(item => item.id === pId && (!size || item.size === size));
  
  cart = cart.filter(item => !(item.id === pId && (!size || item.size === size)));
  saveCart(cart);

  if (typeof showToast === 'function' && targetItem) {
    showToast(`Removed "${targetItem.name}" from cart`, 'info');
  }
}

/**
 * Calculates cart subtotal
 * @returns {number}
 */
function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculates shipping fee (Rs. 200 or 0 if subtotal >= Rs. 3,000)
 * @returns {number}
 */
function getShippingFee() {
  const subtotal = getCartSubtotal();
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

/**
 * Calculates final total
 * @returns {number}
 */
function getCartTotal() {
  return getCartSubtotal() + getShippingFee();
}

/**
 * Returns total count of all units in cart
 * @returns {number}
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Empties cart
 */
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateNavCartBadge();
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
}

/**
 * Updates all navbar cart badge counters across the DOM
 */
function updateNavCartBadge() {
  const count = getCartItemCount();
  const badges = document.querySelectorAll('.cart-badge, [data-cart-count]');
  
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('badge-hidden');
      badge.classList.add('badge-pop');
      setTimeout(() => badge.classList.remove('badge-pop'), 300);
    } else {
      badge.textContent = '0';
    }
  });
}

// Auto-initialize badge on DOM ready and listen for cart changes
document.addEventListener('DOMContentLoaded', () => {
  updateNavCartBadge();
  if (document.getElementById('cartPageWrapper')) {
    renderCartPage();
  }
});

// Re-render cart page if open when cart updates
window.addEventListener('cartUpdated', () => {
  if (document.getElementById('cartPageWrapper')) {
    renderCartPage();
  }
});

/**
 * Renders the full Shopping Cart Page (cart.html)
 */
function renderCartPage() {
  const wrapper = document.getElementById('cartPageWrapper');
  if (!wrapper) return;

  const cart = getCart();

  if (cart.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-cart-state reveal-on-scroll is-revealed">
        <div class="empty-cart-icon-circle">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h2 class="empty-cart-title">Your cart is empty — let's fix that.</h2>
        <p class="empty-cart-subtext">Discover our curated abayas, breathable everyday hijabs, and barrier-repair skincare formulated for Pakistani weather.</p>
        <a href="shop.html" class="btn btn-primary btn-empty-cart">Explore Our Collection</a>
      </div>
    `;
    return;
  }

  const subtotal = getCartSubtotal();
  const shipping = getShippingFee();
  const total = subtotal + shipping;

  // Free shipping threshold calculations
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  wrapper.innerHTML = `
    <div class="cart-layout-grid">
      <!-- Left Column: Items List -->
      <div class="cart-items-section">
        <!-- Free Shipping Meter -->
        <div class="free-shipping-meter-card">
          <div class="meter-text-row">
            ${subtotal >= FREE_SHIPPING_THRESHOLD 
              ? `<span class="meter-congrats">🎉 <strong>Mubarak!</strong> You've unlocked <strong>FREE Nationwide Delivery</strong>!</span>` 
              : `<span>Add <strong>${formatPKR(remainingForFreeShipping)}</strong> more to unlock <strong>FREE Delivery</strong> across Pakistan!</span>`}
            <span class="meter-pct">${progressPercent}%</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Cart Table Header -->
        <div class="cart-table-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Total</span>
          <span></span>
        </div>

        <!-- Items Rows -->
        <div class="cart-items-list" id="cartItemsList">
          ${cart.map(item => {
            const lineTotal = item.price * item.quantity;
            return `
              <div class="cart-item-row" data-id="${item.id}" data-size="${item.size}">
                <div class="cart-item-product">
                  <a href="product.html?id=${item.id}" class="cart-item-thumb-link">
                    <img 
                      src="${item.image}" 
                      alt="${item.name}" 
                      class="cart-item-thumb"
                      onerror="handleImageError(this, ${item.id})"
                    />
                  </a>
                  <div class="cart-item-meta">
                    <span class="cart-item-category">${item.category}</span>
                    <h3 class="cart-item-name">
                      <a href="product.html?id=${item.id}">${item.name}</a>
                    </h3>
                    <div class="cart-item-size-tag">Size: <strong>${item.size}</strong></div>
                  </div>
                </div>

                <div class="cart-item-price">
                  <span class="mobile-label">Price: </span>${formatPKR(item.price)}
                </div>

                <div class="cart-item-qty">
                  <div class="cart-qty-control">
                    <button 
                      type="button" 
                      class="cart-qty-btn btn-minus" 
                      onclick="updateQty(${item.id}, '${item.size}', ${item.quantity - 1})"
                      aria-label="Decrease quantity"
                    >&minus;</button>
                    <span class="cart-qty-val">${item.quantity}</span>
                    <button 
                      type="button" 
                      class="cart-qty-btn btn-plus" 
                      onclick="updateQty(${item.id}, '${item.size}', ${item.quantity + 1})"
                      aria-label="Increase quantity"
                    >&#43;</button>
                  </div>
                </div>

                <div class="cart-item-subtotal">
                  <span class="mobile-label">Subtotal: </span>
                  <strong>${formatPKR(lineTotal)}</strong>
                </div>

                <div class="cart-item-remove">
                  <button 
                    type="button" 
                    class="btn-remove-item" 
                    onclick="removeFromCart(${item.id}, '${item.size}')"
                    aria-label="Remove ${item.name} from cart"
                    title="Remove item"
                  >&times;</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="cart-actions-bar">
          <a href="shop.html" class="btn btn-outline btn-continue-shopping">
            &larr; Continue Shopping
          </a>
          <button type="button" class="btn btn-text-danger" onclick="if(confirm('Are you sure you want to clear your shopping cart?')) clearCart();">
            Clear Shopping Bag
          </button>
        </div>
      </div>

      <!-- Right Column: Order Summary Sidebar -->
      <aside class="cart-summary-sidebar">
        <div class="summary-card">
          <h2 class="summary-card-title">Order Summary</h2>

          <div class="summary-row">
            <span>Subtotal (${getCartItemCount()} items)</span>
            <span class="summary-val">${formatPKR(subtotal)}</span>
          </div>

          <div class="summary-row">
            <span>Standard Shipping</span>
            <span class="summary-val ${shipping === 0 ? 'text-success' : ''}">
              ${shipping === 0 ? 'FREE' : formatPKR(shipping)}
            </span>
          </div>

          <div class="summary-shipping-note">
            ${shipping === 0 
              ? '✨ Free express shipping unlocked!' 
              : 'Add items worth Rs. 3,000 for free delivery.'}
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row summary-row-total">
            <span>Total (PKR)</span>
            <span class="summary-total-val">${formatPKR(total)}</span>
          </div>

          <p class="summary-tax-note">Inclusive of all local Pakistani duties & packaging.</p>

          <a href="checkout.html" class="btn btn-primary btn-block btn-checkout-action">
            <span>Proceed to Checkout</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>

          <div class="summary-security-badges">
            <div class="security-badge-item">
              <span>💵</span> Cash on Delivery Available
            </div>
            <div class="security-badge-item">
              <span>🚚</span> Express Courier Dispatch (TCS / Trax)
            </div>
            <div class="security-badge-item">
              <span>🛡️</span> 100% Authentic Quality Guarantee
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;
}

