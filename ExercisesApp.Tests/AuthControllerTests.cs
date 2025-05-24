using ExercisesApp.Controllers;
using ExercisesApp.Dto;
using ExercisesApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http;

using IdentitySignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace ExercisesApp.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            var store = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            var contextAccessor = new Mock<IHttpContextAccessor>();
            var userPrincipalFactory = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();
            _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
                _userManagerMock.Object,
                contextAccessor.Object,
                userPrincipalFactory.Object,
                null, null, null, null);

            _configurationMock = new Mock<IConfiguration>();
            _configurationMock.Setup(c => c["Jwt:Key"]).Returns("ThisIsASecretKeyForJwtTest1234!");
            _configurationMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            _configurationMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

            _controller = new AuthController(_userManagerMock.Object, _signInManagerMock.Object, _configurationMock.Object);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenUserNotFound()
        {
            var dto = new LoginDto { Email = "user@test.com", Password = "password" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser)null);
            var result = await _controller.Login(dto);
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorized.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIncorrect()
        {
            var user = new ApplicationUser { Id = "1", UserName = "user@test.com", Email = "user@test.com" };
            var dto = new LoginDto { Email = "user@test.com", Password = "wrongpass" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(user);
            _signInManagerMock.Setup(x => x.PasswordSignInAsync(user, dto.Password, false, false))
                .ReturnsAsync(IdentitySignInResult.Failed);

            var result = await _controller.Login(dto);
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorized.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenSuccessful()
        {
            var user = new ApplicationUser { Id = "1", UserName = "user@test.com", Email = "user@test.com" };
            var dto = new LoginDto { Email = "user@test.com", Password = "password" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(user);
            _signInManagerMock.Setup(x => x.PasswordSignInAsync(user, dto.Password, false, false))
                .ReturnsAsync(IdentitySignInResult.Success);

            var result = await _controller.Login(dto);
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(((dynamic)ok.Value).token);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenUserExists()
        {
            var dto = new RegisterDto { Email = "existing@test.com", Password = "password", FirstName = "Test" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync(new ApplicationUser { Email = dto.Email });
            var result = await _controller.Register(dto);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenCreationFails()
        {
            var dto = new RegisterDto { Email = "user@test.com", Password = "123", FirstName = "Test" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser)null);
            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Weak password" }));
            var result = await _controller.Register(dto);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenSuccessful()
        {
            var dto = new RegisterDto { Email = "new@test.com", Password = "StrongPass123!", FirstName = "Test" };
            _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser)null);
            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password)).ReturnsAsync(IdentityResult.Success);
            _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), "User")).ReturnsAsync(IdentityResult.Success);
            var result = await _controller.Register(dto);
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(((dynamic)ok.Value).token);
        }

        [Fact]
        public void Test_ReturnsOkMessage()
        {
            var result = _controller.Test();
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("API is working!", ((dynamic)ok.Value).message);
        }
    }
}
