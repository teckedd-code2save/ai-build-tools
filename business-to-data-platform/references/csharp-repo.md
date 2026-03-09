# C# Repository Patterns

Use these patterns when generating C# repository functions in Step 6.

## Base Pattern (using Dapper)

```csharp
using Dapper;
using Npgsql;

public class Repository<T>
{
    private readonly string _connectionString;

    public Repository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")!;
    }

    protected NpgsqlConnection GetConnection() => new NpgsqlConnection(_connectionString);
}
```

## CRUD Template (Dapper)

```csharp
public class OrderRepository : Repository<Order>
{
    public OrderRepository(IConfiguration config) : base(config) { }

    // CREATE
    public async Task<Order> CreateAsync(CreateOrderDto dto)
    {
        const string sql = @"
            INSERT INTO orders (user_id, total_amount, status)
            VALUES (@UserId, @TotalAmount, @Status)
            RETURNING *";

        using var conn = GetConnection();
        return await conn.QuerySingleAsync<Order>(sql, dto);
    }

    // FIND BY ID
    public async Task<Order?> FindByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM orders WHERE id = @Id AND deleted_at IS NULL";
        using var conn = GetConnection();
        return await conn.QuerySingleOrDefaultAsync<Order>(sql, new { Id = id });
    }

    // LIST WITH FILTERS
    public async Task<PagedResult<Order>> ListAsync(OrderFilter filter, int page = 1, int pageSize = 20)
    {
        var conditions = new List<string> { "deleted_at IS NULL" };
        var parameters = new DynamicParameters();

        if (filter.UserId.HasValue)
        {
            conditions.Add("user_id = @UserId");
            parameters.Add("UserId", filter.UserId.Value);
        }
        if (filter.Status != null)
        {
            conditions.Add("status = @Status");
            parameters.Add("Status", filter.Status);
        }

        var where = string.Join(" AND ", conditions);
        parameters.Add("Offset", (page - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        var sql = $@"
            SELECT * FROM orders WHERE {where}
            ORDER BY created_at DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
            SELECT COUNT(*) FROM orders WHERE {where};";

        using var conn = GetConnection();
        using var multi = await conn.QueryMultipleAsync(sql, parameters);

        var data = (await multi.ReadAsync<Order>()).ToList();
        var total = await multi.ReadSingleAsync<int>();

        return new PagedResult<Order>(data, total, page, pageSize);
    }

    // UPDATE
    public async Task<Order?> UpdateStatusAsync(Guid id, string status)
    {
        const string sql = @"
            UPDATE orders
            SET status = @Status, updated_at = NOW()
            WHERE id = @Id AND deleted_at IS NULL
            RETURNING *";

        using var conn = GetConnection();
        return await conn.QuerySingleOrDefaultAsync<Order>(sql, new { Id = id, Status = status });
    }

    // SOFT DELETE
    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = @"
            UPDATE orders
            SET deleted_at = NOW()
            WHERE id = @Id AND deleted_at IS NULL
            RETURNING id";

        using var conn = GetConnection();
        var result = await conn.QuerySingleOrDefaultAsync<Guid?>(sql, new { Id = id });
        return result.HasValue;
    }

    // ANALYTICS: Top Customers
    public async Task<IEnumerable<CustomerSpendDto>> GetTopCustomersAsync(int limit = 10)
    {
        const string sql = @"
            SELECT
                user_id AS UserId,
                SUM(total_amount) AS TotalSpend,
                COUNT(*) AS OrderCount
            FROM orders
            WHERE status = 'delivered' AND deleted_at IS NULL
            GROUP BY user_id
            ORDER BY TotalSpend DESC
            LIMIT @Limit";

        using var conn = GetConnection();
        return await conn.QueryAsync<CustomerSpendDto>(sql, new { Limit = limit });
    }
}
```

## DTOs & Models

```csharp
public record Order
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Status { get; init; } = "pending";
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public DateTime? DeletedAt { get; init; }
}

public record CreateOrderDto(Guid UserId, decimal TotalAmount, string Status = "pending");

public record OrderFilter(Guid? UserId = null, string? Status = null);

public record CustomerSpendDto(Guid UserId, decimal TotalSpend, int OrderCount);

public record PagedResult<T>(IList<T> Data, int Total, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
}
```

## EF Core Alternative

```csharp
// DbContext
public class AppDbContext : DbContext
{
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.TotalAmount).HasColumnType("numeric(12,2)");
            e.HasQueryFilter(o => o.DeletedAt == null); // global soft-delete filter
        });
    }
}

// Repository using EF Core
public async Task<Order?> FindByIdAsync(Guid id)
    => await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
```
