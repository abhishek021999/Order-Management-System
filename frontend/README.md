# Frontend React TypeScript Application

Production-ready React TypeScript frontend for Inventory & Order Management System.

## Features

- ✅ React 18 with TypeScript
- ✅ Redux Toolkit for state management
- ✅ Tailwind CSS for styling
- ✅ Responsive UI components
- ✅ API integration with Axios
- ✅ Form validation
- ✅ Comprehensive error handling
- ✅ Toast notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
src/
├── components/      # Reusable React components
├── pages/          # Page components
├── services/       # API service layer
├── store/          # Redux store and slices
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and constants
├── hooks/          # Custom React hooks
├── styles/         # Global styles
├── App.tsx         # Main App component
└── index.tsx       # Entry point
```

## Docker

### Build and Run

```bash
# Build the image
docker build -t inventory-frontend .

# Run the container
docker run -p 3000:3000 --env-file .env inventory-frontend
```

## API Integration

The frontend communicates with the backend API at the URL specified in `.env`:

```
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

See DEPLOYMENT.md for production deployment instructions to Vercel or Netlify.
