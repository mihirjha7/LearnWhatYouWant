using Infrastructure.DTO;
using LMS.API.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            var result = await _authService.LoginAsync(loginRequest);

            return result.IsSuccess
                ? Ok(new { result.Value.AccessToken })
                : result.ToActionResult(this);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerRequest)
        {
            var result = await _authService.RegisterStudentAsync(registerRequest);

            return result.IsSuccess
                ? Ok(new { result.Value.AccessToken })
                : result.ToActionResult(this);
        }

        [AllowAnonymous]
        [HttpPost("register/instructor")]
        public async Task<IActionResult> Register([FromBody] RegisterInstructorDto registerInstructorDto)
        {
            var result = await _authService.RegisterInstructorAsync(registerInstructorDto);

            return result.IsSuccess
                ? Ok(new { result.Value.AccessToken })
                : result.ToActionResult(this);
        }

        [AllowAnonymous]
        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Email is required.");
            }

            var result = await _authService.RequestPasswordResetAsync(email);

            return result.IsSuccess
                ? Ok(new { message = "If the account exists, a reset link has been sent." })
                : result.ToActionResult(this);
        }

        [HttpPost("resetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> Reset([FromBody] PasswordChangeDto data)
        {
            var result = await _authService.ResetPasswordAsync(data.token, data.password);

            return result.IsSuccess
                ? Ok(new { message = "Password updated." })
                : result.ToActionResult(this);
        }
    }
}
