using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace LMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizScoreController : ControllerBase
    {
        private readonly IQuizScoreService _quizScoreService;
        private readonly ICurrentUserService _currentUser;

        public QuizScoreController(IQuizScoreService quizScoreService, ICurrentUserService currentUser)
        {
            _quizScoreService = quizScoreService;
            _currentUser = currentUser;
        }

        [HttpPost("submit")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitQuizScore([FromBody] CreateQuizScoreDto createQuizScoreDto)
        {
            var userId = _currentUser.GetRequiredUserId();

            // The score always belongs to the authenticated caller.
            createQuizScoreDto.UserID = userId;

            // Validate inputs
            if (createQuizScoreDto.QuizID <= 0 || createQuizScoreDto.AttemptNumber <= 0)
                return BadRequest("Invalid quiz ID or attempt number.");

            var result = await _quizScoreService.CreateQuizScoreAsync(createQuizScoreDto);
            return Ok(result);
        }

        [HttpGet("course/{courseId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetQuizScoresByCourse(int courseId)
        {
            var userId = _currentUser.GetRequiredUserId();

            var quizScores = await _quizScoreService.GetQuizScoresByCourseAsync(courseId, userId);
            return Ok(quizScores);
        }


        

    }
}