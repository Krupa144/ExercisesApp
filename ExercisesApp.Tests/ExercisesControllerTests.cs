using ExercisesApp.Controllers;
using ExercisesApp.Data;
using ExercisesApp.Dto;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

public class ExercisesControllerTests
{
    private ExercisesController GetControllerWithContext(AppDbContext context, string userId = "test-user-id")
    {
        var controller = new ExercisesController(context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        }, "mock"));
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
        return controller;
    }

    [Fact]
    public async Task CreateExercise_ReturnsCreatedExercise()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "CreateExerciseDb")
            .Options;

        using var context = new AppDbContext(options);
        var controller = GetControllerWithContext(context);

        var dto = new CreateExerciseDto
        {
            Name = "Push-up",
            Category = Category.Push,
            Sets = 3,
            Reps = 12,
            Weight = 0,
            Date = DateTime.Today
        };

        var result = await controller.CreateExercise(dto);
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var exercise = Assert.IsType<Exercise>(createdResult.Value);
        Assert.Equal("Push-up", exercise.Name);
    }
}
