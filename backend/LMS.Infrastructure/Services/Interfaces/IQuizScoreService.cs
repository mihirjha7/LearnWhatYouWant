using LMS.Infrastructure.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IQuizScoreService
    {
        Task<IEnumerable<QuizScoreDto>> GetQuizScoresByCourseAsync(int courseId, int userId);
        Task<CreateQuizScoreDto> CreateQuizScoreAsync(CreateQuizScoreDto createQuizScoreDto);

        //Task<IEnumerable<CourseAverageScoreDto>> GetAverageCourseScoresByUserAsync(int userId);

    }
}