using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly LmsDbContext dbContext;

        public QuestionRepository(LmsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        public async Task<Question> CreateQuestionAsync(Question question)
        {
            await dbContext.Questions.AddAsync(question);
            await dbContext.SaveChangesAsync();
            return question;
        }

        public async Task<Question?> GetQuestionByIdAsync(int questionId)
        {
            return await dbContext.Questions.FirstOrDefaultAsync(q => q.QuestionID == questionId && !q.IsDeleted);
        }

        public async Task<IEnumerable<Question>> GetQuestionsByQuizIdAsync(int quizId)
        {
            var questions = await dbContext.Questions
                .Where(q => q.QuizID == quizId && !q.IsDeleted)
                .ToListAsync();
            return questions;
        }

        public async Task<bool> UpdateQuestionAsync(Question question)
        {
            var entity = await dbContext.Questions.FindAsync(question.QuestionID);
            if (entity == null) return false;

            dbContext.Questions.Update(entity);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuestionAsync(int questionId)
        {
            var question = await dbContext.Questions.FindAsync(questionId);
            if (question == null) return false;

            dbContext.Questions.Remove(question);
            await dbContext.SaveChangesAsync();
            return true;
        }
    }
}
