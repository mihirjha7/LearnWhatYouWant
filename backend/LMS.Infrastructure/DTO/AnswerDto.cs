using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class AnswerDto
    {
        public int AnswerID { get; set; }
        public int QuestionID { get; set; }
        public int UserID { get; set; }

        public string? Response { get; set; }
        public int? MarksAwarded { get; set; }
        public DateTime SubmittedAt { get; set; }
        public bool? IsCorrect { get; set; }
    }
}
