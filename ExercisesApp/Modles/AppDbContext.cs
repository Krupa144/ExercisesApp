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
    }
}
