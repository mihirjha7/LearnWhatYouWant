using LMS.Domain;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly string _uploadPath;
        private readonly LmsDbContext _context;

        public FileUploadService(LmsDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            

            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }


        public async Task<string> SaveFileAsync(IFormFile file, long maxSizeBytes)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");

            if (file.Length > maxSizeBytes)
                throw new ArgumentException($"File size exceeds the limit of {maxSizeBytes / (1024 * 1024)} MB.");

            string filePath = Path.Combine(_uploadPath, file.FileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            Console.WriteLine($"File saved: {filePath}");

            return file.FileName;
        }

        public byte[] GetFile(string fileName)
        {
            var filePath = Path.Combine(_uploadPath, fileName);

            if (!File.Exists(filePath))
                throw new FileNotFoundException("File not found.");

            return File.ReadAllBytes(filePath);
        }
        public async Task<bool> SaveCourseDocumentAsync(int courseId, int userId, string fileName)
        {
            var courseInstructor = await _context.CourseInstructors
                .FirstOrDefaultAsync(ci => ci.CourseID == courseId && ci.UserID == userId);

            if (courseInstructor == null)
                return false;

            courseInstructor.CourseMaterial = fileName;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
