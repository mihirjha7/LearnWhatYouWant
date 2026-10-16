using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService questionService;

        public QuestionController(IQuestionService questionService)
        {
            this.questionService = questionService;
        }

        // Students must never receive the correct answer while attempting a quiz.
        private QuestionDto Redact(QuestionDto question)
        {
            if (User.IsInRole("Instructor") || User.IsInRole("Admin"))
            {
                return question;
            }

            question.CorrectAnswer = null;
            return question;
        }

        [HttpPost("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> CreateQuestion([FromRoute] int id, [FromBody] CreateQuestionDto createQuestion)
        {
            var question = await questionService.CreateQuestionAsync(id, createQuestion);
            return CreatedAtAction(nameof(GetQuestionById), new { id = question.QuestionID }, question);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestionById(int id)
        {
            var question = await questionService.GetQuestionByIdAsync(id);
            if (question == null) 
            { 
                return NotFound(); 
            }
            return Ok(Redact(question));
        }
        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> GetQuestionsByQuizId(int quizId)
        {
            var questions = await questionService.GetQuestionsByQuizIdAsync(quizId);
            return Ok(questions.Select(Redact));
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionDto question)
        {
            if (id != question.QuestionID)
            {
                return BadRequest("Question ID mismatch");
            }

            var updatedQuestion = await questionService.UpdateQuestionAsync(question);
            if (!updatedQuestion)
            {
                return NotFound();
            }

            return Ok();
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var result = await questionService.DeleteQuestionAsync(id);
            if (!result) {
                return NotFound();
            }
            return NoContent();
        }

    }
}
