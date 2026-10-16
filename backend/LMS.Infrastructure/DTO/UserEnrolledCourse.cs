using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class UserEnrolledCourse
    {
        public int CourseID { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? Level { get; set; }
        public string? Language { get; set; }
        public int? Duration { get; set; }
        public string? ThumbnailURL { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public string? CompletionStatus { get; set; }
    }
}
