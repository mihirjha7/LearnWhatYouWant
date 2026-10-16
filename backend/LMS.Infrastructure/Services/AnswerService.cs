using System;
using System.Threading.Tasks;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using LMS.Domain.Models;

namespace LMS.Infrastructure.Services
{
    public class AnswerService : IAnswerService
    {
        private readonly IAnswerRepository answerRepository;
        private readonly IQuestionRepository questionRepository;

        public AnswerService(IAnswerRepository answerRepository, IQuestionRepository questionRepository)
        {
            this.answerRepository = answerRepository;
            this.questionRepository = questionRepository;
        }

        public async Task<CreateAnswerDto> CreateAnswerAsync(CreateAnswerDto createAnswerDto, int userId, int quizId, int attemptNumber)
        {
            // Get question details
            var question = await questionRepository.GetQuestionByIdAsync(createAnswerDto.QuestionID);
            if (question == null)
            {
                throw new Exception("Question not found");
            }

            // Create answer entity
            var answer = new Answer
            {
                QuestionID = createAnswerDto.QuestionID,
                UserID = userId,
                Response = createAnswerDto.Response,
                QuizID = quizId,
                AttemptNumber = attemptNumber,
                SubmittedAt = DateTime.UtcNow
            };

            // Calculate if correct and marks awarded
            if (question.CorrectAnswer != null && createAnswerDto.Response != null)
            {
                answer.IsCorrect = question.CorrectAnswer.Equals(createAnswerDto.Response, StringComparison.OrdinalIgnoreCase);
                answer.MarksAwarded = answer.IsCorrect == true ? question.Marks : 0;
            }
            else
            {
                answer.IsCorrect = false;
                answer.MarksAwarded = 0;
            }

            // Save to database
            var createdAnswer = await answerRepository.CreateAnswerAsync(answer);

            // Return DTO with results
            return new CreateAnswerDto
            {
                QuestionID = createdAnswer.QuestionID,
                Response = createdAnswer.Response,
                QuizID = createdAnswer.QuizID,
                AttemptNumber = createdAnswer.AttemptNumber,
                IsCorrect = createdAnswer.IsCorrect,
                MarksAwarded = createdAnswer.MarksAwarded
            };
        }
    }
}