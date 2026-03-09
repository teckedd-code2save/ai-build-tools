# Domain: Mobility / Ride-Sharing / Delivery

## Core Entities

| Entity | Key Attributes | Notes |
|---|---|---|
| users | id, email, full_name, phone, role (rider/driver/admin), rating | Shared table with role discriminator |
| driver_profiles | user_id, license_number, vehicle_id, status (active/offline/busy) | 1:1 with users |
| vehicles | id, driver_id, make, model, year, plate_number, vehicle_type | |
| ride_requests | id, rider_id, driver_id, origin_lat/lng, dest_lat/lng, status, fare | |
| payments | id, ride_id, user_id, amount, method, status, gateway_ref | |
| ratings | id, ride_id, rater_id, ratee_id, score (1-5), comment | |
| locations | id, user_id, lat, lng, recorded_at | High-volume GPS pings |
| promo_codes | id, code, discount_type, discount_value, expires_at, max_uses | |

## Common Pitfalls
- Store lat/lng as `NUMERIC(10, 7)` not FLOAT for precision
- Ride status needs careful enum: requested → accepted → in_progress → completed | cancelled
- Payments and rides are separate (a ride may have multiple payment attempts)
- Use `PostGIS` extension for geo queries if available, otherwise plain numeric coords

## Key Indexes
```sql
CREATE INDEX idx_ride_requests_rider_id ON ride_requests(rider_id);
CREATE INDEX idx_ride_requests_driver_id ON ride_requests(driver_id);
CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_locations_user_id_recorded_at ON locations(user_id, recorded_at DESC);
```

## Sample Analytics Queries
```sql
-- Driver utilization rate
SELECT driver_id,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed_rides,
       COUNT(*) AS total_rides,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS utilization_pct
FROM ride_requests
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY driver_id;

-- Revenue by day
SELECT DATE(created_at) AS day, SUM(amount) AS revenue
FROM payments
WHERE status = 'completed'
GROUP BY 1 ORDER BY 1 DESC;
```
