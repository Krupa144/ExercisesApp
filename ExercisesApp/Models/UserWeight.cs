using System;

namespace ExercisesApp.Models
{
    public class UserWeight
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public double Weight { get; set; }
        public DateTime RecordedAt { get; set; }
    }
}
