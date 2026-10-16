using LMS.Domain;
using LMS.Domain.Enums;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static LMS.Infrastructure.DTO.InstructorCoursesDto;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;


namespace LMS.Infrastructure.Repository
{
    public class UserManagementRepository : IUserManagementRepository
    {
        private readonly LmsDbContext _dbContext;
        private readonly PasswordHashing _passwordHashing;
        public UserManagementRepository(LmsDbContext context, PasswordHashing passwordHashing)
        {
            _dbContext = context;
            _passwordHashing = passwordHashing;
        }

        #region Admin
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _dbContext.Users.ToListAsync();
        }
        public async Task<List<User>> GetUsersByRoleAsync(UserRole role)
        {
            return await _dbContext.Users.Where(u => u.Role == role).ToListAsync();
        }
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return _dbContext.Users.FirstOrDefault(u => u.Email == email);
        }
        public async Task<bool> CreateUserAsync(CreateUserDto user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));
            var hashedPassword = _passwordHashing.HashPassword(user.Password);
            var newUser = new User
            {
                Name = user.Name,
                Email = user.Email,
                PasswordHash = hashedPassword,
                Role = UserRole.Student, // Default role
                IsActive = true // Default status
            };
            _dbContext.Users.Add(newUser);
            return await _dbContext.SaveChangesAsync() > 0;
        }
        public Task<bool> UpdateUserStatusAsync(string email, bool isActive)
        {
            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                throw new ArgumentException("User not found", nameof(email));
            }

            // Update the user's active status
            user.IsActive = isActive;

            // Save the changes to the database
            return _dbContext.SaveChangesAsync().ContinueWith(t => t.Result > 0);

        }
        public Task<bool> DeleteUserAsync(string email)
        {
            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                throw new ArgumentException("User not found", nameof(email));
            }

            // Soft delete the user by setting the IsDeleted flag to true
            user.IsDeleted = true;

            // Save the changes to the database
            return _dbContext.SaveChangesAsync().ContinueWith(t => t.Result > 0);

        }
        #endregion


        #region Authentication
        public async Task<RegisterDto> RegisterUserAsync(RegisterDto registerDto)
        {
           var userDto = new RegisterDto
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = _passwordHashing.HashPassword(registerDto.Password)
            };
            User user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                PasswordHash = userDto.Password
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return registerDto;
        }
        public async Task<RegisterDto> RegisterUserAsync(RegisterInstructorDto registerInstructorDto)
        {
            var userDto = new RegisterDto
            {
                Name = registerInstructorDto.Name,
                Email = registerInstructorDto.Email,
                Password = _passwordHashing.HashPassword(registerInstructorDto.Password)
            };
            User user = new User
            {
                Name = registerInstructorDto.Name,
                Email = registerInstructorDto.Email,
                PasswordHash = userDto.Password,
                Role = UserRole.Instructor
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            return userDto;

        }
        public Task<User?> FindByEmailAsync(string email)
        {
            return _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> UpdateUserOnlyAsync(User user)
        {
            _dbContext.Users.Update(user);
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public Task<User?> FindByResetTokenAsync(string resetToken)
        {
            return _dbContext.Users.FirstOrDefaultAsync(u => u.ResetToken == resetToken);
        }

        #endregion


        #region User Profile

        // Change the method signature to accept int instead of Guid
        public async Task<User> GetByIdAsync(int userId)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == userId);
        }

        public async Task<bool> UpdateBioAsync(int UserId, string newBio, string name)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == UserId);
            if (user == null)
            {
                return false;
            }
            else
            {
                user.Bio = newBio;
                user.Name = name;
                user.UpdatedAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
                return true;
            }

        }


        // delete-->soft delete --> only flag change
        public async Task<bool> DeleteUserasync(int userId)
        {
            // first find the user if not then error
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if(user == null)
            {
                return false;
            }
            // if found the change the flag
            user.IsDeleted = true;
            user.UpdatedAt = DateTime.UtcNow;

            // then update the db
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            return true;



        }

        public async Task<List<Enrollment>> GetUserEnrolledCourses(int userId)
        {
            return await _dbContext.Enrollments
                .Where(e => e.UserID == userId && !e.IsDeleted)
                .Include(e => e.Course)
                .ToListAsync();
        }

        public Task GetByIdAsync(object userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateProfilePictureAsync(int userId, string fileName)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null) return false;

            user.ProfilePicture = fileName;
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }




        public async Task<StudentDashboardSummaryDto> GetStudentDashboardSummaryAsync(int userId)
        {
            // 1. Enrolled Courses Count: Count of all enrollments for the student
            var enrolledCoursesCount = await _dbContext.Enrollments
                .Where(e => e.UserID == userId && !e.IsDeleted)
                .CountAsync();

            // 2. Completed Courses Count: Count of enrollments where CompletionStatus is "Completed"
            var completedCoursesCount = await _dbContext.Enrollments
                .Where(e => e.UserID == userId && !e.IsDeleted && e.CompletionStatus == "Completed")
                .CountAsync();

            var uniqueQuizzesAttempted = await _dbContext.QuizScores
                .Where(score => score.UserID == userId) 
                .Select(score => score.QuizID)
                .Distinct()
                .CountAsync();


            var courseAverageScores = await _dbContext.QuizScores
    .Where(qs => qs.UserID == userId)
    // 1. Group by QuizID and its CourseID
    .GroupBy(qs => new { qs.QuizID, qs.Quiz.CourseID })
    .Select(g => new
    {
        g.Key.CourseID,
        HighestScore = g.Max(qs => qs.Score) // Highest score per quiz
    })
    // 2. Group the highest scores again, this time only by CourseID
    .GroupBy(a => a.CourseID)
    .Select(g => new CourseAverageScoreDto // Mapped to the user-specified DTO
    {
        // 3. Fetch the Course Title (Name) using the CourseID
        CourseName = _dbContext.Courses
            .Where(c => c.CourseID == g.Key)
            .Select(c => c.Title)
            .FirstOrDefault() ?? "Unknown Course",

        // 4. Calculate the average of the highest scores for this course
        AverageScore = (int?)Math.Round(g.Average(a => a.HighestScore))
    })
    .ToListAsync();




            int count = 5;
            var topInstructors = await _dbContext.Users
                .Where(u => u.Role == UserRole.Instructor) // 1. Filter for instructors
                .Select(u => new TopInstructorDto
                {
                    InstructorID = u.UserID,
                    Name = u.Name,
                    ProfilePicture = u.ProfilePicture,

                    // 2. Calculate Overall Rating: Average of all *published* course ratings
                    OverallRating = u.CourseInstructors
                        .Select(ci => ci.Course)
                        .Where(c => c.Rating.HasValue)
                        .Average(c => c.Rating),

                    // 3. Calculate Total Students: Count of distinct UserIDs in Enrollments
                    TotalStudents = u.CourseInstructors
                        .SelectMany(ci => ci.Course.Enrollments)
                        .Select(e => e.UserID)
                        .Distinct()
                        .Count()
                })
                // 4. Removed the .Where(dto => dto.TotalStudents > 0) filter as requested.
                //    All instructors will now be included.
                // 5. Order by rating (descending), treating null ratings as 0 for sorting,
                //    then by Total Students as a tie-breaker.
                .OrderByDescending(dto => dto.OverallRating.HasValue ? dto.OverallRating : 0)
                .OrderByDescending(dto => dto.TotalStudents)
                // 6. Take the top N
                .Take(count)
                .ToListAsync();




            // 6. Return the final DTO
            return new StudentDashboardSummaryDto
            {
                EnrolledCoursesCount = enrolledCoursesCount,
                CompletedCoursesCount = completedCoursesCount,
                UniqueQuizzesAttempted = uniqueQuizzesAttempted,
                CourseAverageScores = courseAverageScores,
                TopInstructors = topInstructors
            };
        }




        #endregion


        #region Instructor

        public async Task<InstructorDto> GetInstructorStatisticsAsync(int userId)
        {
            // 1. Get the list of all Course IDs once
            List<int> courseIds = await _dbContext.CourseInstructors
                .Where(ci => ci.UserID == userId)
                .Select(ci => ci.CourseID)
                .ToListAsync();

            if (courseIds.Count == 0)
            {
                return new InstructorDto { TotalStudents = 0, TotalCourses = 0, TotalVideos = 0 };
            }

            // 2. Count Total Courses
            int totalCourses = courseIds.Count; // Size of the array is the total courses

            // 3. Count Total Students (DISTINCT UserIDs)
            int totalStudents = await _dbContext.Enrollments
                .Where(e => courseIds.Contains(e.CourseID))
                .Select(e => e.UserID)
                .Distinct()
                .CountAsync();

            // 4. Count Total Videos (Lessons with VideoURL)
            int totalVideos = await _dbContext.Lessons
                .Where(l => courseIds.Contains(l.CourseID))
                .Where(l => l.VideoURL != null && l.VideoURL != "")
                .CountAsync();

            return new InstructorDto
            {
                TotalStudents = totalStudents,
                TotalCourses = totalCourses,
                TotalVideos = totalVideos
            };
        }

        public async Task<IEnumerable<InstructorCoursesDto>> GetInstructorCoursesAsync(int instructorId)
        {
            // 1. Get the Course IDs associated with the specific instructor
            var instructorCourseIds = _dbContext.CourseInstructors
                .Where(ci => ci.UserID == instructorId)
                .Select(ci => ci.CourseID);

            // 2. Query Courses, filter by ID and IsDeleted, and project the aggregated data
            var result = await _dbContext.Courses
                .Include(c=> c.Category)
                .Where(c => instructorCourseIds.Contains(c.CourseID) && !c.IsDeleted)
                .Select(c => new
                {
                    Course = c,
                    // Aggregation: Count of non-deleted lessons
                    TotalLessons = c.Lessons.Count(l => !l.IsDeleted),
                    // Projection of relevant lesson details for in-memory time calculation
                    TotalEstimatedMinutes = c.Duration,

                    CategoryName = c.Category != null ? c.Category.Name : "Uncategorized"
                })
                .ToListAsync();

            // 3. Map to DTO and perform the time-string aggregation in memory (C#)
            var coursesList = result.Select(r =>
            {
                // Calculate total minutes from string formats (e.g., "2 Hr")
                //var totalMinutes = r.Lessons.Sum(timeStr => ParseTimeStringToMinutes(timeStr));
                //var totalDuration = TimeSpan.FromMinutes(r.TotalEstimatedMinutes);

                return new InstructorCoursesDto
                {
                    CourseID = r.Course.CourseID,
                    Title = r.Course.Title,
                    Published = r.Course.Published,
                    TotalLessons = r.TotalLessons,
                    TotalEstimatedTimeInMinutes = r.TotalEstimatedMinutes,
                    // Format the TimeSpan into the required display string (e.g., "248 Hr")
                    //TotalDurationDisplay = FormatDuration(totalDuration),
                    CourseCategory = r.CategoryName
                };
            }).ToList();

            return coursesList;
        }
        // Formats the total duration into the required display string.
        private string FormatDuration(TimeSpan duration)
        {
            // Simple logic: if total hours is 1 or more, show hours, otherwise show minutes
            if (duration.TotalHours >= 1)
            {
                // Show hours rounded to the nearest whole number
                return $"{Math.Round(duration.TotalHours)} Hr";
            }
            return $"{duration.TotalMinutes} Min";
        }
    }

    #endregion

}