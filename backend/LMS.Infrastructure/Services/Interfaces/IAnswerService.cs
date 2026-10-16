using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IAnswerService
    {
        Task<CreateAnswerDto> CreateAnswerAsync(CreateAnswerDto dto, int userId, int quizId, int attemptNumber);


    }
}
