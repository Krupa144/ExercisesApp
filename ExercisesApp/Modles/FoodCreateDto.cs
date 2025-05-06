using System.ComponentModel.DataAnnotations;

namespace ExercisesApp.Models
{
    public class FoodCreateDto
    {
        [Required]
        public string? Name { get; set; }

        [Required]
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
    }
}