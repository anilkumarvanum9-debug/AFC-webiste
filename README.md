# Swiggy Clone (Core v1)

A simple food-delivery web app inspired by Swiggy — browse restaurants, view menus, add items to a cart, and place an order.

**Stack:** Plain HTML/CSS/JS frontend + Node.js/Express backend (in-memory data, no database required).

## Folder structure

```
swiggy-clone/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── data/
│       └── restaurants.json   # Mock restaurant + menu data
└── frontend/
    ├── index.html          # Restaurant list + search
    ├── restaurant.html     # Menu page for one restaurant
    ├── cart.html           # Cart / checkout page
    ├── order-success.html  # Order confirmation page
    ├── css/style.css
    └── js/common.js        # Cart logic (localStorage) shared across pages
```

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

The API runs at `http://localhost:5000`. You should see:
```
Swiggy-clone backend running at http://localhost:5000
```

### API endpoints

| Method | Endpoint              | Description                          |
|--------|------------------------|---------------------------------------|
| GET    | /api/health            | Health check                          |
| GET    | /api/restaurants       | List restaurants (optional `?search=`)|
| GET    | /api/restaurants/:id   | Restaurant details + full menu        |
| POST   | /api/orders            | Place an order                        |
| GET    | /api/orders            | List all orders (order history)       |
| GET    | /api/orders/:id        | Get a single order                    |

`POST /api/orders` body example:
```json
{
  "restaurantId": 1,
  "items": [{ "id": 101, "name": "Butter Chicken", "price": 320, "quantity": 2 }],
  "address": "221B Baker Street",
  "paymentMethod": "UPI"
}
```

> Note: Orders are stored in memory. They reset whenever the server restarts. Swap in a real database (MongoDB/Postgres) later if you want persistence.

## 2. Run the frontend

The frontend is plain static HTML/CSS/JS, so you just need any static file server. Easiest option — from the `frontend` folder:

```bash
cd frontend
npx serve .
```
(or open `index.html` directly in your browser, or use the VS Code "Live Server" extension)

Then visit the URL it gives you (e.g. `http://localhost:3000`).

Make sure the backend (step 1) is running at `http://localhost:5000` — the frontend calls it directly. If you change the backend port or host, update `API_BASE` in `frontend/js/common.js`.

## How it works

1. **index.html** — fetches `/api/restaurants`, renders a searchable grid of restaurant cards.
2. **restaurant.html?id=X** — fetches `/api/restaurants/:id`, shows the menu, lets you add/remove items. Cart state is kept in `localStorage` (works across page loads without a login).
3. **cart.html** — reads the cart from `localStorage`, shows a bill summary, collects delivery address + payment method, then `POST`s to `/api/orders`.
4. **order-success.html** — fetches the placed order by ID and shows a confirmation.

## Extending this (v2 ideas)

- Add user authentication (JWT) and per-user order history
- Restaurant/admin panel to manage menu items
- Real payment gateway integration (Razorpay/Stripe test mode)
- Swap `restaurants.json` for a real database (MongoDB/Postgres)
- Order status tracking (preparing → out for delivery → delivered)
