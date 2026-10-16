using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class CreateQuizDto
    {
       
        [Required]
        public int CourseID { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public int? TotalMarks { get; set; }
        public int? TimeLimit { get; set; } = 0;
        public int? AttemptsAllowed { get; set; }
       // public DateTime CreatedAt { get; set; }

        //public List<CreateQuestionDto>? Questions { get; set; }
    }
}
