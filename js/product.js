/**
 * THE MODEST EDIT - Product Detail Page Engine
 * Assignment: University E-Commerce Project (2026)
 * Student: Kabir
 * 
 * Reads ?id= from URL parameters, validates existence, renders dynamic
 * product gallery, specifications, size selectors, quantity counters,
 * transparent "Product Worth" economics, and related product recommendations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
});

function initProductDetailPage() {
  const detailContainer = document.getElementById('productDetailWrapper');
  if (!detailContainer) return; // Not on product.html

  // 1. Parse URL Parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);

  if (!productId || isNaN(productId)) {
    // Redirect if no valid ID provided
    window.location.href = 'shop.html';
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    // If ID doesn't match any catalog item, redirect to shop
    window.location.href = 'shop.html';
    return;
  }

  // Update page title, meta description & breadcrumbs for SEO
  document.title = `Buy ${product.name} Online Pakistan (Rs. ${product.price.toLocaleString('en-PK')}) — The Modest Edit`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Buy authentic ${product.name} online in Pakistan at Rs. ${product.price.toLocaleString('en-PK')}. ${product.description} Cash on Delivery available across Pakistan.`);
  }
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');
  const breadcrumbProduct = document.getElementById('breadcrumbProduct');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = product.category;
    breadcrumbCategory.href = `shop.html?category=${encodeURIComponent(product.category)}`;
  }
  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = product.name;
  }

  // State variables for user selection
  let selectedSize = product.sizes && product.sizes.length ? product.sizes[0] : 'Standard';
  let selectedQty = 1;

  // Calculate discount percentage
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  // Calculate value savings compared to boutique rate
  const boutiqueEstimate = Math.round(product.price * 1.45);
  const savingsPct = Math.round(((boutiqueEstimate - product.price) / boutiqueEstimate) * 100);

  // 2. Render Product Detail Layout
  detailContainer.innerHTML = `
    <div class="product-detail-grid">
      <!-- Media Gallery Left Column -->
      <div class="product-gallery">
        <div class="main-image-container">
          ${getBadgeHTML(product.badge)}
          ${discount > 0 ? `<span class="discount-badge">Save ${discount}%</span>` : ''}
          <img 
            id="mainProductImage"
            src="${product.image}" 
            alt="${product.name} — ${product.category} Online Pakistan" 
            class="main-product-img"
            onerror="handleImageError(this, ${product.id})"
          />
        </div>
        <div class="gallery-guarantee-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Authentic Pakistani craftsmanship & skin-safe laboratory standards.</span>
        </div>
      </div>

      <!-- Information Right Column -->
      <div class="product-info-panel">
        <div class="product-header-meta">
          <span class="product-category-tag">${product.category}</span>
          <div class="product-stock-tag ${product.stock <= 10 ? 'stock-low' : 'stock-available'}">
            ${product.stock <= 10 ? `Hurry! Only ${product.stock} left in stock` : `In Stock &bull; Ready for dispatch`}
          </div>
        </div>

        <h1 class="product-title-large">${product.name}</h1>

        <div class="product-rating-row">
          ${renderStars(product.rating)}
          <span class="reviews-count-badge">${product.reviewsCount} verified reviews</span>
        </div>

        <div class="product-pricing-hero">
          <span class="price-hero-current">${formatPKR(product.price)}</span>
          ${product.oldPrice ? `<span class="price-hero-old">${formatPKR(product.oldPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="price-savings-pill">Save ${formatPKR(product.oldPrice - product.price)}</span>` : ''}
        </div>

        <p class="product-lead-description">${product.description}</p>
        <p class="product-extra-details">${product.details}</p>

        <!-- Size / Option Selector -->
        <div class="product-option-group">
          <label class="option-label">
            <span>Select Option / Size:</span>
            <strong id="selectedSizeLabel">${selectedSize}</strong>
          </label>
          <div class="size-options-wrapper" id="sizeOptionsList">
            ${(product.sizes || ['Standard']).map((size, idx) => `
              <button 
                type="button" 
                class="size-pill-btn ${idx === 0 ? 'active' : ''}" 
                data-size="${size}"
                aria-pressed="${idx === 0 ? 'true' : 'false'}"
              >
                ${size}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Quantity Selector & Actions -->
        <div class="purchase-action-group">
          <div class="quantity-controller">
            <button type="button" class="qty-btn" id="qtyMinus" aria-label="Decrease quantity">&minus;</button>
            <input 
              type="number" 
              id="productQtyInput" 
              value="1" 
              min="1" 
              max="${product.stock}" 
              readonly 
              aria-label="Product quantity"
            />
            <button type="button" class="qty-btn" id="qtyPlus" aria-label="Increase quantity">&#43;</button>
          </div>

          <button type="button" class="btn btn-primary btn-add-main" id="btnAddToCart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Add to Cart</span>
          </button>

          <button type="button" class="btn btn-gold btn-buy-now" id="btnBuyNow">
            <span>Buy Now (Express COD)</span>
          </button>
        </div>

        <!-- Trust Badges -->
        <div class="product-trust-badges">
          <div class="trust-badge-item">
            <div class="trust-badge-icon">🚚</div>
            <div class="trust-badge-text">
              <strong>Free Nationwide Delivery</strong>
              <span>On all orders over Rs. 3,000</span>
            </div>
          </div>
          <div class="trust-badge-item">
            <div class="trust-badge-icon">💵</div>
            <div class="trust-badge-text">
              <strong>Cash on Delivery</strong>
              <span>Pay upon parcel arrival at your doorstep</span>
            </div>
          </div>
          <div class="trust-badge-item">
            <div class="trust-badge-icon">🔄</div>
            <div class="trust-badge-text">
              <strong>7-Day Easy Returns</strong>
              <span>Hassle-free size & quality exchange</span>
            </div>
          </div>
          <div class="trust-badge-item">
            <div class="trust-badge-icon">💬</div>
            <div class="trust-badge-text">
              <strong>WhatsApp Fit Advice</strong>
              <span>Direct guidance for styling & drape</span>
            </div>
          </div>
        </div>

        <!-- Product Worth / Value Transparency Box -->
        <div class="product-worth-card">
          <div class="worth-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <h4>Transparent Pricing & Product Worth</h4>
          </div>
          <p class="worth-formula">
            <strong>Estimated Cost Price:</strong> ${formatPKR(product.costPrice)} &rarr; 
            <strong>Our Selling Price:</strong> ${formatPKR(product.price)} &rarr; 
            <strong>Typical Boutique Rate:</strong> ${formatPKR(boutiqueEstimate)}
          </p>
          <p class="worth-explanation">
            <strong>Value for you:</strong> You receive runway-grade fabric and certified active ingredients at <strong>~${savingsPct}% below traditional boutique rates</strong>. By partnering directly with Faisalabad master weavers and ethical lab formulators, we eliminate retail middlemen markups.
          </p>
        </div>
      </div>
    </div>
  `;

  // 3. Attach Interactive Event Listeners

  // Size Selection
  const sizeBtns = detailContainer.querySelectorAll('.size-pill-btn');
  const sizeLabel = detailContainer.getElementById ? detailContainer.getElementById('selectedSizeLabel') : document.getElementById('selectedSizeLabel');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      selectedSize = btn.getAttribute('data-size');
      if (sizeLabel) sizeLabel.textContent = selectedSize;
    });
  });

  // Quantity Counter
  const qtyInput = document.getElementById('productQtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value, 10) || 1;
      if (currentVal > 1) {
        currentVal--;
        qtyInput.value = currentVal;
        selectedQty = currentVal;
      }
    });

    qtyPlus.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value, 10) || 1;
      if (currentVal < product.stock) {
        currentVal++;
        qtyInput.value = currentVal;
        selectedQty = currentVal;
      } else {
        showToast(`Maximum available stock is ${product.stock} units.`, 'info');
      }
    });
  }

  // Add to Cart Button
  const btnAddToCart = document.getElementById('btnAddToCart');
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      addToCart(product.id, selectedQty, selectedSize);
    });
  }

  // Buy Now Button (Adds to cart & directs straight to checkout)
  const btnBuyNow = document.getElementById('btnBuyNow');
  if (btnBuyNow) {
    btnBuyNow.addEventListener('click', () => {
      addToCart(product.id, selectedQty, selectedSize);
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 350);
    });
  }

  // 4. Render Related Products (3 items from same category, or fallback bestsellers)
  renderRelatedProducts(product);
}

/**
 * Renders 3 related products from the same category
 */
function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('relatedProductsGrid');
  if (!container) return;

  let related = products.filter(p => p.id !== currentProduct.id && p.category === currentProduct.category);
  
  // If fewer than 3 in the same category, backfill with top-rated items
  if (related.length < 3) {
    const additional = products.filter(p => p.id !== currentProduct.id && !related.includes(p));
    related = [...related, ...additional];
  }

  const itemsToShow = related.slice(0, 3);
  renderProductCards(itemsToShow, container);
}
