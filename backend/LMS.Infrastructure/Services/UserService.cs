using LMS.Domain;
using LMS.Domain.Enums;
using LMS.Domain.Models;
using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly LmsDbContext _dbContext;
        private readonly PasswordHashing _passwordHashing;

        public UserService(LmsDbContext dbContext, PasswordHashing passwordHashing)
        {
            _dbContext = dbContext;
            _passwordHashing = passwordHashing;
        }

        private static UserProfileDto ToProfile(User user) => new()
        {
            UserId = user.UserID,
            Name = user.Name,
            Email = user.Email,
            Bio = user.Bio,
            ProfilePicture = user.ProfilePicture,
            Role = (int)user.Role,
            LastLogin = user.LastLogin,
            UpdatedAt = user.UpdatedAt,
            IsActive = user.IsActive,
            IsDeleted = user.IsDeleted
        };

        private static Error UserNotFound() =>
            Error.NotFound("User.NotFound", "The user was not found.");

        public async Task<Result<UserProfileDto>> GetProfileAsync(int userId)
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserID == userId);

            return user is null
                ? Result.Failure<UserProfileDto>(UserNotFound())
                : Result.Success(ToProfile(user));
        }

        public async Task<Result> UpdateProfileAsync(int userId, UserUpdateProfileBioDto request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user is null)
            {
                return Result.Failure(UserNotFound());
            }

            user.Name = request.Name;
            user.Bio = request.Bio;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> DeleteOwnAccountAsync(int userId)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user is null)
            {
                return Result.Failure(UserNotFound());
            }

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> UpdateProfilePictureAsync(int userId, string fileName)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user is null)
            {
                return Result.Failure(UserNotFound());
            }

            user.ProfilePicture = fileName;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<IReadOnlyList<UserEnrolledCourse>>> GetEnrolledCoursesAsync(int userId)
        {
            var courses = await _dbContext.Enrollments
                .AsNoTracking()
                .Where(e => e.UserID == userId)
                .Select(e => new UserEnrolledCourse
                {
                    CourseID = e.Course.CourseID,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    Level = e.Course.Level,
                    Language = e.Course.Language,
                    Duration = e.Course.Duration,
                    ThumbnailURL = e.Course.ThumbnailURL,
                    EnrollmentDate = e.EnrollmentDate,
                    CompletionStatus = e.CompletionStatus
                })
                .ToListAsync();

            return Result.Success<IReadOnlyList<UserEnrolledCourse>>(courses);
        }

        public async Task<Result<IReadOnlyList<UserProfileDto>>> GetAllUsersAsync()
        {
            var users = await _dbContext.Users
                .AsNoTracking()
                .ToListAsync();

            return Result.Success<IReadOnlyList<UserProfileDto>>(users.Select(ToProfile).ToList());
        }

        public async Task<Result<IReadOnlyList<UserProfileDto>>> GetUsersByRoleAsync(UserRole role)
        {
            var users = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Role == role)
                .ToListAsync();

            return Result.Success<IReadOnlyList<UserProfileDto>>(users.Select(ToProfile).ToList());
        }

        public async Task<Result> CreateUserAsync(CreateUserDto request)
        {
            var emailTaken = await _dbContext.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == request.Email);

            if (emailTaken)
            {
                return Result.Failure(Error.Conflict("User.EmailAlreadyRegistered", "Email already in use."));
            }

            _dbContext.Users.Add(new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = _passwordHashing.HashPassword(request.Password),
                Role = UserRole.Student,
                IsActive = true
            });

            await _dbContext.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> UpdateUserStatusAsync(string email, bool isActive)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                return Result.Failure(UserNotFound());
            }

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> DeleteUserAsync(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                return Result.Failure(UserNotFound());
            }

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<InstructorDto>> GetInstructorStatisticsAsync(int instructorId)
        {
            var courseIds = await _dbContext.CourseInstructors
                .AsNoTracking()
                .Where(ci => ci.UserID == instructorId)
                .Select(ci => ci.CourseID)
                .ToListAsync();

            if (courseIds.Count == 0)
            {
                return Result.Success(new InstructorDto { TotalStudents = 0, TotalCourses = 0, TotalVideos = 0 });
            }

            var totalStudents = await _dbContext.Enrollments
                .AsNoTracking()
                .Where(e => courseIds.Contains(e.CourseID))
                .Select(e => e.UserID)
                .Distinct()
                .CountAsync();

            var totalVideos = await _dbContext.Lessons
                .AsNoTracking()
                .Where(l => courseIds.Contains(l.CourseID) && l.VideoURL != null && l.VideoURL != "")
                .CountAsync();

            return Result.Success(new InstructorDto
            {
                TotalStudents = totalStudents,
                TotalCourses = courseIds.Count,
                TotalVideos = totalVideos
            });
        }

        public async Task<Result<IReadOnlyList<InstructorCoursesDto>>> GetInstructorCoursesAsync(int instructorId)
        {
            var instructorCourseIds = _dbContext.CourseInstructors
                .Where(ci => ci.UserID == instructorId)
                .Select(ci => ci.CourseID);

            var courses = await _dbContext.Courses
                .AsNoTracking()
                .Where(c => instructorCourseIds.Contains(c.CourseID))
                .Select(c => new InstructorCoursesDto
                {
                    CourseID = c.CourseID,
                    Title = c.Title,
                    Published = c.Published,
                    TotalLessons = c.Lessons.Count(),
                    TotalEstimatedTimeInMinutes = c.Duration,
                    CourseCategory = c.Category != null ? c.Category.Name : "Uncategorized"
                })
                .ToListAsync();

            return Result.Success<IReadOnlyList<InstructorCoursesDto>>(courses);
        }

        public async Task<Result<StudentDashboardSummaryDto>> GetStudentDashboardSummaryAsync(int userId)
        {
            var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(u => u.UserID == userId);
            if (!userExists)
            {
                return Result.Failure<StudentDashboardSummaryDto>(UserNotFound());
            }

            var enrolledCoursesCount = await _dbContext.Enrollments
                .AsNoTracking()
                .CountAsync(e => e.UserID == userId);

            var completedCoursesCount = await _dbContext.Enrollments
                .AsNoTracking()
                .CountAsync(e => e.UserID == userId && e.CompletionStatus == "Completed");

            var uniqueQuizzesAttempted = await _dbContext.QuizScores
                .AsNoTracking()
                .Where(qs => qs.UserID == userId)
                .Select(qs => qs.QuizID)
                .Distinct()
                .CountAsync();

            var courseAverageScores = await _dbContext.QuizScores
                .AsNoTracking()
                .Where(qs => qs.UserID == userId)
                .GroupBy(qs => new { qs.QuizID, qs.Quiz.CourseID })
                .Select(g => new { g.Key.CourseID, HighestScore = g.Max(qs => qs.Score) })
                .GroupBy(a => a.CourseID)
                .Select(g => new CourseAverageScoreDto
                {
                    CourseName = _dbContext.Courses
                        .Where(c => c.CourseID == g.Key)
                        .Select(c => c.Title)
                        .FirstOrDefault() ?? "Unknown Course",
                    AverageScore = (int?)Math.Round(g.Average(a => a.HighestScore))
                })
                .ToListAsync();

            const int topInstructorCount = 5;
            var topInstructors = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Role == UserRole.Instructor)
                .Select(u => new TopInstructorDto
                {
                    InstructorID = u.UserID,
                    Name = u.Name,
                    ProfilePicture = u.ProfilePicture,
                    OverallRating = u.CourseInstructors
                        .Select(ci => ci.Course)
                        .Where(c => c.Rating.HasValue)
                        .Average(c => c.Rating),
                    TotalStudents = u.CourseInstructors
                        .SelectMany(ci => ci.Course.Enrollments)
                        .Select(e => e.UserID)
                        .Distinct()
                        .Count()
                })
                .OrderByDescending(dto => dto.TotalStudents)
                .ThenByDescending(dto => dto.OverallRating ?? 0)
                .Take(topInstructorCount)
                .ToListAsync();

            return Result.Success(new StudentDashboardSummaryDto
            {
                EnrolledCoursesCount = enrolledCoursesCount,
                CompletedCoursesCount = completedCoursesCount,
                UniqueQuizzesAttempted = uniqueQuizzesAttempted,
                CourseAverageScores = courseAverageScores,
                TopInstructors = topInstructors
            });
        }
    }
}
