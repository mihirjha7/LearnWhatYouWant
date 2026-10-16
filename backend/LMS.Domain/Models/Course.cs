using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace LMS.Domain.Models
{
    public class Course
    {
        public int CourseID { get; set; }
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
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation property for the one-to-one relationship with Category.
        public CourseCategory Category { get; set; } = null!;

        // Navigation property for the many-to-many relationship with User (as instructor) via the instructors table.
        // A course can have multiple instructors.
        public ICollection<CourseInstructor> CourseInstructors { get; set; } = new List<CourseInstructor>();

        // Navigation property for the many-to-many relationship with User (as student) via the enrollments table.
        // A course can have multiple students enrolled.
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

        // Navigation properties for one-to-many relationships (from Course to other tables)
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Progress> Progresses { get; set; } = new List<Progress>();
        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    }
}
