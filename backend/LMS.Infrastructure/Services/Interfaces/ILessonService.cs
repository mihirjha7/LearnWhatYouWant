using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface ILessonService
    {
        Task<IEnumerable<LessonDto?>?> GetLessonsByCourseAsync(int courseId);
        Task<LessonDto?> GetLessonByIdAsync(int lessonId);
        Task<LessonDto?> CreateLessonAsync(CreateLessonDto lessonDto);
        Task<LessonDto?> UpdateLessonAsync(LessonDto lessonDto);
        Task<LessonDto?> DeleteLessonAsync(int lessonId);
        Task<bool> UpdateLessonAttachmentAsync(int lessonId, string fileUrl, string originalFileName);
    }
}
