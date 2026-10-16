using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Repository
{
    public class QuizRepository : IQuizRepository
    {
        private readonly LmsDbContext dbContext;
        public QuizRepository(LmsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByCourseAsync(int courseId)
        {
            var quizzes = await dbContext.Quizzes
                .Where(q => q.CourseID == courseId && !q.IsDeleted)
                .ToListAsync();
            return quizzes;
        }

        public async Task<Quiz?> GetQuizByIdAsync(int quizId)
        {
            var quiz = await dbContext.Quizzes.FindAsync(quizId);
            if (quiz == null || quiz.IsDeleted)
            {
                return null;
            }
            return quiz;
        }

        public async Task<List<Quiz>> GetAllQuizzesAsync()
        {
            var quizzes = await dbContext.Quizzes
                .Where(q => !q.IsDeleted)
                .ToListAsync();
            return quizzes;
        }

        public async Task<Quiz> CreateQuizAsync(Quiz quiz)
        {
            await dbContext.Quizzes.AddAsync(quiz);
            await dbContext.SaveChangesAsync();
            return quiz;
        }

        public async Task<Quiz> UpdateQuizAsync(Quiz quiz)
        {
            //quiz.UpdatedAt = DateTime.UtcNow;
            dbContext.Quizzes.Update(quiz);
            await dbContext.SaveChangesAsync();
            return quiz;
        }

        public async Task<Quiz?> DeleteQuizAsync(int quizId)
        {
            var quiz = await dbContext.Quizzes.FindAsync(quizId);
            if (quiz == null || quiz.IsDeleted)
            {
                return null;
            }
            quiz.IsDeleted = true;
            quiz.UpdatedAt = DateTime.UtcNow;
            dbContext.Quizzes.Update(quiz);
            await dbContext.SaveChangesAsync();
            return quiz;
        }


        // ... inside QuizRepository class
        // ... existing methods

        public async Task<IEnumerable<Quiz>> GetAllActiveQuizzesWithCourseAsync()
        {
            // Include Course navigation property to get CourseTitle
            var quizzes = await dbContext.Quizzes
                .Where(q => !q.IsDeleted)
                .Include(q => q.Course)
                .ToListAsync();
            return quizzes;
        }
    }
}
