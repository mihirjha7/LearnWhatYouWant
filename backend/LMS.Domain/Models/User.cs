using LMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace LMS.Domain.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? ProfilePicture { get; set; }
        public string? Bio { get; set; }
        public bool IsActive { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string? ResetToken { get; set; } = null;
        public DateTime? ResetTokenExpiry { get; set; } = null;
        public UserRole Role { get; set; } = UserRole.Student; // Default role is Student
        public bool IsDeleted { get; set; }


        // Navigation property for the many-to-many relationship with Course, via the instructors table.
        // A user can be an instructor for multiple courses.
        public ICollection<CourseInstructor> CourseInstructors { get; set; } = new List<CourseInstructor>();

        // Navigation property for the many-to-many relationship with Course, via the enrollments table.
        // A user can enroll in multiple courses.
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

        // Navigation properties for one-to-many relationships (from User to other tables)
        public ICollection<Progress> Progresses { get; set; } = new List<Progress>();
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public ICollection<QuizScore> QuizScores { get; set; } = new List<QuizScore>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();

    }
}
