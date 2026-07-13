const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- Load mock data ----------
const restaurantsPath = path.join(__dirname, 'data', 'restaurants.json');
const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf-8'));

// In-memory order store (resets when server restarts)
let orders = [];
let nextOrderId = 1000;

// ---------- Routes ----------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Swiggy-clone backend is running' });
});

// GET all restaurants (list view - no full menu, just summary)
app.get('/api/restaurants', (req, res) => {
  const { search } = req.query;

  let result = restaurants.map(({ menu, ...summary }) => summary);

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET single restaurant with full menu
app.get('/api/restaurants/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  res.json(restaurant);
});

// POST place an order
// body: { restaurantId, items: [{ id, name, price, quantity }], address, paymentMethod }
app.post('/api/orders', (req, res) => {
  const { restaurantId, items, address, paymentMethod } = req.body;

  if (!restaurantId || !items || items.length === 0) {
    return res.status(400).json({ error: 'restaurantId and items are required' });
  }

  const restaurant = restaurants.find((r) => r.id === parseInt(restaurantId, 10));
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 40;
  const taxes = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + deliveryFee + taxes;

  const order = {
    id: nextOrderId++,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    items,
    address: address || 'Not provided',
    paymentMethod: paymentMethod || 'Cash on Delivery',
    itemsTotal,
    deliveryFee,
    taxes,
    grandTotal,
    status: 'placed',
    placedAt: new Date().toISOString(),
  };

  orders.push(order);
  res.status(201).json(order);
});

// GET all orders (order history)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// GET single order by id
app.get('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Swiggy-clone backend running at http://localhost:${PORT}`);
});
