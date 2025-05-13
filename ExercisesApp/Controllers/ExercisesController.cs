using ExercisesApp.Data;
using ExercisesApp.Dto;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExercisesApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExercisesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExercisesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Exercise>>> GetExercises()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var exercises = await _context.Exercises
                .Where(e => e.UserId == userId)
                .ToListAsync();

            return Ok(exercises);
        }


        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Exercise>> GetExerciseById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (exercise == null)
                return NotFound();

            return Ok(exercise);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Exercise>> CreateExercise(CreateExerciseDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie można ustalić tożsamości użytkownika.");
            }

            var exercise = new Exercise
            {
                Name = dto.Name,
                Category = dto.Category,
                Reps = dto.Reps,
                Weight = dto.Weight,
                Sets = dto.Sets,
                Date = dto.Date,
                UserId = userId
            };

            _context.Exercises.Add(exercise);
             await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExerciseById), new { id = exercise.Id }, exercise);
        }


        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateExercise(int id, Exercise updatedExercise)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (id != updatedExercise.Id)
                return BadRequest("ID ćwiczenia nie zgadza się.");

            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (exercise == null)
                return NotFound("Ćwiczenie nie znalezione.");

            exercise.Name = updatedExercise.Name;
            exercise.Sets = updatedExercise.Sets;
            exercise.Reps = updatedExercise.Reps;
            exercise.Weight = updatedExercise.Weight;
            exercise.Category = updatedExercise.Category;
            exercise.Date = updatedExercise.Date;

            if (string.IsNullOrEmpty(exercise.UserId))
            {
                exercise.UserId = userId;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteExercise(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine($"Próba usunięcia ćwiczenia o ID: {id} przez użytkownika: {userId}");

            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (exercise == null)
                return NotFound();

            _context.Exercises.Remove(exercise);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("DailyPlan")]
        [Authorize]
        public IActionResult DailyPlan()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Brak tokenu JWT lub token jest nieprawidłowy.");
            }

            var today = DateTime.Today.DayOfWeek;
            Category plannedCategory;
            switch (today)
            {
                case DayOfWeek.Monday:
                    plannedCategory = Category.FullBody;
                    break;
                case DayOfWeek.Tuesday:
                    plannedCategory = Category.Push;
                    break;
                case DayOfWeek.Wednesday:
                    plannedCategory = Category.Pull;
                    break;
                case DayOfWeek.Thursday:
                    plannedCategory = Category.Legs;
                    break;
                case DayOfWeek.Friday:
                    plannedCategory = Category.FullBody;
                    break;
                default:
                    return BadRequest("Brak planu treningowego na weekend.");
            }

            var exercises = _context.Exercises
                .Where(e => e.UserId == userId && e.Category == plannedCategory)
                .Select(e => new
                {
                    e.Name,
                    e.Sets,
                    e.Reps,
                    e.Weight
                })
                .ToList();

            return Ok(exercises);
        }



    }

}
