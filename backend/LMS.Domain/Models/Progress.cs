using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Progress
    {
        public int ProgressID { get; set; }
        public int UserID { get; set; }
        public int CourseID { get; set; }
        public int? CompletedLessons { get; set; }
        public double? CompletionPercentage { get; set; }
        public DateTime? LastAccessed { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public User User { get; set; } = null!;
        public Course Course { get; set; } = null!;
    }
}
