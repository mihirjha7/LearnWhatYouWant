using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly LmsDbContext _dbContext;

        public EnrollmentRepository(LmsDbContext context)
        {
            _dbContext = context;
        }
        public async Task<bool> EnrollUserAsync(int courseId, int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            var course = await _dbContext.Courses.FindAsync(courseId);

            if (user == null || course == null)
                return false;

            var alreadyEnrolled = await _dbContext.Enrollments.FirstOrDefaultAsync(e => e.UserID == userId && e.CourseID == courseId);

            if (alreadyEnrolled != null)
                return false;

            var enrollment = new Enrollment
            {
                UserID = userId,
                CourseID = courseId
            };

            _dbContext.Enrollments.Add(enrollment);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Course>> GetEnrolledCoursesAsync(int userId)
        {

            return await _dbContext.Enrollments
                        .Where(e => e.UserID == userId)
                        .Include(e => e.Course)
                        .Select(e => e.Course)
                        .ToListAsync();

        }

        public async Task<bool> IsUserEnrolledAsync(int courseId, int userId)
        {
            return await _dbContext.Enrollments.AnyAsync(e => e.UserID == userId && e.CourseID == courseId);
        }
    }
}
