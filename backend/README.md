# FastAPI Backend

Production-ready FastAPI backend for Inventory & Order Management System.

## Features

- ✅ RESTful API with FastAPI
- ✅ SQLAlchemy ORM with PostgreSQL
- ✅ Pydantic validation
- ✅ Error handling and logging
- ✅ Database relationships
- ✅ Business logic layer (services)
- ✅ Inventory management with stock validation
- ✅ Order processing with automatic total calculation
- ✅ API documentation (Swagger/OpenAPI)

## Getting Started

### Local Development

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database**
```bash
# The database tables are created automatically on app startup
```

5. **Run the application**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Docker

### Build and Run

```bash
# Build the image
docker build -t inventory-api .

# Run the container
docker run -p 8000:8000 --env-file .env inventory-api
```

## Project Structure

```
app/
├── main.py              # Application entry point
├── config.py            # Configuration management
├── database.py          # Database setup
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas
├── routes/              # API endpoints
├── services/            # Business logic
└── utils/               # Utilities
```

## Testing

```bash
pytest
pytest --cov=app tests/
```

## Deployment

See DEPLOYMENT.md for production deployment instructions.
