// Base URL of the backend API. Change this if you deploy the backend elsewhere.
const API_BASE = 'http://localhost:5000/api';

// ---------- Cart helpers (persisted in localStorage) ----------
// Cart shape: { restaurantId, restaurantName, items: [{ id, name, price, quantity }] }

function getCart() {
  const raw = localStorage.getItem('swiggy_cart');
  return raw ? JSON.parse(raw) : null;
}

function saveCart(cart) {
  localStorage.setItem('swiggy_cart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('swiggy_cart');
}

function cartItemCount() {
  const cart = getCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

function cartTotal() {
  const cart = getCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
}

// Add or update an item in the cart. If the item belongs to a different
// restaurant than what's already in the cart, the cart is reset first
// (Swiggy doesn't allow mixing items from different restaurants).
function addToCart(restaurantId, restaurantName, item) {
  let cart = getCart();

  if (cart && cart.restaurantId !== restaurantId) {
    const confirmSwitch = confirm(
      `Your cart has items from ${cart.restaurantName}. Adding items from ${restaurantName} will clear your current cart. Continue?`
    );
    if (!confirmSwitch) return getCart();
    cart = null;
  }

  if (!cart) {
    cart = { restaurantId, restaurantName, items: [] };
  }

  const existing = cart.items.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();
  return cart;
}

function removeFromCart(itemId) {
  const cart = getCart();
  if (!cart) return;

  const existing = cart.items.find((i) => i.id === itemId);
  if (!existing) return;

  existing.quantity -= 1;
  if (existing.quantity <= 0) {
    cart.items = cart.items.filter((i) => i.id !== itemId);
  }

  if (cart.items.length === 0) {
    clearCart();
  } else {
    saveCart(cart);
  }

  updateCartBadge();
}

function getItemQuantity(itemId) {
  const cart = getCart();
  if (!cart) return 0;
  const item = cart.items.find((i) => i.id === itemId);
  return item ? item.quantity : 0;
}

// Update the little badge on the cart icon in the header, if present on the page.
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = cartItemCount();
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
