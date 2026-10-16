using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace LMS.Infrastructure.DTO
{
    public class CreateAnswerDto
    {
        public int QuestionID { get; set; }
        public string Response { get; set; }
        public int QuizID { get; set; }
        public int AttemptNumber { get; set; }
        public bool? IsCorrect { get; set; }
        public int? MarksAwarded { get; set; }
    }
}