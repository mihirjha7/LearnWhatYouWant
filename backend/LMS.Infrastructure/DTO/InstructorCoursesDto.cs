using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class InstructorCoursesDto
    {
    
            public int CourseID { get; set; }
            // Corresponds to courses.Title
            public string Title { get; set; }
            public string CourseCategory { get; set; }
            // Corresponds to courses.Published
            public bool Published { get; set; }
            // Aggregated: COUNT of lessons
            public int TotalLessons { get; set; }
            // Aggregated: Formatted string (e.g., "248 Hr") for the frontend
            public string TotalDurationDisplay { get; set; }
            // Hidden field used internally for calculation
            public int? TotalEstimatedTimeInMinutes { get; set; }
     
    }
}
