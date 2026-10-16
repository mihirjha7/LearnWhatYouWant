using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Quiz
    {
        [Key]
        public int QuizID { get; set; }
        public int CourseID { get; set; }
        public string Title { get; set; } = null!;
        public int? TotalMarks { get; set; }
        public int? TimeLimit { get; set; }
        public int? AttemptsAllowed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Course Course { get; set; } = null!;
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<QuizScore> QuizScores { get; set; } = new List<QuizScore>();
        
    }
}
