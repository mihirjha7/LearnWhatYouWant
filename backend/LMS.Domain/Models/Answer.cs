using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Answer
    {
        public int AnswerID { get; set; }
        public int QuestionID { get; set; }
        public int UserID { get; set; }
        public int QuizID { get; set; }
        public string? Response { get; set; }

        public int AttemptNumber { get; set; } = 0;
        public int? MarksAwarded { get; set; }
        public DateTime SubmittedAt { get; set; }
        public bool? IsCorrect { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Question Question { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
