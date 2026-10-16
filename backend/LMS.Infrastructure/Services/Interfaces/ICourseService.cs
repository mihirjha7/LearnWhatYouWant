using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, int userId);
        Task<CourseDto> GetCourseByIdAsync(int id);
        Task<IEnumerable<CourseDto>> GetAllCoursesAsync();
        Task<bool> UpdateCourseAsync(CourseDto courseDto);
        Task<bool> UpdateCourseMaterialAsync(int courseId, string fileUrl, string fileName);
        Task<bool> UpdateCourseStatusAsync(int courseId, UpdateCourseStatusDto updateCourseStatusDto);
        Task<bool> DeleteCourseAsync(int id);
    }
}
