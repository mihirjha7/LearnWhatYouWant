using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IQuestionRepository
    {
        Task<Question> CreateQuestionAsync(Question question);
        Task<Question?> GetQuestionByIdAsync(int id);
        Task<IEnumerable<Question>> GetQuestionsByQuizIdAsync(int quizId);
        Task<bool> UpdateQuestionAsync(Question question);
        Task<bool> DeleteQuestionAsync(int id);
    }
}
