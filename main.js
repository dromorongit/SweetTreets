/**
 * Sweet Treets E-Commerce Website JavaScript
 * Vanilla JavaScript ES6+ with Backend API Integration
 */

// API Configuration
const API_BASE = 'https://sweettreets-production.up.railway.app/api';

// Helper function to get full image URL
function getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local path, prepend the Railway URL
  if (imagePath.startsWith('/')) {
    return `https://sweettreets-production.up.railway.app${imagePath}`;
  }
  
  // Otherwise, prepend Railway URL
  return `https://sweettreets-production.up.railway.app/${imagePath}`;
}

// Products cache
let productsCache = [];

// =============================================
// API Functions
// =============================================

// Fetch all products
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const data = await response.json();
    if (data.success) {
      productsCache = data.data;
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch products by category
async function fetchProductsByCategory(category) {
  try {
    const response = await fetch(`${API_BASE}/products/category/${category}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Fetch new arrivals
async function fetchNewArrivals() {
  try {
    const response = await fetch(`${API_BASE}/products/new-arrivals`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
}

// Fetch fast selling products
async function fetchFastSelling() {
  try {
    const response = await fetch(`${API_BASE}/products/fast-selling`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching fast selling products:', error);
    return [];
  }
}

// Deduct stock after order
async function deductStock(productId, quantity) {
  try {
    const response = await fetch(`${API_BASE}/products/deduct-stock/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deducting stock:', error);
    return false;
  }
}

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
    const product = productsCache.find(p => p._id === productId);
    if (!product) return false;

    const existingItem = this.items.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product._id,
        name: product.productName,
        price: product.originalPrice,
        image: product.mainImage,
        quantity: quantity,
        stockNumber: product.stockNumber
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
  return `₵${parseFloat(price).toFixed(2)}`;
}

// Create product card HTML
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card fade-in';
  card.dataset.productId = product._id;
  card.dataset.categories = product.categories ? product.categories.join(',') : '';
  
  const imageUrl = getFullImageUrl(product.mainImage) || 'https://via.placeholder.com/400x400?text=No+Image';
  const price = product.salesPrice && product.salesPrice < product.originalPrice 
    ? `<span style="text-decoration: line-through; color: var(--color-text-light); font-size: 0.9rem;">${formatPrice(product.originalPrice)}</span> ${formatPrice(product.salesPrice)}`
    : formatPrice(product.originalPrice);
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.productName}" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.productName}</h3>
      <p class="product-price">${price}</p>
      <p style="font-size: 0.875rem; color: var(--color-text-light); margin-bottom: 0.5rem;">${product.shortDescription || ''}</p>
      ${product.stockNumber > 0 
        ? `<button class="btn btn-primary product-btn" onclick="cart.addItem('${product._id}')">Add to Cart</button>`
        : `<button class="btn btn-primary product-btn" disabled style="background-color: var(--color-text-light); cursor: not-allowed;">Out of Stock</button>`
      }
    </div>
  `;
  
  return card;
}

// Create cart item HTML
function createCartItem(item) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';
  cartItem.dataset.productId = item.id;
  
  const imageUrl = getFullImageUrl(item.image) || 'https://via.placeholder.com/100x100';
  
  cartItem.innerHTML = `
    <div class="cart-item-image">
      <img src="${imageUrl}" alt="${item.name}">
    </div>
    <div class="cart-item-details">
      <h4 class="cart-item-name">${item.name}</h4>
      <p class="cart-item-price">${formatPrice(item.price)}</p>
    </div>
    <div class="cart-item-actions">
      <div class="quantity-control">
        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
      </div>
      <button class="remove-btn" onclick="cart.removeItem('${item.id}'); renderCartItems();">Remove</button>
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
    const deliveryFee = 35.00;
    const totalWithDelivery = cart.getTotal() + deliveryFee;
    totalElement.textContent = formatPrice(totalWithDelivery);
  }
}

// =============================================
// Product Rendering
// =============================================

