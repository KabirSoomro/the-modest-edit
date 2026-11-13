/**
 * THE MODEST EDIT - Checkout & Cash on Delivery Validation Engine
 * Assignment: University E-Commerce Project (2026)
 * Student: Kabir
 * 
 * Handles real-time form validation (Pakistani phone format 03XX-XXXXXXX),
 * renders active cart items in order summary, disables unavailable payment methods,
 * simulates loading states, generates order reference (#TME-XXXX), and triggers
 * the order confirmation modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutPage();
});

function initCheckoutPage() {
  const checkoutForm = document.getElementById('checkoutForm');
  const summaryItemsList = document.getElementById('checkoutItemsList');
  if (!checkoutForm || !summaryItemsList) return; // Not on checkout.html

  const cart = getCart();

  // If cart is empty, alert and redirect to shop
  if (cart.length === 0) {
    document.getElementById('checkoutContainer').innerHTML = `
      <div class="empty-cart-state reveal-on-scroll is-revealed">
        <div class="empty-cart-icon-circle">🛍️</div>
        <h2 class="empty-cart-title">Your shopping bag is empty</h2>
        <p class="empty-cart-subtext">You cannot proceed to checkout without adding at least one item to your cart.</p>
        <a href="shop.html" class="btn btn-primary">Return to Shop</a>
      </div>
    `;
    return;
  }

  // Render Order Summary Sidebar
  renderCheckoutSummary(cart);

  // Form Submission Handler
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateCheckoutForm()) {
      showToast('Please fix the errors in the form before placing your order.', 'warning');
      return;
    }

    // Form is valid! Begin simulated processing
    const submitBtn = document.getElementById('btnPlaceOrder');
    const originalText = submitBtn.innerHTML;

    // Show loading spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-spinner"></span>
      <span>Confirming with Hyderabad Hub...</span>
    `;

    // Extract form data for confirmation modal
    const orderData = {
      orderId: 'TME-' + Math.floor(1000 + Math.random() * 9000),
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('emailAddress').value.trim(),
      phone: document.getElementById('phoneNumber').value.trim(),
      address: document.getElementById('streetAddress').value.trim(),
      city: document.getElementById('citySelect').value,
      postalCode: document.getElementById('postalCode').value.trim() || 'N/A',
      notes: document.getElementById('orderNotes').value.trim() || 'None',
      subtotal: getCartSubtotal(),
      shipping: getShippingFee(),
      total: getCartTotal(),
      items: [...cart],
      date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    // 1.5s simulated network delay
    setTimeout(() => {
      // Clear Cart
      clearCart();

      // Show Full-Screen Success Modal
      showOrderSuccessModal(orderData);

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1500);
  });

  // Attach live input validation listeners
  attachLiveValidation();
}

/**
 * Renders list of cart items and pricing in the checkout sidebar
 */
function renderCheckoutSummary(cart) {
  const container = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutTotal');

  if (!container) return;

  container.innerHTML = cart.map(item => `
    <div class="checkout-item-row">
      <div class="checkout-item-thumb-wrapper">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="checkout-item-thumb"
          onerror="handleImageError(this, ${item.id})"
        />
        <span class="checkout-item-qty-badge">${item.quantity}</span>
      </div>
      <div class="checkout-item-info">
        <h4 class="checkout-item-title">${item.name}</h4>
        <span class="checkout-item-size">Size: ${item.size}</span>
      </div>
      <div class="checkout-item-price">
        ${formatPKR(item.price * item.quantity)}
      </div>
    </div>
  `).join('');

  const subtotal = getCartSubtotal();
  const shipping = getShippingFee();
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatPKR(subtotal);
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 ? 'FREE' : formatPKR(shipping);
    if (shipping === 0) shippingEl.classList.add('text-success');
  }
  if (totalEl) totalEl.textContent = formatPKR(total);
}

/**
 * Attaches blur and input events for interactive feedback
 */
function attachLiveValidation() {
  const fields = ['fullName', 'emailAddress', 'phoneNumber', 'streetAddress', 'citySelect'];
  fields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('input-error')) {
          validateField(input);
        }
      });
    }
  });
}

