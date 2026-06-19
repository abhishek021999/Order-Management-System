# InvenTrack — Inventory & Order Management System

A production-ready, fully containerized Inventory & Order Management System built with FastAPI and React. Manage products, customers, and orders with automatic inventory tracking, real-time low-stock alerts, and a fully responsive UI.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://inventory-frontend.vercel.app |
| Backend API | https://inventory-backend-5r3a.onrender.com |
| API Docs (Swagger) | https://inventory-backend-5r3a.onrender.com/api/docs |
| API Docs (ReDoc) | https://inventory-backend-5r3a.onrender.com/api/redoc |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | 0.104.1 | Web framework |
| SQLAlchemy | 2.0.36 | ORM |
| Pydantic | 2.10.6 | Data validation |
| Uvicorn | 0.24.0 | ASGI server |
| PostgreSQL | 15 | Database |
| Alembic | 1.13.1 | DB migrations |
| psycopg2 | 2.9.10 | PostgreSQL driver |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| TypeScript | 5.3.3 | Type safety |
| Redux Toolkit | 1.9.7 | State management |
| Tailwind CSS | 3.3.6 | Styling |
| React Router | 6.20.0 | Client routing |
| Axios | 1.6.2 | HTTP client |
| Lucide React | 0.294.0 | Icons |

### Infrastructure
- **Docker + Docker Compose** — containerized development and production
- **Nginx** — reverse proxy, static file serving, gzip compression
- **Redis** — pub/sub for real-time notifications

---

## Features

### Product Management
- Create, read, update, delete products
- Unique SKU enforcement (immutable after creation)
- Inventory quantity tracking with non-negative constraint
- Low-stock alerts when quantity ≤ 10 units
- Guard against deleting products referenced by existing orders

### Customer Management
- Create, read, update, delete customers
- Unique email enforcement (immutable after creation)
- Optional phone number and address fields

### Order Management
- Multi-item orders with per-item stock validation
- Automatic total amount calculation
- Atomic stock deduction on order creation
- **Inventory auto-restored when order is cancelled**
- Order status lifecycle: `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`
- Revenue calculation excludes cancelled orders

### Dashboard
- KPI cards: total products, customers, orders, revenue
- Low-stock products panel (≤ 10 units, with visual progress bar)
- Recent orders list
- Fully responsive — mobile card view + desktop table view

### UI / UX
- Fully responsive across all screen sizes (mobile, tablet, desktop)
- Slide-in sidebar with overlay on mobile
- Command+K global search
- Toast notifications for all actions
- Real-time low-stock badge on dashboard

---

## Project Structure

```
Order-Management-System/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, routers
│   │   ├── config.py               # Settings from environment
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── product.py          # Product model
│   │   │   ├── customer.py         # Customer model
│   │   │   └── order.py            # Order + OrderItem models
│   │   ├── schemas/
│   │   │   ├── product.py          # Pydantic request/response schemas
│   │   │   ├── customer.py
│   │   │   └── order.py
│   │   ├── routes/
│   │   │   ├── products.py         # /api/products endpoints
│   │   │   ├── customers.py        # /api/customers endpoints
│   │   │   ├── orders.py           # /api/orders endpoints
│   │   │   └── websocket.py        # WebSocket support
│   │   ├── services/
│   │   │   ├── product_service.py  # Product business logic
│   │   │   ├── customer_service.py # Customer business logic
│   │   │   ├── order_service.py    # Order + inventory logic
│   │   │   └── notification_service.py # Redis pub/sub
│   │   └── utils/
│   │       ├── exceptions.py       # Custom HTTP exceptions
│   │       └── validators.py       # Input validators
│   ├── tests/
│   ├── alembic/                    # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Header, Sidebar, Footer, etc.
│   │   │   ├── dashboard/          # Dashboard + StatsCard
│   │   │   ├── products/           # ProductList, ProductForm
│   │   │   ├── customers/          # CustomerList, CustomerForm
│   │   │   └── orders/             # OrderList, OrderForm, OrderDetail
│   │   ├── pages/                  # Page-level route components
│   │   ├── services/               # Axios API wrappers
│   │   ├── store/slices/           # Redux slices (products, customers, orders)
│   │   ├── hooks/                  # useAppDispatch, useAppSelector
│   │   ├── utils/                  # formatCurrency, formatDate, constants
│   │   ├── styles/index.css        # Tailwind component layer
│   │   └── App.tsx                 # Routes + layout
│   ├── tailwind.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml              # Development (postgres + redis + backend + frontend)
├── docker-compose.prod.yml         # Production (+ nginx)
├── nginx.conf                      # Reverse proxy config
└── .gitignore
```

---

## API Endpoints

### Products — `/api/products`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/products` | Create product. Returns `409` if SKU already exists. |
| `GET` | `/api/products` | List products. Query params: `skip`, `limit`. |
| `GET` | `/api/products/{id}` | Get single product. |
| `PUT` | `/api/products/{id}` | Update name, price, quantity, description. SKU is immutable. |
| `DELETE` | `/api/products/{id}` | Delete product. Returns `400` if referenced by any order. |

### Customers — `/api/customers`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/customers` | Create customer. Returns `409` if email already exists. |
| `GET` | `/api/customers` | List customers. Query params: `skip`, `limit`. |
| `GET` | `/api/customers/{id}` | Get single customer. |
| `PUT` | `/api/customers/{id}` | Update name, phone, address. Email is immutable. |
| `DELETE` | `/api/customers/{id}` | Delete customer. |

