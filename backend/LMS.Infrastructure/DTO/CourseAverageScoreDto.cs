using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class CourseAverageScoreDto
    {
    
        // Added property to hold the Course Title
        public string CourseName { get; set; } = null!;
        public int? AverageScore { get; set; }
    }
}
