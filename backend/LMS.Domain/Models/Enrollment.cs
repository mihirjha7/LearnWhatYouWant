using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Enrollment
    {
        public int EnrollmentID { get; set; }
        public int CourseID { get; set; }
        public int UserID { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public string? CompletionStatus { get; set; }
        public string? CertificateURL { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties for the single related entities.
        public Course Course { get; set; } = null!;
        public User User { get; set; } = null!;

    }
}