### Orders — `/api/orders`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/orders` | Create order. Validates stock, deducts inventory, auto-calculates total. |
| `GET` | `/api/orders` | List orders with customer + items. Query params: `skip`, `limit`. |
| `GET` | `/api/orders/{id}` | Get order detail with all items and customer info. |
| `PUT` | `/api/orders/{id}` | Update order status. Cancelling restores product inventory. |
| `DELETE` | `/api/orders/{id}` | Delete order and restore inventory for all line items. |
| `GET` | `/api/orders/customer/{customer_id}` | Get all orders for a customer. |
| `GET` | `/api/orders/stats/dashboard` | Dashboard stats: counts, revenue, low-stock list. |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{"status": "healthy"}` |
| `GET` | `/api/docs` | Swagger UI |
| `GET` | `/api/redoc` | ReDoc |

---

## Database Schema

### `products`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `name` | String(255) | NOT NULL, indexed |
| `sku` | String(100) | NOT NULL, UNIQUE, indexed |
| `price` | Numeric(10,2) | NOT NULL, > 0 |
| `quantity` | Integer | NOT NULL, default 0, ≥ 0 |
| `description` | Text | nullable |
| `created_at` | Timestamp TZ | server default |
| `updated_at` | Timestamp TZ | server default, on update |

### `customers`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `full_name` | String(255) | NOT NULL, indexed |
| `email` | String(255) | NOT NULL, UNIQUE, indexed |
| `phone_number` | String(20) | nullable |
| `address` | Text | nullable |
| `created_at` | Timestamp TZ | server default |
| `updated_at` | Timestamp TZ | server default, on update |

### `orders`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `customer_id` | Integer | FK → customers(id) ON DELETE CASCADE |
| `total_amount` | Numeric(10,2) | NOT NULL, ≥ 0 |
| `status` | String(50) | NOT NULL, default `pending` |
| `created_at` | Timestamp TZ | server default |
| `updated_at` | Timestamp TZ | server default, on update |

### `order_items`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `order_id` | Integer | FK → orders(id) ON DELETE CASCADE |
| `product_id` | Integer | FK → products(id) NOT NULL |
| `quantity` | Integer | NOT NULL, > 0 |
| `unit_price` | Numeric(10,2) | NOT NULL, > 0 |
| `subtotal` | Numeric(10,2) | NOT NULL, > 0 |
| `created_at` | Timestamp TZ | server default |

---

## Environment Variables

### Backend — `backend/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
REDIS_URL=redis://localhost:6379/0
```

### Frontend — `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## Quick Start

### With Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Order-Management-System

# Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services (postgres, redis, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs |

### Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit DATABASE_URL to point at your Postgres
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env            # Set REACT_APP_API_URL=http://localhost:8000
npm start
```

---

## Testing

```bash
# Backend unit + integration tests
cd backend
pytest

# With coverage report
pytest --cov=app tests/ --cov-report=term-missing
```

---

## Production Deployment

### Docker Compose (Self-hosted)

```bash
# Copy and configure production env
cp backend/.env.example backend/.env   # set DEBUG=False, real DB URL
cp frontend/.env.example frontend/.env # set REACT_APP_API_URL to deployed backend

# Build and start with nginx
docker-compose -f docker-compose.prod.yml up -d --build
```

Nginx listens on port 80 and:
- Proxies `/api/*`, `/health`, `/docs`, `/redoc` → FastAPI backend
- Serves the React build as static files with SPA fallback
- Enables gzip and 1-year cache headers for assets

### Recommended Cloud Stack (Free Tier)

| Layer | Platform | Notes |
|---|---|---|
| Database | Render PostgreSQL | Free managed Postgres |
| Backend | Render Web Service | Auto-deploys from GitHub |
| Frontend | Vercel | Auto-deploys from GitHub |

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

### Deployment Checklist
- [ ] `DATABASE_URL` set on backend service
- [ ] `DEBUG=False` in production
- [ ] `CORS_ORIGINS` includes the frontend URL
- [ ] `REACT_APP_API_URL` points at the deployed backend
- [ ] HTTPS enabled on both services
- [ ] Database backups configured

---

## Key Business Rules

| Rule | Detail |
|---|---|
| Stock deduction | Atomic on order creation — fails with 400 if any item has insufficient stock |
| Inventory restore | Happens immediately when order status → `cancelled` OR order is deleted |
| Low-stock threshold | 10 units — products at or below appear in dashboard and trigger notification |
| Product deletion guard | Returns 400 if the product is referenced by any order item |
| SKU immutability | SKU cannot be changed after product creation |
| Email immutability | Customer email cannot be changed after creation |
| Revenue calculation | Excludes all cancelled orders |

---

## Troubleshooting

**Database connection refused**
```bash
docker ps | grep postgres          # Check it is running
docker logs inventory_postgres     # View postgres logs
```

**Backend 500 errors**
```bash
docker logs inventory_backend      # Check stack trace
docker inspect inventory_backend   # Verify env vars
```

**Frontend not connecting to API**
```bash
# Confirm REACT_APP_API_URL is set correctly in frontend/.env
# The variable must be set at build time — rebuild after changing it
npm run build
```

**node_modules issues**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Security

- All inputs validated by Pydantic (backend) and TypeScript types (frontend)
- ORM queries prevent SQL injection
- CORS restricted to configured origins
- Secrets stored in environment variables, never committed
- Docker containers run as non-root users
- Check constraints enforce data integrity at the database level

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## License

MIT License — see the LICENSE file for details.
