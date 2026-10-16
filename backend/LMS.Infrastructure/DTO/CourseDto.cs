using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class CourseDto
    {
        public int CourseID { get; set; }
        [Required]
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Syllabus { get; set; }
        public string? Level { get; set; }
        public string? Language { get; set; }
        public int? Duration { get; set; }
        public string? ThumbnailURL { get; set; }
        public int CategoryID { get; set; }
        public string? CourseMaterialUrl { get; set; }
        public string? CourseMaterialFileName { get; set; }
        public bool Published { get; set; }
        public double? Rating { get; set; }
        public int? ReviewCount { get; set; }
        public List<LessonDto> Lessons { get; set; } = new();

    }
}
