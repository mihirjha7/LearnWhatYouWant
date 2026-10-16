using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Comment
    {
        public int CommentID { get; set; }
        public int CourseID { get; set; }
        public int UserID { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int? ParentCommentID { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Course Course { get; set; } = null!;
        public User User { get; set; } = null!;
        public Comment? Parent { get; set; }
        public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    }
}
