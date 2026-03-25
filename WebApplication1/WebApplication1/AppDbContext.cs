using WebApplication1.models;

namespace WebApplication1;

using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Додаткове налаштування зв'язків для Systematic Approach
        modelBuilder.Entity<Chat>()
            .HasMany(c => c.Messages)
            .WithOne()
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}