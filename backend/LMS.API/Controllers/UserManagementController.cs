using LMS.API.Common;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

using LMS.Domain.Enums;


namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserManagementController : ControllerBase
    {

        public readonly IFileUploadService _fileService;
        private readonly FileUploadLimits _limits;
        private readonly IUserService _userService;
        private readonly ICurrentUserService _currentUser;

        public UserManagementController(
            IFileUploadService fileService,
            IOptions<FileUploadLimits> limits,
            IUserService userService,
            ICurrentUserService currentUser)
        {
            _fileService = fileService;
            _limits = limits.Value;
            _userService = userService;
            _currentUser = currentUser;
        }


        // GET USER FULL PROFILEE //
        [HttpGet("me")]
        [Authorize]  // ensures only logged in user can acccess
        public async Task<IActionResult> GetMyProfile()
        {
            var result = await _userService.GetProfileAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }
        // UPDATING THE BIO
        [HttpPut("me/bio")]
        [Authorize]
        public async Task<IActionResult> UpdateBio([FromBody] UserUpdateProfileBioDto bio)
        {
            var result = await _userService.UpdateProfileAsync(_currentUser.GetRequiredUserId(), bio);
            return result.ToActionResult(this);
        }


        // Delete the user means changing the flag only
        [HttpDelete("me")]
        [Authorize]
        public async Task<IActionResult> DeleteProfile()
        {
            var result = await _userService.DeleteOwnAccountAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }


        // Showing courses enrolled by user

        [HttpGet("me/courses")]
        [Authorize]
        public async Task<IActionResult> GetUserEnrolledCourse()
        {
            var result = await _userService.GetEnrolledCoursesAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }



        // Upload profile picture
        [HttpPost("me/profilePicture")]
        [Authorize(Roles = "Student,Instructor,Admin")]
        public async Task<IActionResult> UploadProfileImage(IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest(new { Message = "No file received" });
            }

            var fileName = await _fileService.SaveFileAsync(file, _limits.ProfileImageMaxSize);
            var result = await _userService.UpdateProfilePictureAsync(_currentUser.GetRequiredUserId(), fileName);

            return result.IsSuccess
                ? Ok(new { FileName = fileName, Message = "Profile image uploaded successfully." })
                : result.ToActionResult(this);
        }


        #region Admin Functionalities

        // Get all users
        [HttpGet("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return result.ToActionResult(this);
        }

        [HttpGet("admin/users/role/{role}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                return BadRequest(new { Message = "Invalid role specified" });
            }

            var result = await _userService.GetUsersByRoleAsync(userRole);
            return result.ToActionResult(this);
        }

        [HttpPost("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto newUser)
        {
            var result = await _userService.CreateUserAsync(newUser);
            return result.ToActionResult(this);
        }

        [HttpPut("admin/users/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UpdateUserStatusDto userStatusDto)
        {
            var result = await _userService.UpdateUserStatusAsync(userStatusDto.Email, userStatusDto.IsActive);
            return result.ToActionResult(this);
        }

        [HttpDelete("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserDto deleteUserDto)
        {
            var result = await _userService.DeleteUserAsync(deleteUserDto.Email);
            return result.ToActionResult(this);
        }

        #endregion

        #region Instructor Functionalities


        [HttpGet("instructor/analytics")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetInstructorAnalytics()
        {
            var result = await _userService.GetInstructorStatisticsAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }

        [HttpGet("instructor/courses")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetMyCourses()
        {
            var result = await _userService.GetInstructorCoursesAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }
        #endregion

        // Controller for Student Dashboard Summary

        [HttpGet("student/dashboardSummary")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentDashboardSummary()
        {
            var result = await _userService.GetStudentDashboardSummaryAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }
    }
}
