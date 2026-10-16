using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Question
    {
        public int QuestionID { get; set; }
        public int QuizID { get; set; }
        public string QuestionText { get; set; } = null!;
        public string? QuestionType { get; set; }
        public List<string>? Options { get; set; } // JSON stored as varchar(max)
        public string? CorrectAnswer { get; set; }
        public int? Marks { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Quiz Quiz { get; set; } = null!;
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}
