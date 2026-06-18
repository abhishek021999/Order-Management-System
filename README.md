# Inventory & Order Management System

## 📋 Overview

A **production-ready**, fully containerized Inventory & Order Management System built with modern technologies. This system allows businesses to efficiently manage products, customers, and orders with real-time inventory tracking.

### 🎯 Live Demo (After Deployment)
- **Frontend**: https://your-frontend.vercel.app
- **Backend API**: https://your-api.onrender.com
- **API Docs**: https://your-api.onrender.com/api/docs

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Create React App

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Backend Hosting**: Render/Railway/Fly.io
- **Frontend Hosting**: Vercel/Netlify
- **Database**: PostgreSQL (Cloud Managed)

---

## ✨ Features

### Product Management
- ✅ CRUD operations for products
- ✅ SKU/code with unique constraint
- ✅ Inventory tracking
- ✅ Price management
- ✅ Low stock alerts

### Customer Management
- ✅ CRUD operations for customers
- ✅ Email uniqueness validation
- ✅ Contact information
- ✅ Address management

### Order Management
- ✅ Create orders with multiple items
- ✅ Automatic inventory reduction
- ✅ Automatic total calculation
- ✅ Order status tracking
- ✅ Order cancellation with inventory restoration

### Dashboard
- ✅ Total products count
- ✅ Total customers count
- ✅ Total orders count
- ✅ Total revenue calculation
- ✅ Low stock products alert
- ✅ Real-time statistics

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Or: Python 3.11+ & Node.js 18+

### Local Development with Docker

```bash
# Clone the repository
git clone <repository-url>
cd inventory-management-system

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Local Development without Docker

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

---

## 📁 Project Structure

```
inventory-management-system/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # Application entry
│   │   ├── config.py          # Settings
│   │   ├── database.py        # DB setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   ├── hooks/             # Custom hooks
│   │   ├── styles/            # CSS styles
│   │   ├── App.tsx            # Main app
│   │   └── index.tsx          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml         # Development setup
├── docker-compose.prod.yml    # Production setup
├── PROJECT_PLAN.md            # Detailed project plan
├── DEPLOYMENT.md              # Deployment guide
├── README.md                  # This file
└── .gitignore

```

---

## 🔌 API Endpoints

### Products
```
POST   /api/products              # Create product
GET    /api/products              # List products (paginated)
GET    /api/products/{id}         # Get product
PUT    /api/products/{id}         # Update product
DELETE /api/products/{id}         # Delete product
```

### Customers
```
POST   /api/customers             # Create customer
GET    /api/customers             # List customers (paginated)
GET    /api/customers/{id}        # Get customer
PUT    /api/customers/{id}        # Update customer
DELETE /api/customers/{id}        # Delete customer
```

### Orders
```
POST   /api/orders                # Create order
GET    /api/orders                # List orders (paginated)
GET    /api/orders/{id}           # Get order details
PUT    /api/orders/{id}           # Update order status
DELETE /api/orders/{id}           # Cancel order
GET    /api/orders/customer/{id}  # Get customer orders
GET    /api/orders/stats/dashboard # Dashboard stats
```

### Health & Utility
```
GET    /health                    # Health check
GET    /                          # Root endpoint
GET    /api/docs                  # Swagger UI
GET    /api/redoc                 # ReDoc
```

---

## 🗄️ Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `sku` - Unique SKU/code
- `price` - Product price
- `quantity` - Current stock
- `description` - Product description
- `created_at`, `updated_at` - Timestamps

### Customers Table
- `id` - Primary key
- `full_name` - Customer name
- `email` - Unique email
- `phone_number` - Contact phone
- `address` - Customer address
- `created_at`, `updated_at` - Timestamps

### Orders Table
- `id` - Primary key
- `customer_id` - FK to customers
- `total_amount` - Order total
- `status` - Order status
- `created_at`, `updated_at` - Timestamps

### Order Items Table
- `id` - Primary key
- `order_id` - FK to orders
- `product_id` - FK to products
- `quantity` - Quantity ordered
- `unit_price` - Price at time of order
- `subtotal` - Line total

---

## 🔐 Security Features

- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (ORM)
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Proper error handling
- ✅ No sensitive data in responses
- ✅ Non-root user in Docker containers

---

## 📦 Docker Hub

Backend image pushed to Docker Hub:
```bash
docker pull your-dockerhub-username/inventory-api:latest
```

---

## 🚀 Deployment

### Production Deployment Platforms

**Recommended Stack**:
- **Backend**: Render (Free tier available)
- **Frontend**: Vercel (Free tier available)
- **Database**: Render PostgreSQL (Free tier available)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] CORS properly set
- [ ] API documentation accessible
- [ ] Frontend and backend connected
- [ ] SSL/HTTPS enabled
- [ ] Monitoring set up
- [ ] Backups configured

---

## 📊 Performance

### Backend Optimizations
- Database connection pooling
- Query optimization with indexes
- Pagination support
- Async/await for I/O operations

### Frontend Optimizations
- Code splitting
- Lazy loading components
- CSS minification
- Image optimization
- Redux for efficient state management

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Coverage report
pytest --cov=app tests/

# Frontend tests
cd frontend
npm test
```

---

## 📝 API Documentation

### Swagger UI
Available at `http://localhost:8000/api/docs` during development or your deployed backend URL.

### ReDoc
Available at `http://localhost:8000/api/redoc`

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs inventory_postgres
```

### Backend Errors
```bash
# Check backend logs
docker logs inventory_backend

# Verify environment variables
docker inspect inventory_backend | grep ENV
```

### Frontend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear build cache
rm -rf build
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.

---

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📈 Next Steps

1. ✅ Clone repository
2. ✅ Set up local environment
3. ✅ Review PROJECT_PLAN.md for architecture
4. ✅ Read DEPLOYMENT.md for production setup
5. ✅ Deploy to your chosen platform
6. ✅ Monitor performance
7. ✅ Scale as needed

---

**Made with ❤️ for production-ready systems**
