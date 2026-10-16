using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace LMS.Infrastructure.DTO
{
    public class CreateQuizScoreDto
    {
        public int QuizID { get; set; }
        public int UserID { get; set; }
        public int Score { get; set; }
        public int AttemptNumber { get; set; }
    }
}
