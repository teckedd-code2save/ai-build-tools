# Domain: SaaS / Subscription Platform

## Core Entities

| Entity | Key Attributes | Notes |
|---|---|---|
| organizations | id, name, slug, plan_id, trial_ends_at, status | Multi-tenant root |
| users | id, org_id, email, full_name, role, last_login_at | |
| plans | id, name, price_monthly, price_yearly, features (JSONB), limits (JSONB) | |
| subscriptions | id, org_id, plan_id, status, current_period_start/end, cancel_at | |
| invoices | id, org_id, subscription_id, amount, status, due_date, paid_at | |
| usage_events | id, org_id, user_id, event_type, resource_id, quantity, recorded_at | Metered billing |
| api_keys | id, org_id, user_id, key_hash, name, last_used_at, revoked_at | |
| audit_logs | id, org_id, user_id, action, resource_type, resource_id, metadata (JSONB), ip | |
| notifications | id, user_id, type, title, body, read_at, sent_at | |
| feature_flags | id, name, enabled_for (JSONB array of org_ids), rollout_pct | |

## Common Pitfalls
- Always scope queries by `org_id` — row-level security if using Postgres RLS
- Subscription status needs careful state machine: trialing → active → past_due → cancelled
- Store plan limits in JSONB for flexibility (seat counts, API call limits, storage)
- Audit logs should never be deleted — use append-only policy

## Key Indexes
```sql
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_usage_events_org_id_recorded ON usage_events(org_id, recorded_at DESC);
CREATE INDEX idx_audit_logs_org_id_created ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;
```

## Sample Analytics
```sql
-- MRR by plan
SELECT p.name, COUNT(s.id) AS subscribers,
       SUM(p.price_monthly) AS mrr
FROM subscriptions s JOIN plans p ON p.id = s.plan_id
WHERE s.status = 'active'
GROUP BY p.id, p.name ORDER BY mrr DESC;

-- Churn this month
SELECT COUNT(*) AS churned
FROM subscriptions
WHERE status = 'cancelled'
  AND updated_at >= DATE_TRUNC('month', NOW());
```
