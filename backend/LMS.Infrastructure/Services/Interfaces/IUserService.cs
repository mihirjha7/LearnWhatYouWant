using LMS.Domain.Enums;
using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IUserService
    {
        Task<Result<UserProfileDto>> GetProfileAsync(int userId);

        Task<Result> UpdateProfileAsync(int userId, UserUpdateProfileBioDto request);

        Task<Result> DeleteOwnAccountAsync(int userId);

        Task<Result> UpdateProfilePictureAsync(int userId, string fileName);

        Task<Result<IReadOnlyList<UserEnrolledCourse>>> GetEnrolledCoursesAsync(int userId);

        Task<Result<IReadOnlyList<UserProfileDto>>> GetAllUsersAsync();

        Task<Result<IReadOnlyList<UserProfileDto>>> GetUsersByRoleAsync(UserRole role);

        Task<Result> CreateUserAsync(CreateUserDto request);

        Task<Result> UpdateUserStatusAsync(string email, bool isActive);

        Task<Result> DeleteUserAsync(string email);

        Task<Result<InstructorDto>> GetInstructorStatisticsAsync(int instructorId);

        Task<Result<IReadOnlyList<InstructorCoursesDto>>> GetInstructorCoursesAsync(int instructorId);

        Task<Result<StudentDashboardSummaryDto>> GetStudentDashboardSummaryAsync(int userId);
    }
}
