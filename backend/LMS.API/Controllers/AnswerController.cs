using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnswerController : ControllerBase
    {
        private readonly IAnswerService answerService;
        private readonly ICurrentUserService _currentUser;

        public AnswerController(IAnswerService answerService, ICurrentUserService currentUser)
        {
            this.answerService = answerService;
            _currentUser = currentUser;
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateAnswer([FromBody] CreateAnswerDto createAnswerDto)
        {
            var userId = _currentUser.GetRequiredUserId();

            if (createAnswerDto == null || createAnswerDto.QuestionID <= 0 ||
                createAnswerDto.QuizID <= 0 || createAnswerDto.AttemptNumber <= 0)
                return BadRequest("Invalid answer data.");

            try
            {
                var result = await answerService.CreateAnswerAsync(
                    createAnswerDto,
                    userId,
                    createAnswerDto.QuizID,
                    createAnswerDto.AttemptNumber
                );

                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}