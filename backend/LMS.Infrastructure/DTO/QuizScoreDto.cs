using System;

namespace LMS.Infrastructure.DTO
{
    public class QuizScoreDto
    {
        public int ScoreID { get; set; }
        public int QuizID { get; set; }
        public int UserID { get; set; }
        public int Score { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


