namespace ExercisesApp.Models
{
    public class Food
    {
        public int Id { get; set; }

        public string? Name { get; set; }
        public string? Barcode { get; set; }
        public string? Brand { get; set; }

        public int? Calories { get; set; }
        public float? Protein { get; set; }
        public float? Carbs { get; set; }
        public float? Fats { get; set; }
        public float? Sugars { get; set; }
        public float? SaturatedFat { get; set; }
        public float? Salt { get; set; }

        public DateTime? ConsumedAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? UserId { get; set; }
    }
}