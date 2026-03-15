---
name: frontend-data-consumer
description: Ingests backend API contracts and scaffolds high-quality, typed React/Vue components (Data Tables, Detail Cards, Forms) using a specific design system (like Tailwind or Shadcn/UI). Use when a user wants to build a UI for their backend API or data platform.
---

# Frontend Data Consumer

Automatically convert backend API contracts, database schemas, or ORM models into fully functional, strongly-typed frontend components. This skill is the perfect companion to the `business-to-data-platform` backend generator.

## 🎯 When to Use
- When the backend has been scaffolded and the user wants to start building the frontend features.
- When you need to generate a React or Vue component that reads or writes to a specific API endpoint.
- When generating admin dashboards, data tables, or forms based on database tables.
- Works perfectly alongside the `frontend-design-review` skill to refine the generated UI.

## 🛠️ Step-by-Step Workflow

### 1. Analyze the Backend Contracts
1. Locate the backend API routers/controllers, DTOs, or ORM schemas (e.g., Prisma schema, SQLAlchemy models).
2. Understand the exact shape of the data returned by the `GET` endpoints.
3. Understand the required payloads for the `POST`/`PUT`/`PATCH` endpoints.

### 2. Scaffold Frontend API Hooks/Services
Once the data shape is known, generate the data-fetching layer in the frontend using modern libraries (e.g., React Query, SWR, or RTK Query for React; Vue Query for Vue).

#### Example (React Query):
```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, CreateUserDto } from '../types/api';

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: CreateUserDto) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### 3. Generate UI Components
Based on the API contracts, scaffold the necessary UI components. Always use the project's preferred styling solution (TailwindCSS, CSS Modules, Styled Components, Shadcn/UI, Material UI).

- **Data Tables:** Map array responses to robust data tables (with pagination and sorting if supported by the backend).
- **Forms:** Generate creation/edit forms using a library like `react-hook-form` paired with `zod` validation that matches the backend rules exactly.
- **Detail Views:** Generate read-only detail cards for individual records.

### 4. Implement Loading & Error States
Never return a component that crashes when data is fetching or fails.
- Always handle the `isLoading` or `isPending` state with skeletons or spinners.
- Always handle the `isError` state with a friendly error message or fallback UI.

### 5. Finalize UI Contracts (No Hardcoding)
Adhere strictly to this rule: **Never hardcode static arrays representing business entities.** The components must *always* consume the generated API hooks. If the backend endpoint doesn't exist yet, the hook should query a real endpoint path even if it currently 404s, so the wiring is ready to go.
