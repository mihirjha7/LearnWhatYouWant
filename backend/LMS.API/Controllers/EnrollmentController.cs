using LMS.Infrastructure.DTO;
using LMS.API.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;
        private readonly ICurrentUserService _currentUser;

        public EnrollmentController(IEnrollmentService enrollmentService, ICurrentUserService currentUser)
        {
            _enrollmentService = enrollmentService;
            _currentUser = currentUser;
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EnrollUser([FromBody] EnrollRequestDto requestEnrollmentDto)
        {
            var result = await _enrollmentService.EnrollAsync(
                requestEnrollmentDto.CourseId,
                _currentUser.GetRequiredUserId());

            return result.ToActionResult(this);
        }

        [HttpGet("is-enrolled/{courseId:int}")]
        [Authorize(Roles = "Student,Instructor,Admin")]
        public async Task<IActionResult> IsUserEnrolledAsync([FromRoute] int courseId)
        {
            var result = await _enrollmentService.IsEnrolledAsync(courseId, _currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }


        [HttpGet("user/courses")]
        [Authorize(Roles = "Student,Instructor,Admin")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            var result = await _enrollmentService.GetEnrolledCoursesAsync(_currentUser.GetRequiredUserId());
            return result.ToActionResult(this);
        }

    }
}
