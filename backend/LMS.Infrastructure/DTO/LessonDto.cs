using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class LessonDto
    {
        public int LessonID { get; set; }
        [Required]
        public int CourseID { get; set; }

        [Required]
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

    }
}



