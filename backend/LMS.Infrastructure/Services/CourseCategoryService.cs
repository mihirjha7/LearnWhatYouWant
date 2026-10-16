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
    public class CourseCategoryService : ICourseCategoryService
    {
        private readonly ICourseCategoryRepository categoryRepository;

        public CourseCategoryService(ICourseCategoryRepository categoryRepository)
        {
            this.categoryRepository = categoryRepository;
        }

        private static CourseCategoryDto ToDto(CourseCategory category) => new()
        {
            CategoryID = category.CategoryID,
            Name = category.Name,
            Description = category.Description
        };

        public async Task<CourseCategoryDto> CreateCategoryAsync(CreateCourseCategoryDto createCourseCategoryDto)
        {
            var existingCategory = await categoryRepository.GetCategoryByNameAsync(createCourseCategoryDto.Name);
            if (existingCategory != null)
            {
                throw new InvalidOperationException("Category with the same name already exists.");
            }
            var category = new CourseCategory
            {
                Name = createCourseCategoryDto.Name,
                Description = createCourseCategoryDto.Description
            };
            return ToDto(await categoryRepository.CreateCategoryAsync(category));
        }
        public async Task<CourseCategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await categoryRepository.GetCategoryByIdAsync(id);
            return category is null ? null : ToDto(category);
        }
        public async Task<List<CourseCategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await categoryRepository.GetAllCategoriesAsync();
            return categories.Select(ToDto).ToList();
        }
        public async Task<CourseCategoryDto?> UpdateCategoryAsync(int id, CourseCategoryDto courseCategoryDto)
        {
            var existingCategory = await categoryRepository.GetCategoryByIdAsync(id);
            if (existingCategory == null)
            {
                return null;
            }
            var categoryWithSameName = await categoryRepository.GetCategoryByNameAsync(courseCategoryDto.Name);
            if (categoryWithSameName != null && categoryWithSameName.CategoryID != id)
            {
                throw new InvalidOperationException("Category with the same name already exists.");
            }
            existingCategory.Name = courseCategoryDto.Name;
            existingCategory.Description = courseCategoryDto.Description;
            return ToDto(await categoryRepository.UpdateCategoryAsync(existingCategory));
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var existingCategory = await categoryRepository.GetCategoryByIdAsync(id);
            if (existingCategory == null)
            {
                return false;
            }
            await categoryRepository.DeleteCategoryAsync(id);
            return true;
        }
    }
}
