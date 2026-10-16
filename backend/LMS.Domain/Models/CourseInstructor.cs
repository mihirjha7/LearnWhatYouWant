using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class CourseInstructor
    {
        public int CourseID { get; set; }
        public int UserID { get; set; }
        public DateTime AssignedAt { get; set; }

        // Navigation properties for the single related entities.
        public Course Course { get; set; } = null!;
        public User User { get; set; } = null!;
        public string? CourseMaterial { get; set; }
    }
}
