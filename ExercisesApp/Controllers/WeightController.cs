using ExercisesApp.Data;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WeightController : ControllerBase
{
    private readonly AppDbContext _context;

    public WeightController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddWeight([FromBody] double weight)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            if (weight <= 0 || weight > 500)
                return BadRequest("Invalid weight value.");

            var userWeight = new UserWeight
            {
                UserId = userId,
                Weight = weight,
                RecordedAt = DateTime.UtcNow
            };

            _context.UserWeights.Add(userWeight);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Weight has been saved." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Server error: " + ex.Message);
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetWeightHistory()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var weights = await _context.UserWeights
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.RecordedAt)
                .ToListAsync();

            return Ok(weights);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Server error: " + ex.Message);
        }
    }
}
