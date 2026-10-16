using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IQuizScoreRepository
    {
        Task<QuizScore> GetQuizScoreAsync(int userId, int quizId, int attemptNumber);
        Task<IEnumerable<QuizScore>> GetQuizScoresByCourseAsync(int courseId, int userId);
        Task<QuizScore> CreateQuizScoreAsync(QuizScore quizScore);

        Task<QuizScoreSummary> GetQuizScoreSummaryForUserAsync(int quizId, int userId);

        //Task<IEnumerable<CourseAverageScoreDto>> GetAverageCourseScoresByUserAsync(int userId);
    }
}

