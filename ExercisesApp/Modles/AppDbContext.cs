using Microsoft.EntityFrameworkCore;
using ExercisesApp.Models;

namespace ExercisesApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Exercise> Exercises { get; set; }
    }
}
