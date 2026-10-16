using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using LMS.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository courseRepository;

        public CourseService(ICourseRepository courseRepository)
        {
            this.courseRepository = courseRepository;
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, int userId)
        {
            var course = new Course
            {
                Title = createCourseDto.Title,
                Description = createCourseDto.Description,
                Syllabus = createCourseDto.Syllabus,
                Level = createCourseDto.Level,
                Language = createCourseDto.Language,
                Duration = createCourseDto.Duration,
                ThumbnailURL = createCourseDto.ThumbnailURL,
                CategoryID = createCourseDto.CategoryID,
                CourseMaterialUrl = createCourseDto.CourseMaterialUrl,
                CourseMaterialFileName = createCourseDto.CourseMaterialFileName,
                Published = createCourseDto.Published
            };

            var addedCourse = await courseRepository.AddCourseAsync(course,userId);
            return new CourseDto
            {
                CourseID = addedCourse.CourseID,
                Title = addedCourse.Title,
                Description = addedCourse.Description,
                Syllabus = addedCourse.Syllabus,
                Level = addedCourse.Level,
                Language = addedCourse.Language,
                Duration = addedCourse.Duration,
                ThumbnailURL = addedCourse.ThumbnailURL,
                CategoryID = addedCourse.CategoryID,
                CourseMaterialUrl = addedCourse.CourseMaterialUrl,
                CourseMaterialFileName = addedCourse.CourseMaterialFileName,
                Published = addedCourse.Published,
                Rating = addedCourse.Rating,
                ReviewCount = addedCourse.ReviewCount
            };
        }

        public async Task<CourseDto?> GetCourseByIdAsync(int id)
        {
            var course = await courseRepository.GetCourseByIdAsync(id);
            if (course == null) return null;
            return new CourseDto
            {
                CourseID = course.CourseID,
                Title = course.Title,
                Description = course.Description,
                Syllabus = course.Syllabus,
                Level = course.Level,
                Language = course.Language,
                Duration = course.Duration,
                ThumbnailURL = course.ThumbnailURL,
                CategoryID = course.CategoryID,
                CourseMaterialUrl = course.CourseMaterialUrl,
                CourseMaterialFileName = course.CourseMaterialFileName,
                Published = course.Published,
                Rating = course.Rating,
                ReviewCount = course.ReviewCount,
                Lessons = course.Lessons
                                .Where(l => !l.IsDeleted)
                                .OrderBy(l => l.OrderIndex)
                                .Select(l => new LessonDto
                                {
                                    LessonID = l.LessonID,
                                    Title = l.Title,
                                    Content = l.Content,
                                    VideoURL = l.VideoURL,
                                    LessonAttachmentUrl = l.LessonAttachmentUrl,
                                    LessonAttachmentFileName = l.LessonAttachmentFileName,
                                    OrderIndex = l.OrderIndex,
                                    LessonType = l.LessonType,
                                    EstimatedTime = l.EstimatedTime
                                }).ToList()

            };
        }

        public async Task<IEnumerable<CourseDto>> GetAllCoursesAsync()
        {
            var courses = await courseRepository.GetAllCoursesAsync();
            var courseDtos = new List<CourseDto>();
            foreach (var course in courses) 
            {
                courseDtos.Add(new CourseDto
                {
                    CourseID = course.CourseID,
                    Title = course.Title,
                    Description = course.Description,
                    Syllabus = course.Syllabus,
                    Level = course.Level,
                    Language = course.Language,
                    Duration = course.Duration,
                    ThumbnailURL = course.ThumbnailURL,
                    CategoryID = course.CategoryID,
                    CourseMaterialUrl = course.CourseMaterialUrl,
                    CourseMaterialFileName = course.CourseMaterialFileName,
                    Published = course.Published,
                    Rating = course.Rating,
                    ReviewCount = course.ReviewCount
                });
            }
            return courseDtos;
        }

        public async Task<bool> UpdateCourseAsync(CourseDto courseDto)
        {
            var course = await courseRepository.GetCourseByIdAsync(courseDto.CourseID);
            if (course == null) return false;

            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.Syllabus = courseDto.Syllabus;
            course.Level = courseDto.Level;
            course.Language = courseDto.Language;
            course.Duration = courseDto.Duration;
            course.ThumbnailURL = courseDto.ThumbnailURL;
            course.CategoryID = courseDto.CategoryID;
            course.CourseMaterialUrl = courseDto.CourseMaterialUrl;
            course.CourseMaterialFileName = courseDto.CourseMaterialFileName;
            course.Published = courseDto.Published;

            return await courseRepository.UpdateCourseAsync(course);
        }

        public async Task<bool> DeleteCourseAsync(int id)
        {
            return await courseRepository.DeleteCourseAsync(id);
        }

        public Task<bool> UpdateCourseStatusAsync(int courseId, UpdateCourseStatusDto updateCourseStatusDto)
        {
            var course = courseRepository.GetCourseByIdAsync(courseId).Result;
            if (course == null) return Task.FromResult(false);

            course.Published = updateCourseStatusDto.Published;

            return courseRepository.UpdateCourseStatusAsync(course);
        }

        public async Task<bool> UpdateCourseMaterialAsync(int courseId, string fileUrl, string fileName)
        {
            var course = await courseRepository.GetCourseByIdAsync(courseId);
            if (course == null) return false;

            course.CourseMaterialUrl = fileUrl;
            course.CourseMaterialFileName = fileName;
            course.UpdatedAt = DateTime.UtcNow;

            return await courseRepository.UpdateCourseAsync(course);
        }
    }
}
