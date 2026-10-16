using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IEnrollmentService
    {
        Task<Result> EnrollAsync(int courseId, int userId);

        Task<Result<bool>> IsEnrolledAsync(int courseId, int userId);

        Task<Result<IReadOnlyList<CourseDto>>> GetEnrolledCoursesAsync(int userId);
    }
}
