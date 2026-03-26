using Microsoft.EntityFrameworkCore;
using WebApplication1.models.entities;

/**
 * UI Designer: Application Database Context
 * Центральний хаб для роботи з PostgreSQL
 */
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ChatSession>(entity =>
        {
            entity.HasMany(c => c.Messages)
                .WithOne(m => m.ChatSession)
                .HasForeignKey(m => m.ChatSessionId)
                .OnDelete(DeleteBehavior.Cascade); // Наш підтверджений Cascade Delete
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            // entity.ToTable("Messages");
            
            // Налаштування для тексту (якщо потрібно обмежити довжину, але для чату краще text)
            entity.Property(m => m.Content).IsRequired();
            entity.Property(m => m.Role).IsRequired();
        });
    }
}