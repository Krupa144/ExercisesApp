using ExercisesApp.Data;
using ExercisesApp.Dto;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ExercisesApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodApiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly ILogger<FoodApiController> _logger;

        public FoodApiController(AppDbContext context, IHttpClientFactory httpClientFactory, ILogger<FoodApiController> logger)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            _logger = logger;
        }

        [Authorize]
        [HttpGet("by-date")]
        public async Task<IActionResult> GetFoodByDate(DateTime? date = null, string sortOrder = "desc")
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return Unauthorized();

                var filterDate = date ?? DateTime.Today;
                var dayStart = filterDate.Date;
                var dayEnd = dayStart.AddDays(1).AddMilliseconds(-1);

                var query = _context.Foods
                    .Where(f => f.UserId == userId &&
                                f.ConsumedAt.HasValue &&
                                f.ConsumedAt.Value.Date == dayStart.Date);

                query = sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(f => f.ConsumedAt)
                    : query.OrderBy(f => f.ConsumedAt);

                var list = await query.Select(f => new FoodDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Barcode = f.Barcode,
                    Brand = f.Brand,
                    Calories = f.Calories,
                    Protein = f.Protein,
                    Carbs = f.Carbs,
                    Fats = f.Fats,
                    Sugars = f.Sugars,
                    SaturatedFat = f.SaturatedFat,
                    Salt = f.Salt,

                    ConsumedAt = f.ConsumedAt,

                    CreatedAt = f.CreatedAt
                }).ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching food data");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpGet("all-products")]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return Unauthorized();

                var products = await _context.Products
                    .Where(p => p.UserId == userId)
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching products");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodById(int id)
        {
            try
            {
                var food = await _context.Foods
                    .Where(f => f.Id == id)
                    .Select(f => new FoodDto
                    {
                        Id = f.Id,
                        Name = f.Name,
                        Barcode = f.Barcode,
                        Brand = f.Brand,
                        Calories = f.Calories,
                        Protein = f.Protein,
                        Carbs = f.Carbs,
                        Fats = f.Fats,
                        Sugars = f.Sugars,
                        SaturatedFat = f.SaturatedFat,
                        Salt = f.Salt,
                        ConsumedAt = f.ConsumedAt,
                        CreatedAt = f.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (food == null) return NotFound();
                return Ok(food);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching food data by ID");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateFood([FromBody] FoodCreateDto foodDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return Unauthorized();

                var now = DateTime.UtcNow;
                var food = new Food
                {
                    Name = foodDto.Name,
                    Barcode = foodDto.Barcode,
                    Brand = foodDto.Brand,
                    Calories = foodDto.Calories,
                    Protein = foodDto.Protein,
                    Carbs = foodDto.Carbs,
                    Fats = foodDto.Fats,
                    Sugars = foodDto.Sugars,
                    SaturatedFat = foodDto.SaturatedFat,
                    Salt = foodDto.Salt,
                    ConsumedAt = foodDto.ConsumedAt ?? DateTime.UtcNow, 
                    CreatedAt = now,
                    UserId = userId
                };


                _context.Foods.Add(food);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetFoodById), new { id = food.Id }, food);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating food item");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(int id, [FromBody] FoodUpdateDto foodDto)
        {
            if (id != foodDto.Id) return BadRequest("ID mismatch");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var food = await _context.Foods.FindAsync(id);
                if (food == null) return NotFound();

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (food.UserId != userId) return Forbid();

                food.Name = foodDto.Name;
                food.Barcode = foodDto.Barcode;
                food.Brand = foodDto.Brand;
                food.Calories = foodDto.Calories;
                food.Protein = foodDto.Protein;
                food.Carbs = foodDto.Carbs;
                food.Fats = foodDto.Fats;
                food.Sugars = foodDto.Sugars;
                food.SaturatedFat = foodDto.SaturatedFat;
                food.Salt = foodDto.Salt;
                food.ConsumedAt = foodDto.ConsumedAt; 

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating food item");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            try
            {
                var food = await _context.Foods.FindAsync(id);
                if (food == null) return NotFound();

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (food.UserId != userId) return Forbid();

                _context.Foods.Remove(food);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while deleting food item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("barcode/{barcode}")]
        public async Task<IActionResult> GetFoodInfo(string barcode)
        {
            try
            {
                barcode = Regex.Replace(barcode ?? "", @"[^\d]", "");
                if (barcode.Length < 8)
                    return BadRequest("Barcode must be at least 8 digits");

                var local = await _context.Foods
                    .Where(f => f.Barcode == barcode)
                    .Select(f => new FoodInfoDto
                    {
                        Name = f.Name,
                        Barcode = f.Barcode,
                        Brand = f.Brand,
                        Calories = f.Calories ?? 0,
                        Protein = f.Protein ?? 0,
                        Carbs = f.Carbs ?? 0,
                        Fats = f.Fats ?? 0,
                        Sugars = f.Sugars ?? 0,
                        SaturatedFat = f.SaturatedFat ?? 0,
                        Salt = f.Salt ?? 0
                    })
                    .FirstOrDefaultAsync();

                if (local != null)
                    return Ok(new { source = "local_database", data = local });

                var apiUrl = $"https://world.openfoodfacts.org/api/v2/product/{barcode}.json";
                var response = await _httpClient.GetAsync(apiUrl);
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "API error");

                var content = await response.Content.ReadAsStringAsync();
                dynamic apiData = JsonConvert.DeserializeObject(content);

                if (apiData?.status != 1)
                    return NotFound("Product not found");

                var nutriments = apiData.product?.nutriments;

                var product = new FoodInfoDto
                {
                    Name = apiData.product?.product_name ?? null,
                    Barcode = barcode,
                    Brand = apiData.product?.brands ?? apiData.product?.brand_owner ?? null,
                    Calories = nutriments.energy_kcal != null ? (int)nutriments.energy_kcal : 0,
                    Protein = (float?)nutriments?.proteins_100g,
                    Carbs = (float?)nutriments?.carbohydrates_100g,
                    Fats = (float?)nutriments?.fat_100g,
                    Sugars = (float?)nutriments?.sugars_100g,
                    SaturatedFat = (float?)nutriments?.saturated_fat_100g,
                    Salt = (float?)(nutriments?.salt_100g ?? (nutriments?.sodium_100g * 2.5f))
                };

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId != null)
                {
                    var newFood = new Food
                    {
                        Name = product.Name,
                        Barcode = product.Barcode,
                        Brand = product.Brand,
                        Calories = product.Calories,
                        Protein = product.Protein,
                        Carbs = product.Carbs,
                        Fats = product.Fats,
                        Sugars = product.Sugars,
                        SaturatedFat = product.SaturatedFat,
                        Salt = product.Salt,
                        CreatedAt = DateTime.UtcNow,
                        UserId = userId,
                        ConsumedAt = DateTime.UtcNow
                    };

                    _context.Foods.Add(newFood);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { source = "open_food_facts", data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching food info from barcode");
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpGet("any")]
        public async Task<IActionResult> AnyFoodExists()
        {
            var exists = await _context.Foods.AnyAsync();
            return Ok(exists);
        }
    }
}