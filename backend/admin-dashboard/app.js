/**
 * Sweet Treets Admin Dashboard JavaScript
 */

const API_BASE = 'https://sweettreets-production.up.railway.app/api';

// State
let token = localStorage.getItem('adminToken');
let currentDeleteId = null;
let currentEditId = null;

// DOM Elements
const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('page-title');
const adminName = document.getElementById('admin-name');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Check authentication
function checkAuth() {
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  loginForm.addEventListener('submit', handleLogin);
  
  // Logout
  logoutBtn.addEventListener('click', handleLogout);
  
  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
  
  // Search and filter
  document.getElementById('search-products').addEventListener('input', debounce(loadProducts, 300));
  document.getElementById('filter-category').addEventListener('change', loadProducts);
  
  // Add product form
  document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
  
  // Edit form
  document.getElementById('edit-product-form').addEventListener('submit', handleEditProduct);
  
  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeModals);
  });
  
  // Delete confirmation
  document.getElementById('confirm-delete-btn').addEventListener('click', handleDelete);
}

// Show login page
function showLogin() {
  loginPage.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  loginPage.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadDashboardData();
}

// Navigate to page
function navigateTo(page) {
  // Update nav
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Update page
  pages.forEach(p => {
    p.classList.toggle('active', p.id === `page-${page}`);
  });
  
  // Update title
  const titles = {
    dashboard: 'Dashboard',
    products: 'Products',
    'add-product': 'Add Product'
  };
  pageTitle.textContent = titles[page] || 'Dashboard';
  
  // Load data
  if (page === 'dashboard') {
    loadDashboardData();
  } else if (page === 'products') {
    loadProducts();
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const btn = loginForm.querySelector('button[type="submit"]');
  
  // Show loading
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      adminName.textContent = `Welcome, ${data.admin.username}`;
      showDashboard();
      loginForm.reset();
    } else {
      errorDiv.textContent = data.message || 'Login failed';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'Connection error. Please try again.';
    errorDiv.classList.remove('hidden');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// Handle logout
function handleLogout() {
  token = null;
  localStorage.removeItem('adminToken');
  showLogin();
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Get all products
    const productsRes = await fetch(`${API_BASE}/products/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const productsData = await productsRes.json();
    
    const products = productsData.data || [];
    
    // Update stats
    document.getElementById('stat-total-products').textContent = products.length;
    document.getElementById('stat-new-arrivals').textContent = products.filter(p => p.isNewArrival).length;
    document.getElementById('stat-fast-selling').textContent = products.filter(p => p.isFastSelling).length;
    
    // Low stock
    const lowStock = products.filter(p => p.stockNumber < 5);
    document.getElementById('stat-low-stock').textContent = lowStock.length;
    
    // Update low stock table
    const lowStockTable = document.getElementById('low-stock-table');
    if (lowStock.length === 0) {
      lowStockTable.innerHTML = '<tr><td colspan="3" class="text-center">No low stock products</td></tr>';
    } else {
      lowStockTable.innerHTML = lowStock.map(p => `
        <tr>
          <td>${p.productName}</td>
          <td class="${p.stockNumber === 0 ? 'out-of-stock' : 'low-stock'}">${p.stockNumber}</td>
          <td>${p.stockNumber === 0 ? 'Out of Stock' : 'Low Stock'}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Error loading dashboard data', 'error');
  }
}

// Load products
async function loadProducts() {
  const search = document.getElementById('search-products').value;
  const category = document.getElementById('filter-category').value;
  
  let url = `${API_BASE}/products?`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (category) url += `category=${encodeURIComponent(category)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const products = data.data || [];
    const tbody = document.getElementById('products-table');
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
      return;
    }
    
    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <img src="${p.mainImage || 'https://via.placeholder.com/60'}" alt="${p.productName}" class="product-image">
        </td>
        <td>${p.productName}</td>
        <td>₵${p.originalPrice.toFixed(2)}</td>
        <td class="${p.stockNumber === 0 ? 'out-of-stock' : p.stockNumber < 5 ? 'low-stock' : ''}">${p.stockNumber}</td>
        <td>${p.categories.join(', ')}</td>
        <td class="actions">
          <button class="btn btn-sm btn-outline" onclick="openEditModal('${p._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Error loading products', 'error');
  }
}

// Handle add product
async function handleAddProduct(e) {
  e.preventDefault();
  
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  
  // Show loading
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Product added successfully!', 'success');
      form.reset();
      navigateTo('products');
    } else {
      showToast(data.message || 'Error adding product', 'error');
    }
  } catch (error) {
    showToast('Connection error', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// Open edit modal
async function openEditModal(productId) {
  currentEditId = productId;
  
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const data = await response.json();
    
    if (data.success) {
      const p = data.data;
      
      // Populate form fields
      const editForm = document.getElementById('edit-product-form');
      if (!editForm) {
        console.error('Edit form not found');
        showToast('Error: Edit form not found', 'error');
        return;
      }
      
      document.getElementById('edit-product-id').value = p._id;
      document.getElementById('edit-productName').value = p.productName;
      document.getElementById('edit-shortDescription').value = p.shortDescription;
      document.getElementById('edit-longDescription').value = p.longDescription;
      document.getElementById('edit-originalPrice').value = p.originalPrice;
      document.getElementById('edit-salesPrice').value = p.salesPrice || '';
      document.getElementById('edit-stockNumber').value = p.stockNumber;
      
      // Categories - use querySelectorAll to find checkboxes within the edit form
      const categoryCheckboxes = editForm.querySelectorAll('input[name="categories"]');
      categoryCheckboxes.forEach(cb => {
        cb.checked = p.categories && p.categories.includes(cb.value);
      });
      
      // Flags - use querySelector to find checkboxes within the edit form
      const newArrivalCheckbox = editForm.querySelector('input[name="isNewArrival"]');
      const fastSellingCheckbox = editForm.querySelector('input[name="isFastSelling"]');
      
      if (newArrivalCheckbox) {
        newArrivalCheckbox.checked = p.isNewArrival;
      }
      if (fastSellingCheckbox) {
        fastSellingCheckbox.checked = p.isFastSelling;
      }
      
      // Show current main image preview
      const mainImageInput = document.getElementById('edit-mainImage');
      const mainImageContainer = mainImageInput?.closest('.form-group');
      if (mainImageContainer && p.mainImage) {
        // Add current image preview
        let preview = mainImageContainer.querySelector('.current-image-preview');
        if (!preview) {
          preview = document.createElement('div');
          preview.className = 'current-image-preview';
          preview.style.marginTop = '10px';
          mainImageContainer.appendChild(preview);
        }
        preview.innerHTML = `
          <p style="margin-bottom: 5px; font-size: 0.875rem;">Current Image:</p>
          <img src="${p.mainImage}" alt="Current product image" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid var(--color-border);">
        `;
      }
      
      document.getElementById('edit-modal').classList.remove('hidden');
    } else {
      console.error('API Error:', data.message);
      showToast(data.message || 'Error loading product', 'error');
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    showToast('Error loading product: ' + error.message, 'error');
  }
}

// Handle edit product
async function handleEditProduct(e) {
  e.preventDefault();
  
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  
  // Show loading
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/products/${currentEditId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Product updated successfully!', 'success');
      closeModals();
      loadProducts();
      loadDashboardData();
    } else {
      showToast(data.message || 'Error updating product', 'error');
    }
  } catch (error) {
    showToast('Connection error', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// Open delete modal
function openDeleteModal(productId) {
  currentDeleteId = productId;
  document.getElementById('delete-modal').classList.remove('hidden');
}

// Handle delete
async function handleDelete() {
  if (!currentDeleteId) return;
  
  try {
    const response = await fetch(`${API_BASE}/products/${currentDeleteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Product deleted successfully!', 'success');
      closeModals();
      loadProducts();
      loadDashboardData();
    } else {
      showToast(data.message || 'Error deleting product', 'error');
    }
  } catch (error) {
    showToast('Connection error', 'error');
  } finally {
    currentDeleteId = null;
  }
}

// Close modals
function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
  currentDeleteId = null;
  currentEditId = null;
}

// Show toast notification
function showToast(message, type = 'info') {
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Make functions globally accessible
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
