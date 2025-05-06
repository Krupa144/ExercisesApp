namespace ExercisesApp.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Barcode { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