/**
 * Validates a single input field
 */
function validateField(input) {
  const fieldId = input.id;
  const value = input.value.trim();
  const errorEl = document.getElementById(`${fieldId}Error`);
  let isValid = true;
  let message = '';

  switch (fieldId) {
    case 'fullName':
      if (value.length < 3) {
        isValid = false;
        message = 'Please enter your full name (minimum 3 letters).';
      }
      break;

    case 'emailAddress':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address (e.g., name@domain.com).';
      }
      break;

    case 'phoneNumber':
      // Pakistani phone validation: 03XX-XXXXXXX or 03XXXXXXXXX or +923XXXXXXXXX
      const cleanPhone = value.replace(/[\s-]/g, '');
      const pkPhoneRegex = /^(03[0-9]{9}|\+923[0-9]{9})$/;
      if (!pkPhoneRegex.test(cleanPhone)) {
        isValid = false;
        message = 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567).';
      }
      break;

    case 'streetAddress':
      if (value.length < 6) {
        isValid = false;
        message = 'Please enter complete street address, house/apartment number.';
      }
      break;

    case 'citySelect':
      if (!value) {
        isValid = false;
        message = 'Please select your destination city in Pakistan.';
      }
      break;
  }

  if (!isValid) {
    input.classList.add('input-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('d-none');
    }
  } else {
    input.classList.remove('input-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('d-none');
    }
  }

  return isValid;
}

/**
 * Validates the entire checkout form before submission
 */
function validateCheckoutForm() {
  const fields = ['fullName', 'emailAddress', 'phoneNumber', 'streetAddress', 'citySelect'];
  let allValid = true;

  fields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      const valid = validateField(input);
      if (!valid) allValid = false;
    }
  });

  return allValid;
}

/**
 * Displays full-screen order success modal
 */
function showOrderSuccessModal(order) {
  const modal = document.getElementById('orderSuccessModal');
  if (!modal) return;

  const modalBody = document.getElementById('orderModalDetails');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="success-icon-badge">✓</div>
      <h2 class="modal-success-title">Shukriya, ${order.fullName}!</h2>
      <p class="modal-success-subtitle">Your order has been placed successfully via <strong>Cash on Delivery</strong>.</p>
      
      <div class="modal-order-meta-box">
        <div class="meta-row">
          <span>Order Reference:</span>
          <strong>#${order.orderId}</strong>
        </div>
        <div class="meta-row">
          <span>Date:</span>
          <span>${order.date}</span>
        </div>
        <div class="meta-row">
          <span>Payment Method:</span>
          <span class="badge-cod">Cash on Delivery (Pay at Doorstep)</span>
        </div>
        <div class="meta-row">
          <span>Total Amount to Pay:</span>
          <strong class="text-primary-gold">${formatPKR(order.total)}</strong>
        </div>
      </div>

      <div class="modal-dispatch-info">
        <h4>Shipping Details:</h4>
        <p><strong>Deliver to:</strong> ${order.address}, ${order.city} ${order.postalCode !== 'N/A' ? `(${order.postalCode})` : ''}</p>
        <p><strong>Contact Phone:</strong> ${order.phone} &bull; <strong>Email:</strong> ${order.email}</p>
        <div class="dispatch-timeline-alert">
          🚚 <strong>Estimated Delivery:</strong> 2–4 business days via TCS / Trax. You will receive an SMS tracking code once dispatched from our Hyderabad fulfillment hub.
        </div>
      </div>

      <div class="modal-items-preview">
        <h4>Items Ordered (${order.items.reduce((s, i) => s + i.quantity, 0)}):</h4>
        <ul>
          ${order.items.map(item => `
            <li>
              <span>${item.name} (${item.size}) &times; ${item.quantity}</span>
              <strong>${formatPKR(item.price * item.quantity)}</strong>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="modal-action-buttons">
        <a href="shop.html" class="btn btn-primary btn-block">Continue Shopping</a>
        <a href="index.html" class="btn btn-outline btn-block">Return to Home</a>
      </div>
    `;
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
