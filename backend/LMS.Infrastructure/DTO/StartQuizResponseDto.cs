using System;

namespace LMS.Infrastructure.DTO
{
    public class StartQuizResponseDto
    {
        public int QuizID { get; set; }
        public string Title { get; set; }
        public int? TotalMarks { get; set; }
        public int? TimeLimit { get; set; }
        public int? AttemptsAllowed { get; set; }
        public int CurrentAttemptNumber { get; set; }
        public int? RemainingAttempts { get; set; }
    }
}