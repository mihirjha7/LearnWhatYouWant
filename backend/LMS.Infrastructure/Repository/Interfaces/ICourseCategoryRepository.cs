using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface ICourseCategoryRepository
    {
        Task<CourseCategory> CreateCategoryAsync(CourseCategory courseCategory);
        Task<CourseCategory?> GetCategoryByIdAsync(int id);
        Task<CourseCategory?> GetCategoryByNameAsync(string name);
        Task<List<CourseCategory>> GetAllCategoriesAsync();
        Task<CourseCategory?> UpdateCategoryAsync(CourseCategory courseCategory);
        Task<bool> DeleteCategoryAsync(int id);
    }
}
