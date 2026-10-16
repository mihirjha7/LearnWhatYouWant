using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionDto> CreateQuestionAsync(int id, CreateQuestionDto question);
        Task<QuestionDto?> GetQuestionByIdAsync(int id);
        Task<IEnumerable<QuestionDto>> GetQuestionsByQuizIdAsync(int quizId);
        Task<bool> UpdateQuestionAsync(QuestionDto questionDto);
        Task<bool> DeleteQuestionAsync(int id);
    }
}
