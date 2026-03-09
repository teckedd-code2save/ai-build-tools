# Domain: E-Commerce / Marketplace

## Core Entities

| Entity | Key Attributes | Notes |
|---|---|---|
| users | id, email, full_name, phone, role (customer/seller/admin) | |
| addresses | id, user_id, line1, city, state, country, postal_code, is_default | |
| categories | id, parent_id, name, slug | Self-referential tree |
| products | id, seller_id, category_id, name, slug, description, status | |
| product_variants | id, product_id, sku, price, stock_qty, attributes (JSONB) | |
| orders | id, user_id, shipping_address_id, status, subtotal, tax, total | |
| order_items | id, order_id, variant_id, qty, unit_price, subtotal | |
| payments | id, order_id, amount, method, status, gateway_ref, paid_at | |
| reviews | id, product_id, user_id, rating, title, body, verified_purchase | |
| coupons | id, code, discount_type, discount_value, min_order, expires_at | |
| inventory_logs | id, variant_id, delta, reason, reference_id | Audit trail for stock |

## Common Pitfalls
- Never store prices as FLOAT — always NUMERIC(12,2)
- `order_items.unit_price` should be snapshot of price at time of purchase (not FK to current price)
- Category self-join needs careful recursion for breadcrumbs
- `product_variants.attributes` as JSONB allows flexible size/color without extra tables

## Key Indexes
```sql
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

## Sample Analytics
```sql
-- Top products by revenue (last 30 days)
SELECT p.name, SUM(oi.subtotal) AS revenue
FROM order_items oi
JOIN product_variants pv ON pv.id = oi.variant_id
JOIN products p ON p.id = pv.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'delivered' AND o.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 10;

-- Low stock alert
SELECT p.name, pv.sku, pv.stock_qty
FROM product_variants pv JOIN products p ON p.id = pv.product_id
WHERE pv.stock_qty <= 5 AND p.status = 'active'
ORDER BY pv.stock_qty ASC;
```
