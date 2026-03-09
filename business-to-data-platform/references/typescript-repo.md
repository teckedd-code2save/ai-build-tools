# TypeScript Repository Patterns

Use these patterns when generating TypeScript repository functions in Step 6.

## Base Pattern (using `pg` / node-postgres)

```typescript
import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const result: QueryResult<T> = await pool.query(sql, params);
  return result.rows;
}
```

## CRUD Template

```typescript
// CREATE
export async function create<T>(table: string, data: Partial<T>): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;
  const rows = await query<T>(sql, values);
  return rows[0];
}

// FIND BY ID
export async function findById<T>(table: string, id: string): Promise<T | null> {
  const rows = await query<T>(`SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return rows[0] ?? null;
}

// LIST WITH PAGINATION
export async function list<T>(
  table: string,
  filters: Record<string, unknown> = {},
  page = 1,
  pageSize = 20
): Promise<{ data: T[]; total: number }> {
  const where = Object.entries(filters)
    .map(([k, _], i) => `${k} = $${i + 1}`)
    .join(' AND ');
  const values = Object.values(filters);
  const offset = (page - 1) * pageSize;

  const [data, countResult] = await Promise.all([
    query<T>(
      `SELECT * FROM ${table} ${where ? `WHERE ${where}` : ''} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM ${table} ${where ? `WHERE ${where}` : ''}`,
      values
    ),
  ]);

  return { data, total: parseInt(countResult[0].count) };
}

// UPDATE
export async function update<T>(table: string, id: string, data: Partial<T>): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const rows = await query<T>(
    `UPDATE ${table} SET ${set}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] ?? null;
}

// SOFT DELETE
export async function softDelete(table: string, id: string): Promise<boolean> {
  const rows = await query(
    `UPDATE ${table} SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return rows.length > 0;
}
```

## Domain-Specific Example (Orders)

```typescript
export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export async function getTopCustomers(limit = 10): Promise<Array<{ user_id: string; total_spend: number; order_count: number }>> {
  return query(`
    SELECT
      user_id,
      SUM(total_amount) AS total_spend,
      COUNT(*) AS order_count
    FROM orders
    WHERE status = 'delivered' AND deleted_at IS NULL
    GROUP BY user_id
    ORDER BY total_spend DESC
    LIMIT $1
  `, [limit]);
}

export async function getOrdersByDateRange(from: Date, to: Date): Promise<Order[]> {
  return query<Order>(`
    SELECT * FROM orders
    WHERE created_at BETWEEN $1 AND $2
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `, [from, to]);
}
```
