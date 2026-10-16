using LMS.Domain.Enums;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IUserManagementRepository
    {
        Task<User> GetByIdAsync(int UserId);
        Task<bool> UpdateBioAsync(int UserId, string newBio, string name);
        Task<bool> DeleteUserasync(int UserId);
        Task<List<Enrollment>> GetUserEnrolledCourses(int UserId);

        //Authentication
        Task<RegisterDto> RegisterUserAsync(RegisterDto registerDto);
        Task<RegisterDto> RegisterUserAsync(RegisterInstructorDto registerInstructorDto);
        Task<User?> FindByEmailAsync(string email);
        Task<bool> UpdateUserOnlyAsync(User user);
        Task<User?> FindByResetTokenAsync(string email);

        //Admin functionalities
        Task<List<User>> GetAllUsersAsync();
        Task<List<User>> GetUsersByRoleAsync(UserRole role);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> CreateUserAsync(CreateUserDto user);
        Task<bool> UpdateUserStatusAsync(string email, bool isActive);
        Task<bool> DeleteUserAsync(string email);
        Task GetByIdAsync(object userId);
        Task<bool> UpdateProfilePictureAsync(int userId, string fileName);

        // Instructor functionalities


        Task<StudentDashboardSummaryDto> GetStudentDashboardSummaryAsync(int userId);

        Task<InstructorDto> GetInstructorStatisticsAsync(int instructorId);
        
        Task<IEnumerable<InstructorCoursesDto>> GetInstructorCoursesAsync(int instructorId);


        


        //Task<StudentDashboardSummaryDto> GetStudentDashboardSummaryAsync(int studentId);
    }
}
