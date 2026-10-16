using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository quizRepository;
        private readonly IAnswerRepository answerRepository;
        private readonly IQuizScoreRepository quizScoreRepository;  
        private readonly IEnrollmentRepository enrollmentRepository;

        public QuizService(IQuizRepository quizRepository, IAnswerRepository answerRepository, IQuizScoreRepository quizScoreRepository, IEnrollmentRepository enrollmentRepository)
        {
            this.quizRepository = quizRepository;
            this.answerRepository = answerRepository;
            this.quizScoreRepository = quizScoreRepository;
            this.enrollmentRepository = enrollmentRepository;
        }

        public async Task<IEnumerable<QuizDto>> GetQuizzesByCourseAsync(int courseId)
        {
            var quizzes = await quizRepository.GetQuizzesByCourseAsync(courseId);
            if (quizzes == null) return new List<QuizDto>();

            var quizDtos = new List<QuizDto>();
            foreach (var quizDto in quizzes)
            {
                quizDtos.Add(new QuizDto
                {
                    QuizID = quizDto.QuizID,
                    CourseID = quizDto.CourseID,
                    Title = quizDto.Title,
                    TotalMarks = quizDto.TotalMarks,
                    TimeLimit = quizDto.TimeLimit,
                    CreatedAt = quizDto.CreatedAt,
                    AttemptsAllowed = quizDto.AttemptsAllowed,
                });
            }
            return quizDtos;
        }

        public async Task<QuizDto?> GetQuizByIdAsync(int quizId)
        {
            var quiz = await quizRepository.GetQuizByIdAsync(quizId);
            if (quiz == null) return null;
            return new QuizDto
            {
                QuizID = quiz.QuizID,
                CourseID = quiz.CourseID,
                Title = quiz.Title,
                TotalMarks = quiz.TotalMarks,
                TimeLimit = quiz.TimeLimit,
                CreatedAt = quiz.CreatedAt,
                AttemptsAllowed = quiz.AttemptsAllowed,
            };
        }

        public async Task<QuizDto> CreateQuizAsync(CreateQuizDto createQuizDto)
        {
            var newQuiz = new Quiz
            {
                CourseID = createQuizDto.CourseID,
                Title = createQuizDto.Title,
                TotalMarks = createQuizDto.TotalMarks,
                TimeLimit = createQuizDto.TimeLimit,
                AttemptsAllowed = createQuizDto.AttemptsAllowed,
            };
            var createdQuiz = await quizRepository.CreateQuizAsync(newQuiz);
            return new QuizDto
            {
                QuizID = createdQuiz.QuizID,
                CourseID = createdQuiz.CourseID,
                Title = createdQuiz.Title,
                TotalMarks = createdQuiz.TotalMarks,
                TimeLimit = createdQuiz.TimeLimit,
                CreatedAt = createdQuiz.CreatedAt,
                AttemptsAllowed = createdQuiz.AttemptsAllowed,
            };
        }

        public async Task<bool> DeleteQuizAsync(int quizId)
        {
            return await quizRepository.DeleteQuizAsync(quizId) != null;
        }

        public async Task<StartQuizResponseDto> StartQuizAsync(int quizId, int userId)
        {
            // Get quiz details
            var quiz = await quizRepository.GetQuizByIdAsync(quizId);
            if (quiz == null)
                throw new Exception("Quiz not found.");

            // Get previous attempts
            var previousAnswers = await answerRepository.GetAnswersByQuizAndUserAsync(quizId, userId);
            int currentAttemptNumber = previousAnswers.Any()
                ? previousAnswers.Max(a => a.AttemptNumber) + 1
                : 1;

            // Check if attempts exceeded
            if (quiz.AttemptsAllowed.HasValue && currentAttemptNumber > quiz.AttemptsAllowed.Value)
            {
                throw new InvalidOperationException($"Maximum attempts ({quiz.AttemptsAllowed.Value}) reached for this quiz.");
            }

            return new StartQuizResponseDto
            {
                QuizID = quiz.QuizID,
                Title = quiz.Title,
                TotalMarks = quiz.TotalMarks,
                TimeLimit = quiz.TimeLimit,
                AttemptsAllowed = quiz.AttemptsAllowed,
                CurrentAttemptNumber = currentAttemptNumber,
                RemainingAttempts = quiz.AttemptsAllowed.HasValue
                    ? quiz.AttemptsAllowed.Value - currentAttemptNumber + 1
                    : null
            };
        }


        public async Task<IEnumerable<QuizSummaryDto>> GetQuizSummariesByUserAsync(int userId)
        {
             var enrolledCourses = await enrollmentRepository.GetEnrolledCoursesAsync(userId);
            
            if (enrolledCourses == null || !enrolledCourses.Any())
            {
                return new List<QuizSummaryDto>();
            }

            var enrolledQuizzes = new List<QuizDto>();
            var quizSummaries = new List<QuizSummaryDto>();
            int srNo = 1;

            // Iterate through enrolled courses and fetch quizzes for each one.
            foreach (var course in enrolledCourses)
            {
                var quizzesInCourse = await quizRepository.GetQuizzesByCourseAsync(course.CourseID);
                 foreach (var quiz in quizzesInCourse)
                {
                     var scoreSummary = await quizScoreRepository.GetQuizScoreSummaryForUserAsync(quiz.QuizID, userId);

                    int maxAttempt = scoreSummary.MaxAttemptNumber;

                     int attemptsAllowed = quiz.AttemptsAllowed ?? 0;

                    int attemptsLeft = attemptsAllowed - maxAttempt;

                   
                    if (attemptsLeft < 0) attemptsLeft = 0;

                    string courseTitle = course.Title ?? "Course Title Not Found";

                    quizSummaries.Add(new QuizSummaryDto
                    {
                        SrNo = srNo++,
                        QuizID = quiz.QuizID,
                        QuizTitle = quiz.Title,
                        TotalMarks = quiz.TotalMarks,
                        HighestScore = scoreSummary.HighestScore,
                        AttemptsAllowed = quiz.AttemptsAllowed,
                        AttemptsLeft = attemptsLeft,
                        CourseID = quiz.CourseID,
                        CourseTitle = courseTitle
                    });
                }
            }

            return quizSummaries;
        }

        public Task<IEnumerable<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = quizRepository.GetAllQuizzesAsync();
            var quizDtos = quizzes.ContinueWith(qs => qs.Result.Select(quiz => new QuizDto
            {
                QuizID = quiz.QuizID,
                CourseID = quiz.CourseID,
                Title = quiz.Title,
                TotalMarks = quiz.TotalMarks,
                TimeLimit = quiz.TimeLimit,
                CreatedAt = quiz.CreatedAt,
                AttemptsAllowed = quiz.AttemptsAllowed,
            }));
            return quizDtos;
        }

        public Task<QuizDto> UpdateQuizAsync(int quizId, UpdateQuizDto quizDto)
        {var quiz = new Quiz
            {
                QuizID = quizId,
            CourseID = quizDto.CourseID,
                Title = quizDto.Title,
                TotalMarks = quizDto.TotalMarks,
                TimeLimit = quizDto.TimeLimit,
                AttemptsAllowed = quizDto.AttemptsAllowed,
            };
            return quizRepository.UpdateQuizAsync(quiz).ContinueWith(q =>
                new QuizDto
                {
                    QuizID = q.Result.QuizID,
                    CourseID = q.Result.CourseID,
                    Title = q.Result.Title,
                    TotalMarks = q.Result.TotalMarks,
                    TimeLimit = q.Result.TimeLimit,
                    CreatedAt = q.Result.CreatedAt,
                    AttemptsAllowed = q.Result.AttemptsAllowed,
                });
        }
    }
}