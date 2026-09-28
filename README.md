# Product Inventory API

A production-ready RESTful API for managing products and inventory, built with **Node.js, Express, PostgreSQL, and Prisma**.

## Features

* Product CRUD
* Search, filtering, sorting & pagination
* Inventory stock adjustments
* Low-stock detection
* Inventory statistics
* JWT authentication
* Role-based authorization
* Zod validation
* Rate limiting & security headers
* Structured logging
* Swagger/OpenAPI documentation
* Automated tests
* Docker
* GitHub Actions CI

## Tech Stack

* Node.js
* Express 5
* PostgreSQL
* Prisma
* JWT
* Zod
* Jest & Supertest
* Swagger
* Docker
* GitHub Actions

## Architecture

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Prisma
  ↓
PostgreSQL
```

## Getting Started

### 1. Clone

```bash
git clone https://github.com/tmachingur-code/product-inventory-api.git
cd product-inventory-api
```

### 2. Install

```bash
npm install
```

### 3. Configure environment

Create `.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret"
LOG_LEVEL=info
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Start

```bash
npm run dev
```

API:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api-docs
```

## Testing

```bash
npm test
```

Coverage:

```bash
npm test -- --coverage
```

Current test status:

* 42 test suites
* 298 tests
* 100% statements
* 100% lines
* 100% functions
* 96.06% branches

## Docker

```bash
docker compose up --build
```

## Deployment

The API is deployed using **Render** with:

* Render Web Service
* Render PostgreSQL
* Prisma migrations
* Environment variables
* GitHub-based continuous deployment

Production migrations:

```bash
npx prisma migrate deploy
```

## API

Base endpoint:

```text
/api/products
```

Authentication:

```text
/api/auth
```

Users:

```text
/api/users
```

Interactive API documentation:

```text
/api-docs
```

## Security

The API uses:

* JWT authentication
* bcrypt password hashing
* Helmet
* CORS
* Rate limiting
* Zod validation
* Centralized error handling
* Sensitive log redaction

## Author

**Tsungirirai Machingura**

BSc Software Engineering
African Leadership University

GitHub: `tmachingur-code`
