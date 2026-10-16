using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IAuthService
    {
        Task<Result<LoginResponseModelDto>> LoginAsync(LoginDto request);

        Task<Result<LoginResponseModelDto>> RegisterStudentAsync(RegisterDto request);

        Task<Result<LoginResponseModelDto>> RegisterInstructorAsync(RegisterInstructorDto request);

        Task<Result> RequestPasswordResetAsync(string email);

        Task<Result> ResetPasswordAsync(string token, string newPassword);
    }
}
