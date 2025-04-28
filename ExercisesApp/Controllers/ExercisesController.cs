using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExercisesApp.Data;
using ExercisesApp.Models;

namespace ExercisesApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ExercisesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExercisesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Exercise>>> GetExercises()
        {
            var exercises = await _context.Exercises.ToListAsync();
            return Ok(exercises);
        }

        [HttpPost]
        public async Task<ActionResult<Exercise>> CreateExercise(Exercise exercise)
        {
            if (exercise.Name == null || exercise.Category < 0 || exercise.Date == null)
            {
                return BadRequest("Brak wymaganych danych.");
            }

            _context.Exercises.Add(exercise);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExerciseById), new { id = exercise.Id }, exercise);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Exercise>> GetExerciseById(int id)
        {
            var exercise = await _context.Exercises.FindAsync(id);

            if (exercise == null)
            {
                return NotFound();
            }

            return Ok(exercise);
        }
    }
}