// Render new products
async function renderNewProducts() {
  const container = document.getElementById('new-products');
  if (!container) return;
  
  const newProducts = await fetchNewArrivals();
  
  if (newProducts.length === 0) {
    container.innerHTML = '<p class="text-center">No new arrivals at the moment</p>';
    return;
  }
  
  container.innerHTML = '';
  newProducts.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// Render fast selling products
async function renderFastSellingProducts() {
  const container = document.getElementById('fast-selling');
  if (!container) return;
  
  const fastProducts = await fetchFastSelling();
  
  if (fastProducts.length === 0) {
    container.innerHTML = '<p class="text-center">No fast selling products at the moment</p>';
    return;
  }
  
  container.innerHTML = '';
  fastProducts.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// Render shop products
async function renderShopProducts() {
  const container = document.getElementById('shop-products');
  if (!container) return;
  
  const products = await fetchProducts();
  
  if (products.length === 0) {
    container.innerHTML = '<p class="text-center">No products available at the moment</p>';
    return;
  }
  
  container.innerHTML = '';
  products.forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

// =============================================
// Tab/Category Filtering
// =============================================

async function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const categoryProducts = document.querySelectorAll('.category-products');
  
  if (tabButtons.length === 0) return;
  
  // Load category products
  const categories = ['Snacks', 'Drinks', 'Groceries'];
  
  for (const category of categories) {
    const container = document.getElementById(`${category.toLowerCase()}-products`);
    if (container) {
      const products = await fetchProductsByCategory(category);
      if (products.length === 0) {
        container.innerHTML = `<p class="text-center">No ${category.toLowerCase()} available at the moment</p>`;
      } else {
        container.innerHTML = '';
        products.forEach(product => {
          container.appendChild(createProductCard(product));
        });
      }
    }
  }
  
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
// WhatsApp Integration
// =============================================

function generateWhatsAppMessage(order, customer) {
  const itemsList = order.items.map(item => 
    `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
  ).join('%0A');
  
  let message = `🏪 *Sweet Treets Order*%0A%0A` +
    `*Order ID:* ${order.orderId}%0A%0A` +
    `*Customer:* ${customer.name}%0A%0A` +
    `*Items:*%0A${itemsList}%0A%0A` +
    `*Total Amount:* ${formatPrice(order.total + 35.00)} (incl. delivery)%0A%0A` +
    `*Delivery Address:*%0A${customer.address}, ${customer.city}, ${customer.region}%0A%0A` +
    `*Phone:* ${customer.phone}%0A%0A`;
  
  // Add receipt URL if available
  if (order.receiptUrl) {
    message += `📄 *Payment Receipt:*%0A${order.receiptUrl}%0A%0A`;
  }
  
  message += `📝 Message: I have made payment and attached receipt on the website.`;
  
  return message;
}

function redirectToWhatsApp(order, customer) {
  const whatsappNumber = '233540421116';
  const message = generateWhatsAppMessage(order, customer);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
  
  window.open(whatsappUrl, '_blank');
}

// Generate unique order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ST-${timestamp}-${random}`;
}

// Get receipt URL from checkout page
function getReceiptUrl() {
  const receiptUrlInput = document.getElementById('receipt-url');
  if (receiptUrlInput) {
    return receiptUrlInput.value || '';
  }
  return '';
}

// =============================================
// Checkout Functions
// =============================================

async function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  form.addEventListener('submit', async (event) => {
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
    
    // Check payment method and receipt
    const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked').value;
    const receiptInput = form.querySelector('#receipt');
    const paymentConfirmation = form.querySelector('#paymentConfirmation');
    
    if (paymentMethod !== 'cod' && (!receiptInput.files || receiptInput.files.length === 0)) {
      cart.showNotification('Please upload your payment receipt');
      return;
    }
    
    if (paymentMethod !== 'cod' && (!paymentConfirmation || !paymentConfirmation.checked)) {
      cart.showNotification('Please confirm that you have made the payment');
      return;
    }
    
    // Get receipt URL from hidden input
    const receiptUrl = getReceiptUrl();
    
    // Process order
    const orderData = {
      orderId: generateOrderId(),
      items: cart.getItems(),
      total: cart.getTotal(),
      receiptUrl: receiptUrl,
      customer: {
        name: form.querySelector('#fullName')?.value || '',
        email: form.querySelector('#email')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        address: form.querySelector('#address')?.value || '',
        city: form.querySelector('#city')?.value || '',
        region: form.querySelector('#region')?.value || '',
        landmark: form.querySelector('#landmark')?.value || '',
        deliveryNotes: form.querySelector('#deliveryNotes')?.value || ''
      },
      paymentMethod: paymentMethod,
      notes: form.querySelector('#orderNotes')?.value || '',
      date: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    // Deduct stock for each item
    for (const item of orderData.items) {
      await deductStock(item.id, item.quantity);
    }
    
    // Clear cart and show success
    cart.clearCart();
    cart.showNotification('Order submitted! Redirecting to WhatsApp...');
    
    // Redirect to WhatsApp after 1.5 seconds
    setTimeout(() => {
      redirectToWhatsApp(orderData, orderData.customer);
      // Redirect to home after WhatsApp
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
    }, 1500);
  });
}

function updateCheckoutSummary() {
  const subtotalElement = document.getElementById('checkout-subtotal');
  const totalElement = document.getElementById('checkout-total');
  const deliveryElement = document.getElementById('checkout-delivery');
  
  const subtotal = cart.getTotal();
  const deliveryFee = 35.00;
  const total = subtotal + deliveryFee;
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }
  
  if (deliveryElement) {
    deliveryElement.textContent = formatPrice(deliveryFee);
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(total);
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

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize cart count on all pages
  cart.updateCartCount();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize smooth scroll
  initSmoothScroll();
  
  // Load products from API
  await fetchProducts();
  
  // Render products on home page
  await renderNewProducts();
  await renderFastSellingProducts();
  
  // Initialize shop page
  await renderShopProducts();
  await initCategoryTabs();
  
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
window.getFullImageUrl = getFullImageUrl;
window.getReceiptUrl = getReceiptUrl;
window.createProductCard = createProductCard;
window.createCartItem = createCartItem;
window.redirectToWhatsApp = redirectToWhatsApp;
window.generateWhatsAppMessage = generateWhatsAppMessage;
window.fetchProducts = fetchProducts;
window.fetchNewArrivals = fetchNewArrivals;
window.fetchFastSelling = fetchFastSelling;
