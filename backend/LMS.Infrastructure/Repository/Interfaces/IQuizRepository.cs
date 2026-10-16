using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IQuizRepository
    {

            Task<IEnumerable<Quiz>> GetQuizzesByCourseAsync(int courseId);
            Task<Quiz?> GetQuizByIdAsync(int quizId);
            Task<List<Quiz>> GetAllQuizzesAsync();
        Task<Quiz> CreateQuizAsync(Quiz quiz);
            Task<Quiz> UpdateQuizAsync(Quiz quiz);
            Task<Quiz?> DeleteQuizAsync(int quizId);

        // ... existing methods

            Task<IEnumerable<Quiz>> GetAllActiveQuizzesWithCourseAsync();
    }

}

