using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class TopInstructorDto
    {
        public int InstructorID { get; set; }
        public string Name { get; set; } = null!;

        // 🚨 CORRECTED: Property name must match the User model's property name.
        public string? ProfilePicture { get; set; }

        public double? OverallRating { get; set; }
        public int TotalStudents { get; set; }
    }
}
