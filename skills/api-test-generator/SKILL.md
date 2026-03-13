---
name: api-test-generator
description: Generates comprehensive API integration tests (using Jest/Supertest, Pytest, etc.) from existing backend repositories, ORM schemas, and router/controller files. Use when a user wants to test their newly provisioned data platform or backend services.
---

# API Test Generator

Generate production-grade integration tests for existing API endpoints and backend services. This skill ensures that newly provisioned schemas and controllers are fully validated against business requirements.

## 🎯 When to Use
- After using the `business-to-data-platform` skill to scaffold a new backend.
- When adding new endpoints to an existing service.
- When refactoring DTOs, Schemas, or ORM models.
- When generating Postman/Bruno collections for manual API testing.

## 🛠️ Step-by-Step Workflow

### 1. Analyze the Backend Structure
- Scan the existing codebase to identify the framework (e.g., Express + TS, FastAPI, Spring Boot, .NET).
- Identify the ORM being used (e.g., Prisma, SQLAlchemy, EF Core).
- Locate the router/controller files to extract the exact endpoint paths, HTTP methods, and expected payloads.

### 2. Set Up the Test Environment
- Generate the necessary test scaffolding (e.g., `jest.config.js` with `ts-jest` for TypeScript, or `conftest.py` for Pytest).
- Auto-generate test database setup, teardown, and seeding scripts using the existing ORM. Tests should run against an isolated test database (e.g., a local Docker container) and rollback state between tests.
- Provide instructions or a workflow snippet for running the tests (e.g., `npm run test:e2e`).

### 3. Generate Integration Tests
For every identified endpoint, generate tests that cover:
- **Happy Path:** 200 OK or 201 Created with valid payloads. Verify the response shape against the API contract.
- **Validation Errors:** 400 Bad Request triggers by sending missing required fields, incorrect types, or boundary violations.
- **Not Found / Edge Cases:** 404 Not Found handling for invalid IDs.
- **Auth / Permissions (if applicable):** 401 Unauthorized or 403 Forbidden checks.

#### Example TypeScript + Jest + Supertest:
```typescript
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db/prisma';

describe('POST /api/users', () => {
  afterAll(async () => {
    await prisma.user.deleteMany(); // cleanup
  });

  it('should create a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test User' });
    
    expect(res.status).toBe(400);
  });
});
```

### 4. Provide API Collections (Optional)
If requested, output a JSON collection for Postman or Bruno. This allows the user to easily import the endpoints and play with them manually. Make sure to parameterize base URLs using environment variables like `{{baseUrl}}`.

## ⚙️ Best Practices
- **Never mock the database** for integration tests if it can be avoided. Tests should hit a real test database instance to ensure ORM queries behave exactly as they will in production.
- **Clear state between tests.** Use ORM capabilities to truncate tables or rollback transactions before every test case to prevent flakiness.
- **Use factories.** Leverage libraries like `faker.js` or `factory_boy` to create realistic test payloads instead of hardcoding `'test'` everywhere.
