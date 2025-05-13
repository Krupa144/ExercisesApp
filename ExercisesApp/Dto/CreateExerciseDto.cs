using ExercisesApp.Models;

namespace ExercisesApp.Dto
{
    public class CreateExerciseDto
    {
        public string Name { get; set; }
        public Category Category { get; set; }
        public int Reps { get; set; }
        public int Weight { get; set; }
        public int Sets { get; set; }
        public DateTime Date { get; set; }
    }
}
