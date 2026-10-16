using LMS.Domain;
using LMS.Domain.Enums;
using LMS.Domain.Models;
using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LMS.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private static readonly TimeSpan ResetTokenLifetime = TimeSpan.FromMinutes(10);

        private readonly LmsDbContext _dbContext;
        private readonly PasswordHashing _passwordHashing;
        private readonly JwtService _jwtService;
        private readonly IEmailSenderRepository _emailSender;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            LmsDbContext dbContext,
            PasswordHashing passwordHashing,
            JwtService jwtService,
            IEmailSenderRepository emailSender,
            ILogger<AuthService> logger)
        {
            _dbContext = dbContext;
            _passwordHashing = passwordHashing;
            _jwtService = jwtService;
            _emailSender = emailSender;
            _logger = logger;
        }

        public async Task<Result<LoginResponseModelDto>> LoginAsync(LoginDto request)
        {
            var response = await _jwtService.Authenticate(request);

            return response is null
                ? Result.Failure<LoginResponseModelDto>(
                    Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password."))
                : Result.Success(response);
        }

        public Task<Result<LoginResponseModelDto>> RegisterStudentAsync(RegisterDto request) =>
            RegisterAsync(request.Name, request.Email, request.Password, UserRole.Student);

        public Task<Result<LoginResponseModelDto>> RegisterInstructorAsync(RegisterInstructorDto request) =>
            RegisterAsync(request.Name, request.Email, request.Password, UserRole.Instructor);

        private async Task<Result<LoginResponseModelDto>> RegisterAsync(
            string name,
            string email,
            string password,
            UserRole role)
        {
            var normalizedEmail = email.Trim();

            var emailTaken = await _dbContext.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == normalizedEmail);

            if (emailTaken)
            {
                return Result.Failure<LoginResponseModelDto>(
                    Error.Conflict("Auth.EmailAlreadyRegistered", "An account with this email already exists."));
            }

            _dbContext.Users.Add(new User
            {
                Name = name,
                Email = normalizedEmail,
                PasswordHash = _passwordHashing.HashPassword(password),
                Role = role,
                IsActive = true
            });

            await _dbContext.SaveChangesAsync();

            return await LoginAsync(new LoginDto { Email = normalizedEmail, Password = password });
        }

        public async Task<Result> RequestPasswordResetAsync(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

            // Always report success so the endpoint cannot be used to enumerate accounts.
            if (user is null || !user.IsActive)
            {
                return Result.Success();
            }

            user.ResetToken = Guid.NewGuid().ToString("N");
            user.ResetTokenExpiry = DateTime.UtcNow.Add(ResetTokenLifetime);
            await _dbContext.SaveChangesAsync();

            try
            {
                await _emailSender.SendResetLinkAsync(user.Email, user.ResetToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to send the password reset email.");
            }

            return Result.Success();
        }

        public async Task<Result> ResetPasswordAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return Result.Failure(Error.Validation("Auth.InvalidResetToken", "The reset token is invalid."));
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.ResetToken == token);

            if (user is null || user.ResetTokenExpiry is null || user.ResetTokenExpiry < DateTime.UtcNow)
            {
                return Result.Failure(Error.Validation(
                    "Auth.InvalidResetToken",
                    "The reset token is invalid or has expired."));
            }

            user.PasswordHash = _passwordHashing.HashPassword(newPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }
    }
}
