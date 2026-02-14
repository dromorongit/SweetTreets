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
      // Add category products to cache
      data.data.forEach(product => {
        if (!productsCache.find(p => p._id === product._id)) {
          productsCache.push(product);
        }
      });
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
      // Add new arrival products to cache
      data.data.forEach(product => {
        if (!productsCache.find(p => p._id === product._id)) {
          productsCache.push(product);
        }
      });
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
      // Add fast selling products to cache
      data.data.forEach(product => {
        if (!productsCache.find(p => p._id === product._id)) {
          productsCache.push(product);
        }
      });
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching fast selling products:', error);
    return [];
  }
}

// Fetch a single product by ID
async function fetchProductById(productId) {
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
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

    // Use salesPrice if available, otherwise use originalPrice
    const price = product.salesPrice && product.salesPrice < product.originalPrice 
      ? product.salesPrice 
      : product.originalPrice;

    const existingItem = this.items.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product._id,
        name: product.productName,
        price: price,
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
      <div class="product-hover-overlay">
        <a href="product.html?id=${product._id}" class="view-details-btn">View Details</a>
      </div>
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
    const deliveryFee = 0;
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
  
  // Delivery fee is now "to be discussed" for all locations
  const deliveryFee = 0;
  const deliveryText = 'To be discussed';
  
  let message = `🏪 *Sweet Treets Order*%0A%0A` +
    `*Order ID:* ${order.orderId}%0A%0A` +
    `*Customer:* ${customer.name}%0A%0A` +
    `*Items:*%0A${itemsList}%0A%0A` +
    `*Delivery Fee:* ${deliveryText}%0A%0A` +
    `*Total Amount:* ${formatPrice(order.total + deliveryFee)}%0A%0A` +
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
  
  // Handle form submission - redirect to WhatsApp with order
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Get customer info
    const customer = {
      name: form.querySelector('#fullName')?.value || '',
      email: form.querySelector('#email')?.value || '',
      phone: form.querySelector('#phone')?.value || '',
      address: form.querySelector('#address')?.value || '',
      city: form.querySelector('#city')?.value || '',
      region: form.querySelector('#region')?.value || ''
    };
    
    // Validate
    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.region) {
      cart.showNotification('Please fill in all delivery information');
      return;
    }
    
    // Create order
    const order = {
      orderId: generateOrderId(),
      items: cart.getItems(),
      total: cart.getTotal(),
      receiptUrl: ''
    };
    
    // Redirect to WhatsApp
    redirectToWhatsApp(order, customer);
    
    // Clear cart after order
    cart.clearCart();
    
    // Show success
    cart.showNotification('Order sent to WhatsApp! Check your messages.');
  });
}

function updateCheckoutSummary() {
  const subtotalElement = document.getElementById('checkout-subtotal');
  const totalElement = document.getElementById('checkout-total');
  const deliveryElement = document.getElementById('checkout-delivery');
  const deliveryRow = document.getElementById('delivery-row');
  
  const subtotal = cart.getTotal();
  const regionSelect = document.getElementById('region');
  const selectedRegion = regionSelect ? regionSelect.value : '';
  
  // Delivery fee is now "to be discussed" for all locations
  let deliveryFee = 0;
  let deliveryText = 'To be discussed';
  
  const total = subtotal + deliveryFee;
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }
  
  if (deliveryElement) {
    deliveryElement.textContent = deliveryText;
    deliveryElement.style.color = 'var(--color-text-light)';
    deliveryElement.style.fontSize = 'var(--font-size-sm)';
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(total);
  }
}

// Initialize region change listener for checkout page
function initRegionListener() {
  const regionSelect = document.getElementById('region');
  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      updateCheckoutSummary();
    });
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
// Product Details Page
// =============================================

