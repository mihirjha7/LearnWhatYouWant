using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository
{
    public class CourseRepository : ICourseRepository
    {
        private readonly LmsDbContext dbContext;

        public CourseRepository(LmsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<Course> AddCourseAsync(Course course, int userId)
        {
            dbContext.Courses.Add(course);
            await dbContext.SaveChangesAsync();
            CourseInstructor courseInstructor = new CourseInstructor{CourseID =course.CourseID, UserID=userId, AssignedAt = DateTime.Now };
            dbContext.CourseInstructors.Add(courseInstructor);
            await dbContext.SaveChangesAsync();
            return course;
        }

        public async Task<bool> DeleteCourseAsync(int id)
        {
            var course = await dbContext.Courses.FindAsync(id);
            if (course == null) return false;

            dbContext.Courses.Remove(course);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Course>> GetAllCoursesAsync()
        {
            return await dbContext.Courses
                .Include(c => c.Category)
                .ToListAsync();
        }

        public async Task<Course?> GetCourseByIdAsync(int id)
        {
            return await dbContext.Courses.Include(c => c.Category)
                                          .Include(c => c.Lessons)
                                          .FirstOrDefaultAsync(c => c.CourseID == id && !c.IsDeleted);

        }

        public async Task<bool> UpdateCourseAsync(Course course)
        {
            dbContext.Courses.Update(course);
            await dbContext.SaveChangesAsync();
            return true;
        }

        

        public async Task<bool> UpdateCourseStatusAsync(Course course)
        {
            dbContext.Courses.Update(course);
            await dbContext.SaveChangesAsync();
            return true;
        }
    }
}
