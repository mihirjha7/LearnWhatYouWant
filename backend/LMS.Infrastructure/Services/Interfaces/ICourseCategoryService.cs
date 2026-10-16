using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface ICourseCategoryService
    {
        Task<CourseCategoryDto> CreateCategoryAsync(CreateCourseCategoryDto createCourseCategoryDto);
        Task<CourseCategoryDto?> GetCategoryByIdAsync(int id);
        Task<List<CourseCategoryDto>> GetAllCategoriesAsync();
        Task<CourseCategoryDto?> UpdateCategoryAsync(int id, CourseCategoryDto courseCategoryDto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}
