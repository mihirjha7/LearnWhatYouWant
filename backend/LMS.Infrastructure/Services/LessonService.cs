using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Domain.Models;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services
{
    public class LessonService: ILessonService
    {
        private readonly ILessonRepository lessonRepository;
        private readonly ICourseRepository courseRepository;
        public LessonService(ILessonRepository lessonRepository, ICourseRepository courseRepository)
        {
            this.lessonRepository = lessonRepository;
            this.courseRepository = courseRepository;
        }

        public async Task<IEnumerable<LessonDto?>?> GetLessonsByCourseAsync(int courseId)
        {
            var course = await courseRepository.GetCourseByIdAsync(courseId);
            if (course == null) return null;

            var lessons = await lessonRepository.GetLessonsByCourseAsync(courseId);
            var lessonDtos = new List<LessonDto>();
            foreach (var lesson in lessons)
            {
                lessonDtos.Add(new LessonDto
                {
                    LessonID = lesson.LessonID,
                    CourseID = lesson.CourseID,
                    Title = lesson.Title,
                    Content = lesson.Content,
                    OrderIndex = lesson.OrderIndex,
                    VideoURL = lesson.VideoURL,
                    LessonAttachmentUrl = lesson.LessonAttachmentUrl,
                    LessonAttachmentFileName = lesson.LessonAttachmentFileName,
                    LessonType = lesson.LessonType,
                    EstimatedTime = lesson.EstimatedTime,
                    CreatedAt = lesson.CreatedAt,
                    UpdatedAt = lesson.UpdatedAt,
            

                });
            }

            return lessonDtos;
        }

        public async Task<LessonDto?> GetLessonByIdAsync(int lessonId)
        {
            var lesson = await lessonRepository.GetLessonByIdAsync(lessonId);
            if(lesson == null)
            {
                return null;
            }

            return new LessonDto
            {
                LessonID = lesson.LessonID,
                CourseID = lesson.CourseID,
                Title = lesson.Title,
                Content = lesson.Content,
                OrderIndex = lesson.OrderIndex,
                VideoURL = lesson.VideoURL,
                LessonAttachmentUrl = lesson.LessonAttachmentUrl,
                LessonAttachmentFileName = lesson.LessonAttachmentFileName,
                LessonType = lesson.LessonType,
                EstimatedTime = lesson.EstimatedTime,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt= lesson.UpdatedAt,
               
            };
        }

        public async Task<LessonDto?> CreateLessonAsync(CreateLessonDto lessonDto)
        {

            var course = await courseRepository.GetCourseByIdAsync(lessonDto.CourseID);
            if (course == null) return null;

            var lesson = new Lesson
            {
                Title = lessonDto.Title,
                Content = lessonDto.Content,
                VideoURL = lessonDto.VideoURL,
                LessonAttachmentUrl = lessonDto.LessonAttachmentUrl, // Assuming LessonDto is used for CreateLessonDto
                LessonAttachmentFileName = lessonDto.LessonAttachmentFileName,
                OrderIndex = lessonDto.OrderIndex,
                LessonType = lessonDto.LessonType,
                EstimatedTime = lessonDto.EstimatedTime,
                CourseID = lessonDto.CourseID,
             
            };

            var addedLesson = await lessonRepository.CreateLessonAsync(lesson);
            return new LessonDto
            {
                LessonID = addedLesson.LessonID,
                CourseID = addedLesson.CourseID,
                Title = addedLesson.Title,
                Content = addedLesson.Content,
                VideoURL= addedLesson.VideoURL,
                LessonAttachmentUrl = addedLesson.LessonAttachmentUrl,
                LessonAttachmentFileName = addedLesson.LessonAttachmentFileName,
                OrderIndex = addedLesson.OrderIndex,
                LessonType = addedLesson.LessonType,
                EstimatedTime = addedLesson.EstimatedTime,
                CreatedAt= addedLesson.CreatedAt,
                UpdatedAt= addedLesson.UpdatedAt,
               
            };

        }


        public async Task<LessonDto?> UpdateLessonAsync(LessonDto lessonDto)
        {
            var lesson = await lessonRepository.GetLessonByIdAsync(lessonDto.LessonID);
            if(lesson == null) return null;

            var course = await courseRepository.GetCourseByIdAsync(lessonDto.CourseID);
            if (course == null) return null;


            lesson.Title = lessonDto.Title;
            lesson.Content = lessonDto.Content;
            lesson.VideoURL = lessonDto.VideoURL;
            lesson.LessonAttachmentUrl = lessonDto.LessonAttachmentUrl;
            lesson.LessonAttachmentFileName = lessonDto.LessonAttachmentFileName;
            lesson.OrderIndex = lessonDto.OrderIndex;
            lesson.LessonType = lessonDto.LessonType;
            lesson.EstimatedTime = lessonDto.EstimatedTime;
            lesson.CourseID = lessonDto.CourseID;
           

           

            var updatedLesson = await lessonRepository.UpdateLessonAsync(lesson);

            return new LessonDto
            {
                LessonID = updatedLesson.LessonID,
                CourseID = updatedLesson.CourseID,
                Title = updatedLesson.Title,
                Content = updatedLesson.Content,
                VideoURL = updatedLesson.VideoURL,
                LessonAttachmentUrl = updatedLesson.LessonAttachmentUrl,
                LessonAttachmentFileName = updatedLesson.LessonAttachmentFileName,
                OrderIndex = updatedLesson.OrderIndex,
                LessonType = updatedLesson.LessonType,
                EstimatedTime = updatedLesson.EstimatedTime,
                CreatedAt = updatedLesson.CreatedAt,
                UpdatedAt = updatedLesson.UpdatedAt,
              
            };
        }

        public async Task<LessonDto?> DeleteLessonAsync(int lessonId)
        {
            
            var lesson = await lessonRepository.DeleteLessonAsync(lessonId);
            if(lesson == null)
            {
                return null;
            }
            return new LessonDto
            {
                LessonID = lesson.LessonID,
                CourseID = lesson.CourseID,
                Title = lesson.Title,
                Content = lesson.Content,
                VideoURL = lesson.VideoURL,
                OrderIndex = lesson.OrderIndex,
                LessonType = lesson.LessonType,
                EstimatedTime = lesson.EstimatedTime,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt,
         
            };
        }
        public async Task<bool> UpdateLessonAttachmentAsync(int lessonId, string fileUrl, string originalFileName)
        {
            // 1. Logic: Use the repository to retrieve the Lesson, including authorization check
            var lesson = await lessonRepository.GetLessonByIdAsync(lessonId);

            if (lesson == null)
            {
                // Lesson not found OR the authenticated user is NOT the instructor for the course
                return false;
            }

            // 2. Logic: Update the properties on the tracked entity
            lesson.LessonAttachmentUrl = fileUrl;
            lesson.LessonAttachmentFileName = originalFileName;
            lesson.UpdatedAt = DateTime.UtcNow; // Update timestamp for the change

            // 3. Persistence: Call the repository's generic update/save method
            // Since EF Core is tracking the 'lesson' object, calling Update/SaveChangesAsync will save the changes.
            // Using the existing UpdateLessonAsync from the repository is appropriate here.
            var updatedLesson = await lessonRepository.UpdateLessonAsync(lesson);

            return updatedLesson != null;
        }
    }
}
