using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class QuizScore
    {
        public int ScoreID { get; set; }
        public int UserID { get; set; }
        public User User { get; set; } = null!;
        public int QuizID { get; set; }
        public Quiz Quiz { get; set; } = null!;
        public int Score { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        
        
    }
}
