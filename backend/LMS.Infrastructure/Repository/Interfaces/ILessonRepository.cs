using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface ILessonRepository
    {
        Task<IEnumerable<Lesson>> GetLessonsByCourseAsync(int courseId);
        Task<Lesson?> GetLessonByIdAsync(int lessonId);
        Task<Lesson> CreateLessonAsync(Lesson lesson);
        Task<Lesson> UpdateLessonAsync(Lesson lesson);
        Task<Lesson?> DeleteLessonAsync(int lessonId);
    }
}
