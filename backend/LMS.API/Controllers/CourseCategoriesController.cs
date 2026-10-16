using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseCategoriesController : ControllerBase
    {
        private readonly ICourseCategoryService courseCategoryService;

        public CourseCategoriesController(ICourseCategoryService courseCategoryService)
        {
            this.courseCategoryService = courseCategoryService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCourseCategoryDto createCourseCcategoryDto)
        {
            var category = await courseCategoryService.CreateCategoryAsync(createCourseCcategoryDto);
            if (category == null)
            {
                return BadRequest(new { Message = "A category with this name already exists." });
            }

            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryID }, category);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await courseCategoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await courseCategoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CourseCategoryDto courseCategoryDto)
        {
            if (id != courseCategoryDto.CategoryID)
            {
                return BadRequest("Mismatch Category ID");
            }
            var updatedCategory = await courseCategoryService.UpdateCategoryAsync(id, courseCategoryDto);
            if (updatedCategory == null)
            {
                return NotFound();
            }
            return Ok(updatedCategory);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var isDeleted = await courseCategoryService.DeleteCategoryAsync(id);
            if (!isDeleted)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}
