/**
 * THE MODEST EDIT - Shop Catalog Filter, Search & Sort Logic
 * Assignment: University E-Commerce Project (2026)
 * Student: Kabir
 * 
 * Implements real-time multi-facet filtering (categories, price range slider,
 * live search keywords), sorting (price, name, popularity), URL query sync,
 * responsive filter drawer toggle, and product grid rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  initShopPage();
});

function initShopPage() {
  const gridContainer = document.getElementById('productsGrid');
  if (!gridContainer) return; // Not on shop.html

  // Form controls
  const searchInput = document.getElementById('searchInput');
  const priceSlider = document.getElementById('priceSlider');
  const priceDisplay = document.getElementById('priceDisplay');
  const sortSelect = document.getElementById('sortSelect');
  const categoryCheckboxes = document.querySelectorAll('input[name="categoryFilter"]');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  
  // Mobile filter drawer controls
  const filterToggleBtn = document.getElementById('mobileFilterToggle');
  const filterSidebar = document.querySelector('.shop-sidebar');
  const filterCloseBtn = document.getElementById('closeFilterSidebar');

  // Dynamically update category count labels in sidebar from catalog
  categoryCheckboxes.forEach(cb => {
    const catVal = cb.value.toLowerCase();
    const count = products.filter(p => p.category.toLowerCase() === catVal).length;
    const labelSpan = cb.nextElementSibling;
    if (labelSpan) {
      labelSpan.textContent = `${cb.value} (${count})`;
    }
  });

  // Handle URL Query Params (e.g. ?category=Skincare or ?search=serum)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialSearch = urlParams.get('search');

  if (initialCategory) {
    categoryCheckboxes.forEach(cb => {
      if (cb.value.toLowerCase() === initialCategory.toLowerCase()) {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    });
  }

  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  // Update price display on slider change
  if (priceSlider && priceDisplay) {
    priceDisplay.textContent = formatPKR(parseInt(priceSlider.value, 10));
    priceSlider.addEventListener('input', () => {
      priceDisplay.textContent = formatPKR(parseInt(priceSlider.value, 10));
      applyFilters();
    });
  }

  // Event Listeners for Filters
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => applyFilters(), 250));
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => applyFilters());
  }
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => applyFilters());
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 8000;
        priceDisplay.textContent = formatPKR(8000);
      }
      categoryCheckboxes.forEach(cb => (cb.checked = true));
      if (sortSelect) sortSelect.value = 'default';
      applyFilters();
    });
  }

  // Mobile Filter Drawer Toggle
  if (filterToggleBtn && filterSidebar) {
    filterToggleBtn.addEventListener('click', () => {
      filterSidebar.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (filterCloseBtn && filterSidebar) {
    filterCloseBtn.addEventListener('click', () => {
      filterSidebar.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  /**
   * Applies all active filters, sorts results, and re-renders grid
   */
  function applyFilters() {
    let filtered = [...products];

    // 1. Search Query Filter
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter (Multiple checkboxes)
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value.toLowerCase());

    if (selectedCategories.length > 0 && selectedCategories.length < categoryCheckboxes.length) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category.toLowerCase()));
    } else if (selectedCategories.length === 0) {
      filtered = []; // If no categories selected, show 0 results
    }

    // 3. Price Filter (Maximum price slider)
    const maxPrice = priceSlider ? parseInt(priceSlider.value, 10) : 8000;
    filtered = filtered.filter(p => p.price <= maxPrice);

    // 4. Sorting
    const sortVal = sortSelect ? sortSelect.value : 'default';
    switch (sortVal) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'bestseller':
        filtered.sort((a, b) => {
          if (a.badge === 'Bestseller' && b.badge !== 'Bestseller') return -1;
          if (b.badge === 'Bestseller' && a.badge !== 'Bestseller') return 1;
          return b.rating - a.rating;
        });
        break;
      default:
        // Default: original catalog order
        break;
    }

    // Render results
    renderProductCards(filtered, gridContainer);

    // Update results count
    if (resultsCount) {
      resultsCount.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${products.length}</strong> products`;
    }

    // Empty state visibility
    if (emptyState) {
      if (filtered.length === 0) {
        emptyState.classList.remove('d-none');
        gridContainer.classList.add('d-none');
      } else {
        emptyState.classList.add('d-none');
        gridContainer.classList.remove('d-none');
      }
    }
  }

  // Initial Run
  applyFilters();
}

/**
 * Generates and injects HTML cards into target container
 * @param {Array} items List of product objects
 * @param {HTMLElement} container Destination element
 */
function renderProductCards(items, container) {
  if (!container) return;

  container.innerHTML = items.map(product => {
    const discount = product.oldPrice 
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
      : 0;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-media">
          ${getBadgeHTML(product.badge)}
          ${discount > 0 ? `<span class="discount-badge">Save ${discount}%</span>` : ''}
          
          <button 
            type="button" 
            class="btn-card-quickview" 
            onclick="openQuickViewModal(event, ${product.id})"
            aria-label="Quick view for ${product.name}"
            title="Quick Preview"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span class="quickview-label">Quick View</span>
          </button>

          <a href="product.html?id=${product.id}" class="product-image-link" aria-label="View details for ${product.name}">
            <img 
              src="${product.image}" 
              alt="${product.name} — ${product.category} Online Pakistan" 
              loading="lazy"
              class="product-thumb"
              onerror="handleImageError(this, ${product.id})"
            />
          </a>
          
          <div class="product-actions-bar">
            <button 
              type="button" 
              class="btn-quick-add" 
              onclick="handleQuickAddToCart(event, ${product.id})"
              aria-label="Add ${product.name} to cart"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>
          <div class="product-rating">
            ${renderStars(product.rating)}
          </div>
          <div class="product-pricing">
            <span class="price-current">${formatPKR(product.price)}</span>
            ${product.oldPrice ? `<span class="price-old">${formatPKR(product.oldPrice)}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Opens an interactive Quick View Modal right on the page
 */
function openQuickViewModal(event, productId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const product = getProductById(productId);
  if (!product) return;

  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'quickview-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  let chosenSize = product.sizes && product.sizes.length ? product.sizes[0] : 'Standard';
  let chosenQty = 1;

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  modal.innerHTML = `
    <div class="quickview-modal-window">
      <button type="button" class="quickview-close-btn" onclick="closeQuickViewModal()" aria-label="Close modal">&times;</button>
      
      <div class="quickview-grid">
        <div class="quickview-media">
          ${getBadgeHTML(product.badge)}
          ${discount > 0 ? `<span class="discount-badge">Save ${discount}%</span>` : ''}
          <img 
            src="${product.image}" 
            alt="${product.name} — Buy ${product.category} Online Pakistan" 
            class="quickview-img"
            onerror="handleImageError(this, ${product.id})"
          />
        </div>

        <div class="quickview-info">
          <span class="product-category">${product.category}</span>
          <h2 class="quickview-title">${product.name}</h2>
          
          <div class="product-rating" style="margin-bottom: 0.85rem;">
            ${renderStars(product.rating)}
            <span class="rating-number" style="margin-left: 0.5rem;">(${product.reviewsCount} reviews)</span>
          </div>

          <div class="product-pricing" style="margin-bottom: 1.25rem;">
            <span class="price-hero-current" style="font-size: 1.7rem;">${formatPKR(product.price)}</span>
            ${product.oldPrice ? `<span class="price-hero-old">${formatPKR(product.oldPrice)}</span>` : ''}
          </div>

          <p class="quickview-desc">${product.description}</p>
          <p class="quickview-details">${product.details}</p>

          <div class="quickview-option-group">
            <span class="option-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Option / Size:</span>
            <div class="size-options-wrapper" id="qvSizeList">
              ${(product.sizes || ['Standard']).map((s, idx) => `
                <button 
                  type="button" 
                  class="size-pill-btn ${idx === 0 ? 'active' : ''}" 
                  onclick="selectQuickViewSize(this, '${s}')"
                >
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="quickview-actions">
            <div class="quantity-controller" style="height: 46px;">
              <button type="button" class="qty-btn" onclick="adjustQuickViewQty(-1, ${product.stock})">&minus;</button>
              <input type="number" id="qvQtyInput" value="1" readonly style="width: 40px; text-align: center; font-weight: 600; border: none;">
              <button type="button" class="qty-btn" onclick="adjustQuickViewQty(1, ${product.stock})">&#43;</button>
            </div>

            <button 
              type="button" 
              class="btn btn-primary" 
              id="qvAddBtn"
              style="flex: 1; height: 46px;"
              onclick="executeQuickViewAdd(${product.id})"
            >
              Add to Cart
            </button>
          </div>

          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
            <a href="product.html?id=${product.id}" style="color: var(--primary); font-weight: 600; text-decoration: underline;">
              View Full Product Page &rarr;
            </a>
            <span style="color: var(--secondary-dark); font-weight: 500;">✓ In Stock &bull; Cash on Delivery</span>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Backdrop click to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeQuickViewModal();
    }
  };
}

