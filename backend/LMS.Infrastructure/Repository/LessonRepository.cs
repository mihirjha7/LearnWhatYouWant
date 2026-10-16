using LMS.Infrastructure.Repository.Interfaces;
using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Repository
{
    public class LessonRepository : ILessonRepository
    {
        private readonly LmsDbContext dbContext;
        public LessonRepository(LmsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IEnumerable<Lesson>> GetLessonsByCourseAsync(int courseId)
        {
            var lessons = await dbContext.Lessons
                .Where(l => l.CourseID == courseId && !l.IsDeleted)
                .OrderBy(l => l.OrderIndex)
                .ToListAsync();

            return lessons;
        }

        public async Task<Lesson?> GetLessonByIdAsync(int lessonId)
        {
            var lesson = await dbContext.Lessons.FindAsync(lessonId);
            if (lesson == null || lesson.IsDeleted)
            {
                return null;
            }
            return lesson;
        }

        public async Task<Lesson> CreateLessonAsync(Lesson lesson)
        {
            lesson.CreatedAt = DateTime.UtcNow;
            await dbContext.Lessons.AddAsync(lesson);
            await dbContext.SaveChangesAsync();
            return lesson;
        }

        //to check

        public async Task<Lesson> UpdateLessonAsync(Lesson lesson)
        {
            lesson.UpdatedAt = DateTime.UtcNow;
            dbContext.Lessons.Update(lesson);
            await dbContext.SaveChangesAsync();
            return lesson;
        }


        public async Task<Lesson?> DeleteLessonAsync(int lessonId)
        {
            var lesson = await dbContext.Lessons.FindAsync(lessonId);
           if (lesson == null || lesson.IsDeleted)
            {
                return null;
            }
            lesson.IsDeleted = true;
            lesson.UpdatedAt = DateTime.UtcNow;
            dbContext.Lessons.Update(lesson);
            await dbContext.SaveChangesAsync();
            return lesson;
        }

    }
}
