using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class CreateCourseDto
    {
        [Required]
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Syllabus { get; set; }
        public string? Level { get; set; }
        public string? Language { get; set; }
        public int? Duration { get; set; }
        public string? ThumbnailURL { get; set; }

        [Required]
        public int CategoryID { get; set; }
        public string? CourseMaterialUrl { get; set; }
        public string? CourseMaterialFileName { get; set; }
        public bool Published { get; set; } 

    }
}
