using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository questionRepository;

        public QuestionService(IQuestionRepository questionRepository) 
        {
            this.questionRepository = questionRepository;
        }

        public async Task<QuestionDto> CreateQuestionAsync(int id, CreateQuestionDto createQuestion)
        {
            var question = new Domain.Models.Question
            {
                QuizID = id,
                QuestionText = createQuestion.QuestionText,
                QuestionType = createQuestion.QuestionType,
                Options = createQuestion.Options,
                CorrectAnswer = createQuestion.CorrectAnswer,
                Marks = createQuestion.Marks,
            };
            var addedQuestion = await questionRepository.CreateQuestionAsync(question);
            var questionDto = new QuestionDto
            {
                QuestionID = addedQuestion.QuestionID,
                QuizID = addedQuestion.QuizID,
                QuestionText = addedQuestion.QuestionText,
                QuestionType = addedQuestion.QuestionType,
                Options = addedQuestion.Options,
                Marks = addedQuestion.Marks,
                CorrectAnswer = addedQuestion.CorrectAnswer
            };

            return questionDto;
        }
        public async Task<QuestionDto> GetQuestionByIdAsync(int questionId)
        {
            var question = await questionRepository.GetQuestionByIdAsync(questionId);
            if (question == null) return null;
            var questionDto = new QuestionDto
            {
                QuestionID = question.QuestionID,
                QuizID = question.QuizID,
                QuestionText = question.QuestionText,
                QuestionType = question.QuestionType,
                Options = question.Options,
                Marks = question.Marks,
                CorrectAnswer = question.CorrectAnswer
                
            };
            return questionDto;
        }
        public async Task<IEnumerable<QuestionDto>> GetQuestionsByQuizIdAsync(int quizId)
        {
            var questions = await questionRepository.GetQuestionsByQuizIdAsync(quizId);
            var questionDtos = questions.Select(q => new QuestionDto
            {
                QuestionID = q.QuestionID,
                QuizID = q.QuizID,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                Options = q.Options,
                Marks = q.Marks,
                CorrectAnswer = q.CorrectAnswer
            });
            return questionDtos;
        }
        public async Task<bool> UpdateQuestionAsync(QuestionDto questionDto)
        {
            var question = await questionRepository.GetQuestionByIdAsync(questionDto.QuestionID);
            if (question == null) return false;

            question.QuestionText = questionDto.QuestionText;
            question.QuestionType = questionDto.QuestionType;
            question.Options = questionDto.Options;
            question.Marks = questionDto.Marks;
            question.CorrectAnswer = questionDto.CorrectAnswer;

            return await questionRepository.UpdateQuestionAsync(question);

        }
        public async Task<bool> DeleteQuestionAsync(int questionId)
        {
            return await questionRepository.DeleteQuestionAsync(questionId);
        }
    }
}