async function renderProductDetails() {
  const productContainer = document.getElementById('product-details');
  if (!productContainer) return;
  
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    productContainer.innerHTML = `
      <div class="empty-cart" style="grid-column: 1 / -1;">
        <div class="empty-cart-icon">❌</div>
        <h3>Product Not Found</h3>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <a href="shop.html" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
    return;
  }
  
  // Fetch product from API
  const product = await fetchProductById(productId);
  
  if (!product) {
    productContainer.innerHTML = `
      <div class="empty-cart" style="grid-column: 1 / -1;">
        <div class="empty-cart-icon">❌</div>
        <h3>Product Not Found</h3>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <a href="shop.html" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
    return;
  }
  
  // Update page title
  document.title = `${product.productName} - Sweet Treets`;
  
  // Get image URL
  const mainImageUrl = getFullImageUrl(product.mainImage);
  const additionalImages = product.additionalImages || [];
  
  // Calculate price
  const hasDiscount = product.salesPrice && product.salesPrice < product.originalPrice;
  const priceDisplay = hasDiscount 
    ? `<span style="text-decoration: line-through; color: var(--color-text-light); font-size: 1.25rem;">${formatPrice(product.originalPrice)}</span> <span style="color: var(--color-accent); font-size: 2rem; font-weight: 700;">${formatPrice(product.salesPrice)}</span>`
    : `<span style="color: var(--color-accent); font-size: 2rem; font-weight: 700;">${formatPrice(product.originalPrice)}</span>`;
  
  // Calculate discount percentage
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.salesPrice / product.originalPrice) * 100)
    : 0;
  
  // Stock status
  const isInStock = product.stockNumber > 0;
  const stockStatus = isInStock 
    ? `<span style="color: var(--color-success);">In Stock (${product.stockNumber} available)</span>`
    : `<span style="color: var(--color-error);">Out of Stock</span>`;
  
  // Render product details
  productContainer.innerHTML = `
    <div class="product-gallery">
      <div class="main-image">
        <img id="main-product-image" src="${mainImageUrl}" alt="${product.productName}">
        ${hasDiscount ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
      </div>
      ${additionalImages.length > 0 ? `
        <div class="thumbnail-images">
          ${additionalImages.map((img, index) => `
            <img src="${getFullImageUrl(img)}" alt="${product.productName} - Image ${index + 1}" 
                 onclick="changeMainImage('${getFullImageUrl(img)}')" 
                 class="thumbnail ${index === 0 ? 'active' : ''}">
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="product-info-details">
      <h1>${product.productName}</h1>
      
      <div class="product-meta">
        <span class="stock-status">${stockStatus}</span>
        ${product.origin ? `<span class="origin-badge">Origin: ${product.origin}</span>` : ''}
        ${product.brand ? `<span class="brand-badge">Brand: ${product.brand}</span>` : ''}
      </div>
      
      <div class="product-price-section">
        ${priceDisplay}
        ${hasDiscount ? `<span style="color: var(--color-text-light); margin-left: var(--spacing-md);">Save ${formatPrice(product.originalPrice - product.salesPrice)}</span>` : ''}
      </div>
      
      ${product.shortDescription ? `
        <div class="product-short-description">
          <p>${product.shortDescription}</p>
        </div>
      ` : ''}
      
      ${product.description ? `
        <div class="product-description">
          <h3>Product Description</h3>
          <p>${product.description}</p>
        </div>
      ` : ''}
      
      ${product.ingredients ? `
        <div class="product-ingredients">
          <h3>Ingredients</h3>
          <p>${product.ingredients}</p>
        </div>
      ` : ''}
      
      ${product.nutritionalInfo ? `
        <div class="product-nutritional">
          <h3>Nutritional Information</h3>
          <p>${product.nutritionalInfo}</p>
        </div>
      ` : ''}
      
      <div class="product-actions">
        <div class="quantity-selector">
          <label for="quantity">Quantity:</label>
          <div class="quantity-control">
            <button class="quantity-btn" onclick="changeProductQuantity(-1)">-</button>
            <input type="number" id="quantity" value="1" min="1" max="${product.stockNumber}" readonly>
            <button class="quantity-btn" onclick="changeProductQuantity(1)">+</button>
          </div>
        </div>
        
        <button class="btn btn-primary add-to-cart-btn" onclick="addToCartFromDetails('${product._id}')" ${!isInStock ? 'disabled' : ''}>
          ${isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
      
      ${product.tags && product.tags.length > 0 ? `
        <div class="product-tags">
          <span style="color: var(--color-text-light);">Tags:</span>
          ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
        </div>
      ` : ''}
    </div>
  `;
}

// Change main image when thumbnail is clicked
function changeMainImage(imageUrl) {
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = imageUrl;
  }
  
  // Update active thumbnail
  const thumbnails = document.querySelectorAll('.thumbnail-images .thumbnail');
  thumbnails.forEach(thumb => {
    thumb.classList.remove('active');
    if (thumb.src === imageUrl) {
      thumb.classList.add('active');
    }
  });
}

// Change product quantity in details page
function changeProductQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  if (quantityInput) {
    let currentValue = parseInt(quantityInput.value);
    let newValue = currentValue + change;
    const maxValue = parseInt(quantityInput.max);
    
    if (newValue >= 1 && newValue <= maxValue) {
      quantityInput.value = newValue;
    }
  }
}

// Add to cart from product details page
function addToCartFromDetails(productId) {
  const quantityInput = document.getElementById('quantity');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  cart.addItem(productId, quantity);
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
  initRegionListener();
  
  // Initialize contact page
  initContactForm();
  
  // Initialize product details page
  await renderProductDetails();
  
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
window.generateOrderId = generateOrderId;
window.fetchProducts = fetchProducts;
window.fetchNewArrivals = fetchNewArrivals;
window.fetchFastSelling = fetchFastSelling;
window.fetchProductById = fetchProductById;
window.updateCheckoutSummary = updateCheckoutSummary;
window.initRegionListener = initRegionListener;
window.renderProductDetails = renderProductDetails;
