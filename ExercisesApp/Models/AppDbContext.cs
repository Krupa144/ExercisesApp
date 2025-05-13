using Microsoft.EntityFrameworkCore;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace ExercisesApp.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<Food> Foods { get; set; }
        public DbSet<Product> Products { get; set; } 


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Exercise>()
                .HasOne(e => e.User)
                .WithMany() 
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Food>().ToTable("Foods", t => t.ExcludeFromMigrations());
            modelBuilder.Entity<Food>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.Property(f => f.Name)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(f => f.Calories)
                      .IsRequired();

                entity.Property(f => f.ConsumedAt)
                      .IsRequired();

                entity.Property(f => f.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(f => f.Barcode)
                      .HasMaxLength(50);

                entity.Property(f => f.Brand)
                      .HasMaxLength(100);
            });
        }
    }
}
