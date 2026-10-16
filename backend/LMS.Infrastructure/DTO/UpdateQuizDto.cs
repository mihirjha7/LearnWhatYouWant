using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{

    public class UpdateQuizDto
    {

        [Required, Range(1, int.MaxValue)]
        public int CourseID { get; set; }

        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required, Range(1, int.MaxValue)]
        public int TotalMarks { get; set; }

        [Required, Range(1, int.MaxValue)]
        public int TimeLimit { get; set; }

        [Required, Range(1, int.MaxValue)]
        public int AttemptsAllowed { get; set; }
    }

}
