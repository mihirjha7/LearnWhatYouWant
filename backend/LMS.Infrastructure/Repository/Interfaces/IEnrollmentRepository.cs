using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IEnrollmentRepository
    {

        Task<bool> IsUserEnrolledAsync(int courseId, int userId);

        Task<bool> EnrollUserAsync(int courseId, int userId);

        Task<List<Course>> GetEnrolledCoursesAsync(int userId);


    }
}
