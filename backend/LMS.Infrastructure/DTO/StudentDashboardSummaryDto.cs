using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class StudentDashboardSummaryDto
    {
        public int EnrolledCoursesCount { get; set; }
        public int CompletedCoursesCount { get; set; }
        public int UniqueQuizzesAttempted { get; set; } // Average progress of all enrolled courses

        public List<CourseAverageScoreDto> CourseAverageScores { get; set; } = new List<CourseAverageScoreDto>();

        public List<TopInstructorDto> TopInstructors { get; set; } = new List<TopInstructorDto>();

    }
}
