using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface ICourseRepository
    {
        Task<Course> AddCourseAsync(Course course, int userId);
        Task<Course?> GetCourseByIdAsync(int id);
        Task<IEnumerable<Course>> GetAllCoursesAsync();
        Task<bool> UpdateCourseAsync(Course course);
        Task<bool> UpdateCourseStatusAsync(Course course);
        Task<bool> DeleteCourseAsync(int id);

    }
}
