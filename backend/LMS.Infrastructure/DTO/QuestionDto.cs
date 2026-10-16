using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class QuestionDto
    {
        public int QuestionID { get; set; }
        public int QuizID { get; set; }
        public string? QuestionText { get; set; }
        public string? QuestionType { get; set; }

        public List<string>? Options { get; set; }
        public int? Marks { get; set; }
        public string? CorrectAnswer { get; set; }
        
    }
}



