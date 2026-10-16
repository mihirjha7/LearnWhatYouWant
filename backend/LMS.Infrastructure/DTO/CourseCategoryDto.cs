using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class CourseCategoryDto
    {
        [Required]
        public int CategoryID { get; set; }
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Category name must be between 3 and 100 characters.")]
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
