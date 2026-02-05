/**
 * Sweet Treets E-Commerce Website JavaScript
 * Vanilla JavaScript ES6+ for cart functionality and dynamic behavior
 */

// =============================================
// Product Data
// =============================================
const products = [
  // New Products
  {
    id: 1,
    name: "Japanese Matcha Kit",
    price: 85.00,
    category: "new",
    image: "https://images.unsplash.com/photo-1515814472071-4d632dbc5d4a?w=400&h=400&fit=crop",
    description: "Authentic Japanese matcha starter kit with ceremonial grade powder"
  },
  {
    id: 2,
    name: "Korean Bibimbap Instant",
    price: 12.00,
    category: "new",
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=400&fit=crop",
    description: "Premium instant bibimbap from Korea"
  },
  {
    id: 3,
    name: "Thai Mango Sticky Rice",
    price: 15.00,
    category: "new",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop",
    description: "Authentic Thai mango sticky rice kit"
  },
  {
    id: 4,
    name: "Vietnamese Egg Coffee",
    price: 18.00,
    category: "new",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop",
    description: "Traditional Vietnamese egg coffee mix"
  },
  
  // Fast Selling Products
  {
    id: 5,
    name: "Pocky Chocolate",
    price: 8.00,
    category: "fast",
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=400&fit=crop",
    description: "Classic Japanese chocolate biscuit sticks"
  },
  {
    id: 6,
    name: "Mochi Ice Cream Variety",
    price: 22.00,
    category: "fast",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    description: "Assorted Japanese mochi ice cream"
  },
  {
    id: 7,
    name: "KitKat Chocolates",
    price: 10.00,
    category: "fast",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
    description: "Premium Japanese KitKat assortment"
  },
  {
    id: 8,
    name: "Bubble Tea Kit",
    price: 35.00,
    category: "fast",
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=400&fit=crop",
    description: "DIY bubble tea kit with multiple flavors"
  },
  
  // Snacks Category
  {
    id: 9,
    name: "Seaweed Snacks",
    price: 6.00,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop",
    description: "Crispy Japanese seaweed snacks"
  },
  {
    id: 10,
    name: "Rice Crackers",
    price: 7.50,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1588449668365-515aa6041c5f?w=400&h=400&fit=crop",
    description: "Traditional Japanese rice crackers"
  },
  {
    id: 11,
    name: "Wasabi Peas",
    price: 5.00,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a45dd03?w=400&h=400&fit=crop",
    description: "Spicy wasabi coated peas"
  },
  {
    id: 12,
    name: "Shrimp Crackers",
    price: 8.00,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1621939514649-28b12e81658b?w=400&h=400&fit=crop",
    description: "Crispy Thai shrimp crackers"
  },
  
  // Drinks Category
  {
    id: 13,
    name: "Ramune Soda",
    price: 4.50,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",
    description: "Classic Japanese marble soda"
  },
  {
    id: 14,
    name: "Calpis Water",
    price: 5.00,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
    description: "Traditional Japanese probiotic drink"
  },
  {
    id: 15,
    name: "Yakult Probiotic",
    price: 3.00,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
    description: "Probiotic fermented milk drink"
  },
  {
    id: 16,
    name: "Kombucha Tea",
    price: 7.00,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",
    description: "Fermented probiotic tea"
  },
  
  // Groceries Category
  {
    id: 17,
    name: "Japanese Soy Sauce",
    price: 12.00,
    category: "groceries",
    image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop",
    description: "Premium Japanese soy sauce"
  },
  {
    id: 18,
    name: "Sushi Rice",
    price: 9.00,
    category: "groceries",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    description: "Short grain Japanese sushi rice"
  },
  {
    id: 19,
    name: "Curry Roux Box",
    price: 15.00,
    category: "groceries",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
    description: "Japanese curry roux mix"
  },
  {
    id: 20,
    name: "Miso Paste",
    price: 10.00,
    category: "groceries",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
    description: "Authentic Japanese miso paste"
  }
];

// =============================================
// Cart Management
// =============================================
class Cart {
  constructor() {
    this.items = this.loadFromStorage() || [];
    this.updateCartCount();
  }

  // Load cart from localStorage
  loadFromStorage() {
    try {
      const cartData = localStorage.getItem('sweettreets_cart');
      return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return null;
    }
  }

  // Save cart to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('sweettreets_cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Add item to cart
  addItem(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const existingItem = this.items.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveToStorage();
    this.updateCartCount();
    this.showNotification('Product added to cart!');
    return true;
  }

  // Remove item from cart
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateCartCount();
    
    // Trigger cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
    
    return true;
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveToStorage();
      this.updateCartCount();
      
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
      
      return true;
    }
    return false;
  }

  // Clear cart
  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.updateCartCount();
    
    // Trigger cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
  }

  // Get cart count
  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get cart total
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get cart items
  getItems() {
    return this.items;
  }

  // Update cart count in UI
  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    
    cartCountElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // Show notification
  showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--color-accent);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// =============================================
// Utility Functions
// =============================================

// Format price in GHS format
function formatPrice(price) {
  return `₵${price.toFixed(2)}`;
}

