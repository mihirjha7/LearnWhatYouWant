using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using System.Security.Claims;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService lessonService;
        private readonly IFileUploadService _fileUploadService;
        private readonly FileUploadLimits _limits;

        public LessonController(ILessonService lessonService, IFileUploadService fileService, IOptions<FileUploadLimits> limits)
        {
            this.lessonService = lessonService;
            this._fileUploadService = fileService;
            _limits = limits.Value;

        }

        // Implementation goes here
        [HttpPost]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> CreateLessonAsync([FromBody] CreateLessonDto createLessonDto)
        {
            var lesson = await lessonService.CreateLessonAsync(createLessonDto);
            return Ok(lesson);
        }

        [HttpGet("id/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLessonByIdAsync(int id)
        {
            var lesson = await lessonService.GetLessonByIdAsync(id);
            if (lesson == null) return NotFound();
            return Ok(lesson);
        }

        [HttpGet("{courseId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLessonsByCourseAsync(int courseId)
        {
            var lessons = await lessonService.GetLessonsByCourseAsync(courseId);
            return Ok(lessons);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> UpdateLessonAsync(int id, [FromBody] LessonDto lessonDto)
        {
            var success = await lessonService.UpdateLessonAsync(lessonDto);
            if (success == null)
            {
                return NoContent();
            }
            return Ok(success);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteLessonAsync(int id)
        {
            var success = await lessonService.DeleteLessonAsync(id);
            if (success==null)
            {
                return NoContent();
            }
            return Ok(success);
        }

        // --- Inside LessonController.cs ---

        [HttpPost("{lessonId}/document")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> UploadLessonAttachment(int lessonId, IFormFile file)
        {
            if (file == null)
                return BadRequest(new { Message = "No file received" });

            try
            {
                // 1. Save the file and get the public URL (Assuming SaveFileAsync returns the URL)
                var fileUrl = await _fileUploadService.SaveFileAsync(file, _limits.DocumentMaxSize);
                var originalFileName = file.FileName;

                // 2. Validate user/authorization (Similar to other controller actions)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                // 3. Call a new service method to update the Lesson's attachment URL
                // NOTE: You must create this UpdateLessonAttachmentAsync method in your LessonService.
                var success = await lessonService.UpdateLessonAttachmentAsync(lessonId, fileUrl, originalFileName);

                if (!success)
                    return NotFound(new { Message = "Lesson record not found or unauthorized to modify." });

                // 4. Return the required response structure for the frontend
                // Frontend expects { Url: string, FileName: string, Message: string }
                return Ok(new { Url = fileUrl, FileName = originalFileName, Message = "Lesson attachment uploaded and URL saved." });
            }
            catch (Exception ex)
            {
                // Handle file size limits or other upload errors
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}

