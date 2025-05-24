using ExercisesApp.Controllers;
using ExercisesApp.Data;
using ExercisesApp.Models;
using ExercisesApp.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

public class FoodApiControllerTests
{
    private FoodApiController GetController(AppDbContext context, string userId = "test-user")
    {
        var factoryMock = new Mock<IHttpClientFactory>();
        var httpClient = new HttpClient();
        factoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var loggerMock = new Mock<ILogger<FoodApiController>>();

        var controller = new FoodApiController(context, factoryMock.Object, loggerMock.Object);

        if (!string.IsNullOrEmpty(userId))
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        return controller;
    }

    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateFood_Should_Add_Entry_To_Database()
    {
        var context = GetInMemoryDbContext();
        var controller = GetController(context);

        var dto = new FoodCreateDto
        {
            Name = "Test Food",
            Calories = 100,
            ConsumedAt = DateTime.UtcNow
        };

        var result = await controller.CreateFood(dto);

        Assert.IsType<CreatedAtActionResult>(result);
        Assert.Single(context.Foods);
    }

    [Fact]
    public async Task GetFoodByDate_Returns_List_Of_Foods_For_User()
    {
        var context = GetInMemoryDbContext();
        var userId = "test-user";
        context.Foods.Add(new Food
        {
            Name = "Apple",
            Calories = 80,
            ConsumedAt = DateTime.Today,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        });
        context.Foods.Add(new Food
        {
            Name = "Banana",
            Calories = 90,
            ConsumedAt = DateTime.Today,
            CreatedAt = DateTime.UtcNow,
            UserId = "other-user"
        });
        await context.SaveChangesAsync();

        var controller = GetController(context, userId);

        var result = await controller.GetFoodByDate() as OkObjectResult;
        var foods = result?.Value as System.Collections.IEnumerable;

        Assert.NotNull(result);
        Assert.Single(foods);
    }

    [Fact]
    public async Task GetFoodById_Returns_Valid_Food()
    {
        var context = GetInMemoryDbContext();
        var food = new Food
        {
            Id = 1,
            Name = "Orange",
            Calories = 70,
            ConsumedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UserId = "test-user"
        };
        context.Foods.Add(food);
        await context.SaveChangesAsync();

        var controller = GetController(context, "test-user");

        var result = await controller.GetFoodById(food.Id) as OkObjectResult;
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateFood_Returns_Forbidden_For_Wrong_User()
    {
        var context = GetInMemoryDbContext();
        var food = new Food
        {
            Id = 1,
            Name = "Bread",
            Calories = 120,
            ConsumedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UserId = "original-user"
        };
        context.Foods.Add(food);
        await context.SaveChangesAsync();

        var controller = GetController(context, "another-user");

        var updateDto = new FoodUpdateDto
        {
            Id = food.Id,
            Name = "Updated Bread",
            Calories = 130,
            ConsumedAt = DateTime.UtcNow
        };

        var result = await controller.UpdateFood(food.Id, updateDto);
        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task DeleteFood_Removes_Item()
    {
        var context = GetInMemoryDbContext();
        var food = new Food
        {
            Id = 1,
            Name = "Cheese",
            Calories = 110,
            ConsumedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UserId = "test-user"
        };
        context.Foods.Add(food);
        await context.SaveChangesAsync();

        var controller = GetController(context, "test-user");

        var result = await controller.DeleteFood(food.Id);
        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Foods);
    }

    [Fact]
    public async Task AnyFoodExists_Returns_True_When_Data_Present()
    {
        var context = GetInMemoryDbContext();
        context.Foods.Add(new Food
        {
            Id = 1,
            Name = "Egg",
            Calories = 90,
            ConsumedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UserId = "test-user"
        });
        await context.SaveChangesAsync();

        var controller = GetController(context);

        var result = await controller.AnyFoodExists() as OkObjectResult;
        Assert.True((bool)result.Value);
    }
}
