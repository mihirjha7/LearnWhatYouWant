using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class QuizDto
    {
        [Required]
        public int QuizID { get; set; }
        [Required]
        public int CourseID { get; set; }
       
        public string Title { get; set; }
        public int? TotalMarks { get; set; } = 0;
        public int? TimeLimit { get; set; } = 0; 
        public int? AttemptsAllowed { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<QuestionDto>? Questions { get; set; }
    }
}



