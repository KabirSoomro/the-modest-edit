/**
 * THE MODEST EDIT - Global UI Engine & Interactions
 * Assignment: University E-Commerce Project (2026)
 * Student: Kabir
 * 
 * Handles sticky navbar behavior, mobile navigation drawer,
 * toast notification engine, scroll animations (IntersectionObserver),
 * active link styling, and newsletter interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initActiveNavLink();
  initScrollAnimations();
  initNewsletter();
  initFooterYear();
  ensureToastContainer();
});

/**
 * Sticky Navbar styling on scroll
 */
function initNavbar() {
  const navbar = document.querySelector('.site-header');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
}

/**
 * Mobile Navigation Drawer toggle & backdrop handling
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.mobile-close-btn');

  if (!toggleBtn || !mobileDrawer) return;

  function openMenu() {
    mobileDrawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileDrawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileDrawer.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Close when clicking any nav link inside mobile drawer
  const drawerLinks = mobileDrawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/**
 * Highlights the active link based on current page URL
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize href (remove query params or relative paths)
    const linkPath = href.split('?')[0].split('/').pop();

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Subtle Scroll Animations via IntersectionObserver
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const revealElement = (el) => {
    el.classList.add('is-revealed');
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.02,
      rootMargin: '120px 0px 120px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(revealElement);
  }

  // Guaranteed fallback: Reveal all elements after a short delay so screenshots & static readers never miss content
  setTimeout(() => {
    elements.forEach(revealElement);
  }, 400);
}

/**
 * Ensures global toast container exists in DOM
 */
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Global Toast Notification Generator
 * @param {string} message Text or HTML to display
 * @param {string} type 'success' | 'info' | 'warning' | 'error'
 * @param {number} duration Milliseconds to display
 */
function showToast(message, type = 'success', duration = 3500) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  // Icon based on type
  let icon = '✓';
  if (type === 'info') icon = 'ℹ';
  if (type === 'warning') icon = '⚠';
  if (type === 'error') icon = '✕';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-content">${message}</div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 280);
  };

  closeBtn.addEventListener('click', dismiss);

  container.appendChild(toast);

  // Auto dismiss
  setTimeout(dismiss, duration);
}

/**
 * Newsletter Form Subscription Handler
 */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;

      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'warning');
        emailInput.focus();
        return;
      }

      // Success
      showToast('Shukriya! You are subscribed for VIP drops & styling notes.', 'success');
      form.reset();
    });
  });
}

/**
 * Sets current year in footer copyright notice
 */
function initFooterYear() {
  const yearEls = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearEls.forEach(el => {
    el.textContent = currentYear || '2026';
  });
}
