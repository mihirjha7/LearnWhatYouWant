using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Lesson
    {
        public int LessonID { get; set; }
        public int CourseID { get; set; }
        public string Title { get; set; } = null!;
        public string? Content { get; set; }
        public string? VideoURL { get; set; }
        public string? LessonAttachmentUrl { get; set; }
        public string? LessonAttachmentFileName { get; set; }
        public int? OrderIndex { get; set; }
        public string? LessonType { get; set; }
        public int? EstimatedTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Course Course { get; set; } = null!;
    }
}
