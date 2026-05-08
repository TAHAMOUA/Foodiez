# 🍔 Foodiez — Restaurant Order Management Dashboard

A lightweight, browser-based dashboard for managing restaurant orders in real-time. Built with vanilla HTML/CSS/JS and powered by a local JSON Server API.

---

## 📋 Features

- **Dashboard** — Overview of all orders with stats (total, pending, accepted, completed, rejected)
- **Orders Page** — Browse, search, and filter all orders by status
- **New Order Form** — Manually create orders with a live preview card
- **Order Actions** — Accept, reject, complete, or delete any order
- **Toast Notifications** — Instant feedback on every action
- **Persistent Data** — All orders saved to `db.json` via JSON Server

---

## 🗂️ Project Structure

```
foodiez/
├── index.html        # Main UI (sidebar, dashboard, orders, new order pages)
├── script.js         # All frontend logic (fetch, render, actions)
├── db.json           # Local database (orders + settings)
├── package.json      # Dependencies & start script
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the JSON Server

```bash
npm start
```

> The API will run at **http://localhost:3000**

### 3. Open the app

Open `index.html` directly in your browser (no build step needed).

---

## 🗄️ API Endpoints

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| GET    | `/orders`         | Get all orders        |
| POST   | `/orders`         | Create a new order    |
| PATCH  | `/orders/:id`     | Update order status   |
| DELETE | `/orders/:id`     | Delete an order       |

---

## 📦 Order Structure

```json
{
  "id": "1",
  "customerName": "Ahmed Z.",
  "items": ["Margherita Pizza", "Soda"],
  "totalPrice": 110,
  "status": "pending",
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

**Possible statuses:** `pending` → `accepted` → `completed` / `rejected`

---

## 🍽️ Menu & Prices

| Item              | Price (MAD) |
|-------------------|-------------|
| Margherita Pizza  | 70          |
| Veggie Pizza      | 65          |
| Burger Menu       | 80          |
| Pasta Bolognese   | 95          |
| Caesar Salad      | 55          |
| Sushi Platter     | 150         |
| Tacos Mix         | 45          |
| Shawarma          | 45          |
| Fries             | 30          |
| Soda              | 20          |
| Water             | 10          |

---

## 🛠️ Tech Stack

- **Frontend:** HTML, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend:** [JSON Server](https://github.com/typicode/json-server) (local REST API)
- **No framework, no build tool required**

---

## ⚠️ Notes

- Make sure JSON Server is running **before** opening the app, otherwise orders won't load.
- The search bar filters by customer name (prefix match).
- Prices are calculated automatically based on the menu when creating a new order.