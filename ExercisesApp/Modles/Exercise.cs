using ExercisesApp.Models;
using System;

namespace ExercisesApp.Models
{
    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Category Category { get; set; }

        public int Reps { get; set; }

        public int Weight { get; set; } 

        public int Sets { get; set; }
        public DateTime Date { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
    }

    public enum Category
    {
        FullBody = 0,
        Push = 1,
        Pull = 2,
        Legs = 3
    }
}
