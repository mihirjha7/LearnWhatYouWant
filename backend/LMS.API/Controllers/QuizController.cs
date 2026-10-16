using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService quizService;

        public QuizController(IQuizService quizService)
        {
            this.quizService = quizService;
        }

        [HttpPost]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> CreateQuizAsync([FromBody] CreateQuizDto createQuizDto)
        {
            var quizDto = await quizService.CreateQuizAsync(createQuizDto);
            if (quizDto == null) return BadRequest("Could not create quiz");
            return Ok(quizDto);
        }

        [HttpGet("get-by-quizId/{quizId}")]
        [Authorize]
        public async Task<IActionResult> GetQuizByIdAsync([FromRoute] int quizId)
        {
            var quiz = await quizService.GetQuizByIdAsync(quizId);
            if (quiz == null) return NotFound();
            return Ok(quiz);
        }

        [HttpGet("get-by-courseId/{courseId}")]
        [Authorize(Roles = "Student, Instructor")]
        public async Task<IActionResult> GetQuizzesByCourseAsync([FromRoute] int courseId)
        {
            var quizzes = await quizService.GetQuizzesByCourseAsync(courseId);
            return Ok(quizzes);
        }


        [HttpGet("all")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetAllQuizzesAsync()
        {
            var quizzes = await quizService.GetAllQuizzesAsync();
            return Ok(quizzes);
        }

        //[HttpDelete("{quizId")]
        //[Authorize(Roles = "Instructor")]
        //public async Task<IActionResult> RemoveQuizAsync([FromRoute] int quizId)
        //{
        //    var success = await quizService.DeleteQuizAsync(quizId);
        //    if (success)
        //    {
        //        return NoContent();
        //    }
        //    return NotFound();
        //}

        [HttpPut("{quizId}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> UpdateQuizAsync([FromRoute] int quizId, [FromBody] UpdateQuizDto updateQuizDto)
        {
            var updatedQuiz = await quizService.UpdateQuizAsync(quizId, updateQuizDto);
            if (updatedQuiz == null)
            {
                return NotFound();
            }
            return Ok(updatedQuiz);
        }

        [HttpPost("start/{quizId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> StartQuizAsync([FromRoute] int quizId)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("User ID not found.");

            try
            {
                var result = await quizService.StartQuizAsync(quizId, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteQuizAsync([FromRoute] int id)
        {
            var success = await quizService.DeleteQuizAsync(id);
            if (success)
            {
                return NoContent();
            }
            return NotFound();
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetQuizSummariesForCurrentUserAsync()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("User ID not found in token.");

            try
            {
                var summaries = await quizService.GetQuizSummariesByUserAsync(userId);
                return Ok(summaries);
            }
            catch (System.Exception ex)
            {
                // Log exception (best practice)
                return StatusCode(500, "An error occurred while fetching quiz summaries: " + ex.Message);
            }

        }
    }
}