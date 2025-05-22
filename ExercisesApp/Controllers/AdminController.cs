using ExercisesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExercisesApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] RoleAssignmentModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return NotFound("User not found");

            if (!await _roleManager.RoleExistsAsync(model.Role))
                return BadRequest("Role does not exist");

            var result = await _userManager.AddToRoleAsync(user, model.Role);
            if (result.Succeeded)
                return Ok($"Role '{model.Role}' assigned to user '{user.Email}'");

            return BadRequest(result.Errors);
        }
    }

    public class RoleAssignmentModel
    {
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
