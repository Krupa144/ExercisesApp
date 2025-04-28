using Microsoft.AspNetCore.Mvc;
using ExercisesApp.Models;

namespace ExercisesApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExercisesController : ControllerBase
    {
        private static List<Exercise> exercises = new List<Exercise>();

        [HttpGet]
        public ActionResult<IEnumerable<Exercise>> GetAll()
        {
            return Ok(exercises);
        }

        [HttpGet("{id}")]
        public ActionResult<Exercise> GetById(int id)
        {
            var exercise = exercises.FirstOrDefault(e => e.Id == id);
            if (exercise == null)
                return NotFound();

            return Ok(exercise);
        }

        [HttpPost]
        public ActionResult<Exercise> Create(Exercise exercise)
        {
            exercise.Id = exercises.Count > 0 ? exercises.Max(e => e.Id) + 1 : 1;
            exercises.Add(exercise);
            return CreatedAtAction(nameof(GetById), new { id = exercise.Id }, exercise);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Exercise updatedExercise)
        {
            var exercise = exercises.FirstOrDefault(e => e.Id == id);
            if (exercise == null)
                return NotFound();

            exercise.Name = updatedExercise.Name;
            exercise.Category = updatedExercise.Category;
            exercise.Date = updatedExercise.Date;

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var exercise = exercises.FirstOrDefault(e => e.Id == id);
            if (exercise == null)
                return NotFound();

            exercises.Remove(exercise);
            return NoContent();
        }
    }
}
