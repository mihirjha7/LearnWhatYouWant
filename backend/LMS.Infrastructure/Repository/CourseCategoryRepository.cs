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
    public class CourseCategoryRepository : ICourseCategoryRepository
    {
        private readonly LmsDbContext dbContext;

        public CourseCategoryRepository(LmsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        public async Task<CourseCategory> CreateCategoryAsync(CourseCategory courseCategory)
        {
            await dbContext.Categories.AddAsync(courseCategory);
            await dbContext.SaveChangesAsync();
            return courseCategory;
        }

        public async Task<CourseCategory?> GetCategoryByIdAsync(int id)
        {
            return await dbContext.Categories.FindAsync(id);
        }
        public async Task<CourseCategory?> GetCategoryByNameAsync(string name)
        {
            return await dbContext.Categories.FirstOrDefaultAsync(c => c.Name == name);
        }

        public async Task<List<CourseCategory>> GetAllCategoriesAsync()
        {
            return await dbContext.Categories.ToListAsync();
        }


        public async Task<CourseCategory?> UpdateCategoryAsync(CourseCategory courseCategory)
        {
            dbContext.Categories.Update(courseCategory);
            await dbContext.SaveChangesAsync();
            return courseCategory;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await GetCategoryByIdAsync(id);
            if (category != null)
            {
                dbContext.Categories.Remove(category);
                await dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}
