using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class QuizSummaryDto
    {
        public int SrNo { get; set; }
        public int QuizID { get; set; }
        public string QuizTitle { get; set; } = null!;
        public int? TotalMarks { get; set; }
        public int? HighestScore { get; set; }
        public int? AttemptsAllowed { get; set; }
        public int AttemptsLeft { get; set; }
        public int CourseID { get; set; }
        // Assuming 'Course' model is available for fetching the title via navigation property
        public string CourseTitle { get; set; } = "Course Title Not Found";
    }

    // Helper DTO for the Repository to return score and attempt data
    public class QuizScoreSummary
    {
        public int? HighestScore { get; set; }
        public int MaxAttemptNumber { get; set; }
    }
}