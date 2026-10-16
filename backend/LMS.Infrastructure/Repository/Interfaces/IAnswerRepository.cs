using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IAnswerRepository
    {
        Task<Answer> CreateAnswerAsync(Answer answer);
        Task<IEnumerable<Answer>> GetAnswersByQuizAndUserAsync(int quizId, int userId);
    }
}
