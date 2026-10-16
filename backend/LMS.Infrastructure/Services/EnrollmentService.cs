using LMS.Domain;
using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Services
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly LmsDbContext _dbContext;

        public EnrollmentService(LmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result> EnrollAsync(int courseId, int userId)
        {
            var userExists = await _dbContext.Users.AnyAsync(u => u.UserID == userId);
            if (!userExists)
            {
                return Result.Failure(Error.NotFound("Enrollment.UserNotFound", "The user was not found."));
            }

            var course = await _dbContext.Courses.FirstOrDefaultAsync(c => c.CourseID == courseId);
            if (course is null)
            {
                return Result.Failure(Error.NotFound("Enrollment.CourseNotFound", "The course was not found."));
            }

            if (!course.Published)
            {
                return Result.Failure(Error.Validation(
                    "Enrollment.CourseNotPublished",
                    "The course is not open for enrollment."));
            }

            var alreadyEnrolled = await _dbContext.Enrollments
                .AnyAsync(e => e.UserID == userId && e.CourseID == courseId);

            if (alreadyEnrolled)
            {
                return Result.Failure(Error.Conflict(
                    "Enrollment.AlreadyEnrolled",
                    "The user is already enrolled in this course."));
            }

            _dbContext.Enrollments.Add(new Domain.Models.Enrollment
            {
                UserID = userId,
                CourseID = courseId,
                EnrollmentDate = DateTime.UtcNow,
                CompletionStatus = "InProgress"
            });

            await _dbContext.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<bool>> IsEnrolledAsync(int courseId, int userId)
        {
            var isEnrolled = await _dbContext.Enrollments
                .AnyAsync(e => e.UserID == userId && e.CourseID == courseId);

            return Result.Success(isEnrolled);
        }

        public async Task<Result<IReadOnlyList<CourseDto>>> GetEnrolledCoursesAsync(int userId)
        {
            var courses = await _dbContext.Enrollments
                .AsNoTracking()
                .Where(e => e.UserID == userId)
                .Select(e => new CourseDto
                {
                    CourseID = e.Course.CourseID,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    Syllabus = e.Course.Syllabus,
                    Level = e.Course.Level,
                    Language = e.Course.Language,
                    Duration = e.Course.Duration,
                    ThumbnailURL = e.Course.ThumbnailURL,
                    CategoryID = e.Course.CategoryID,
                    CourseMaterialUrl = e.Course.CourseMaterialUrl,
                    CourseMaterialFileName = e.Course.CourseMaterialFileName,
                    Published = e.Course.Published,
                    Rating = e.Course.Rating,
                    ReviewCount = e.Course.ReviewCount
                })
                .ToListAsync();

            return Result.Success<IReadOnlyList<CourseDto>>(courses);
        }
    }
}