// Create product card HTML
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card fade-in';
  card.dataset.productId = product.id;
  card.dataset.category = product.category;
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">${formatPrice(product.price)}</p>
      <button class="btn btn-primary product-btn" onclick="cart.addItem(${product.id})">
        Add to Cart
      </button>
    </div>
  `;
  
  return card;
}

// Create cart item HTML
function createCartItem(item) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';
  cartItem.dataset.productId = item.id;
  
  cartItem.innerHTML = `
    <div class="cart-item-image">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <div class="cart-item-details">
      <h4 class="cart-item-name">${item.name}</h4>
      <p class="cart-item-price">${formatPrice(item.price)}</p>
    </div>
    <div class="cart-item-actions">
      <div class="quantity-control">
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
      <button class="remove-btn" onclick="cart.removeItem(${item.id}); renderCartItems();">Remove</button>
    </div>
  `;
  
  return cartItem;
}

// =============================================
// Cart Functions (Global)
// =============================================

// Global cart instance
const cart = new Cart();

// Update quantity function (global)
function updateQuantity(productId, change) {
  const item = cart.items.find(item => item.id === productId);
  if (item) {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      cart.updateQuantity(productId, newQuantity);
      renderCartItems();
    }
  }
}

// Render cart items (for cart page)
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartContainer = document.getElementById('empty-cart');
  const cartSummaryContainer = document.getElementById('cart-summary');
  
  if (!cartItemsContainer) return;
  
  const items = cart.getItems();
  
  if (items.length === 0) {
    if (emptyCartContainer) emptyCartContainer.classList.remove('hidden');
    if (cartSummaryContainer) cartSummaryContainer.classList.add('hidden');
    cartItemsContainer.innerHTML = '';
    return;
  }
  
  if (emptyCartContainer) emptyCartContainer.classList.add('hidden');
  if (cartSummaryContainer) cartSummaryContainer.classList.remove('hidden');
  
  cartItemsContainer.innerHTML = '';
  items.forEach(item => {
    cartItemsContainer.appendChild(createCartItem(item));
  });
  
  // Update summary
  updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(cart.getTotal());
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(cart.getTotal());
  }
}

// =============================================
// Product Rendering
// =============================================

// Render new products
function renderNewProducts() {
  const container = document.getElementById('new-products');
  if (!container) return;
  
  const newProducts = products.filter(p => p.category === 'new');
  container.innerHTML = '';
  newProducts.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// Render fast selling products
function renderFastSellingProducts() {
  const container = document.getElementById('fast-selling');
  if (!container) return;
  
  const fastProducts = products.filter(p => p.category === 'fast');
  container.innerHTML = '';
  fastProducts.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// Render shop products
function renderShopProducts() {
  const container = document.getElementById('shop-products');
  if (!container) return;
  
  container.innerHTML = '';
  products.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// =============================================
// Tab/Category Filtering
// =============================================

function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const categoryProducts = document.querySelectorAll('.category-products');
  
  if (tabButtons.length === 0) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      
      // Update active tab
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show/hide category products
      categoryProducts.forEach(section => {
        if (section.dataset.category === category) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    });
  });
}

// =============================================
// Mobile Navigation
// =============================================

function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!mobileMenuBtn || !navMenu) return;
  
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header-main') && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    }
  });
}

// =============================================
// Checkout Functions
// =============================================

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Validate form
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = 'var(--color-error)';
      } else {
        field.style.borderColor = 'var(--color-border)';
      }
    });
    
    if (!isValid) {
      cart.showNotification('Please fill in all required fields');
      return;
    }
    
    // Process order (UI only)
    const orderData = {
      items: cart.getItems(),
      total: cart.getTotal(),
      customer: {
        name: form.querySelector('#fullName')?.value || '',
        email: form.querySelector('#email')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        address: form.querySelector('#address')?.value || ''
      },
      date: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    // Clear cart and show success
    cart.clearCart();
    cart.showNotification('Order placed successfully!');
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  });
}

function updateCheckoutSummary() {
  const subtotalElement = document.getElementById('checkout-subtotal');
  const totalElement = document.getElementById('checkout-total');
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(cart.getTotal());
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(cart.getTotal());
  }
}

// =============================================
// Contact Form
// =============================================

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = form.querySelector('#name')?.value;
    const email = form.querySelector('#email')?.value;
    const message = form.querySelector('#message')?.value;
    
    if (!name || !email || !message) {
      cart.showNotification('Please fill in all fields');
      return;
    }
    
    // Simulate form submission
    cart.showNotification('Message sent successfully! We\'ll get back to you soon.');
    form.reset();
  });
}

// =============================================
// Smooth Scroll for Anchor Links
// =============================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (event) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      event.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// =============================================
// Initialize on DOM Load
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize cart count on all pages
  cart.updateCartCount();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize smooth scroll
  initSmoothScroll();
  
  // Render products on home page
  renderNewProducts();
  renderFastSellingProducts();
  
  // Initialize shop page
  renderShopProducts();
  initCategoryTabs();
  
  // Initialize cart page
  renderCartItems();
  
  // Initialize checkout page
  initCheckoutForm();
  updateCheckoutSummary();
  
  // Initialize contact page
  initContactForm();
  
  // Listen for cart updates
  window.addEventListener('cartUpdated', (event) => {
    console.log('Cart updated:', event.detail);
  });
});

// =============================================
// Export for use in inline handlers
// =============================================
window.cart = cart;
window.updateQuantity = updateQuantity;
window.formatPrice = formatPrice;
window.createProductCard = createProductCard;
window.createCartItem = createCartItem;