/**
 * Handles size change in Quick View
 */
function selectQuickViewSize(btn, size) {
  const container = document.getElementById('qvSizeList');
  if (container) {
    container.querySelectorAll('.size-pill-btn').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
  btn.setAttribute('data-selected-size', size);
}

/**
 * Adjusts quantity in Quick View
 */
function adjustQuickViewQty(delta, maxStock) {
  const input = document.getElementById('qvQtyInput');
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, Math.min(maxStock || 99, val + delta));
  input.value = val;
}

/**
 * Executes Add to Cart from Quick View Modal
 */
function executeQuickViewAdd(productId) {
  const input = document.getElementById('qvQtyInput');
  const qty = input ? (parseInt(input.value, 10) || 1) : 1;
  
  const activeSizeBtn = document.querySelector('#qvSizeList .size-pill-btn.active');
  const size = activeSizeBtn ? activeSizeBtn.textContent.trim() : 'Standard';

  addToCart(productId, qty, size);

  const btn = document.getElementById('qvAddBtn');
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Added to Bag!';
    btn.style.backgroundColor = 'var(--secondary-dark)';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      closeQuickViewModal();
    }, 900);
  }
}

/**
 * Closes Quick View Modal
 */
function closeQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickViewModal();
  }
});

/**
 * Handles quick add-to-cart clicks directly from product cards
 */
function handleQuickAddToCart(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  
  const product = getProductById(productId);
  if (!product) return;

  const defaultSize = (product.sizes && product.sizes.length) ? product.sizes[0] : 'Standard';
  addToCart(productId, 1, defaultSize);

  // Button micro-interaction feedback
  const btn = event.currentTarget;
  const originalHtml = btn.innerHTML;
  btn.classList.add('btn-added');
  btn.innerHTML = `<span>✓ Added!</span>`;
  setTimeout(() => {
    btn.classList.remove('btn-added');
    btn.innerHTML = originalHtml;
  }, 1200);
}

/**
 * Utility debounce function
 */
function debounce(func, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
