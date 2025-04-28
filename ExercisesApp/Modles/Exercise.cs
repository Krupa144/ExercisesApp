namespace ExercisesApp.Models
{
    public enum Category
    {
        FullBody,
        Push,
        Pull,
        Legs
    }

    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Category Category { get; set; }
        public DateTime Date { get; set; }
    }
}
