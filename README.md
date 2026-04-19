# 🍽️ Malabar Spice — Restaurant Website

A full-stack restaurant reservation and management platform built for a Kerala fine-dining restaurant.

**Live Demo:** [malabaar-spices.netlify.app](https://malabaar-spices.netlify.app)

---

## ✨ Features

### Customer-Facing
- 🗓️ **Interactive Table Booking** — Visual floor plan with real-time availability
- ⏰ **Time Slot Selection** — Choose from multiple dining slots
- 🔒 **Double-Booking Prevention** — Backend conflict check + frontend live sync ensures no two customers can book the same table at the same time
- 👤 **User Accounts** — Phone-number based login, booking history, review system
- 🍛 **Dynamic Menu** — Menu items loaded from database
- 📸 **Gallery** — Restaurant photo gallery

### Admin Dashboard
- 📋 **Booking Management** — View, cancel, mark arrived
- 🍽️ **Menu CRUD** — Add, edit, delete menu items with image upload
- 🖼️ **Gallery Management** — Manage restaurant photos
- ⏱️ **Time Slot Management** — Configure available booking slots
- 🔐 **JWT-Protected** — All admin routes require a signed JWT token

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) |
| Hosting | Netlify (frontend) + Render (backend) |

---

## 📁 Project Structure

```
malabar-spice/
├── index.html            # Home page
├── contact.html          # Reservation page
├── account.html          # Customer account & booking history
├── menu.html             # Menu page
├── gallery.html          # Gallery page
├── about.html            # About page
├── admin.html            # Admin dashboard (protected by JWT)
├── css/                  # Stylesheets
├── js/
│   ├── auth.js           # Customer auth & API helper
│   ├── admin.js          # Admin dashboard logic
│   ├── reservation.js    # Floor plan & booking system
│   └── ...
└── backend/
    ├── server.js         # Express entry point
    ├── models/           # Mongoose schemas
    │   ├── User.js
    │   ├── Booking.js
    │   ├── Review.js
    │   ├── MenuItem.js
    │   ├── Gallery.js
    │   ├── Feature.js
    │   ├── Table.js
    │   └── TimeSlot.js
    ├── routes/
    │   ├── auth.js       # POST /api/login
    │   ├── bookings.js   # GET /api/bookings/availability, POST /api/bookings
    │   ├── reviews.js    # GET/POST /api/reviews
    │   └── admin/        # All /api/admin/* routes (JWT protected)
    ├── middleware/
    │   └── auth.js       # JWT verification middleware
    └── .env.example      # Environment variable template
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/malabar-spice.git
cd malabar-spice
```

### 2. Configure the backend
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your values
npm install
npm start
```

### 3. Open the frontend
Open `index.html` in your browser, or use a static server:
```bash
npx serve .
```

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret key for signing admin JWT tokens |
| `ADMIN_USERNAME` | Admin dashboard username |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `CORS_ORIGIN` | Frontend URL allowed for CORS (e.g. your Netlify domain) |

---

## 🔑 Admin Access

Navigate to `/admin.html` and log in with your configured admin credentials. The admin session uses a JWT token valid for **8 hours**.

---

## 📄 License

MIT — free to use and modify.
