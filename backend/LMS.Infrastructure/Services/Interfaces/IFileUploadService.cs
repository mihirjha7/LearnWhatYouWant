using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IFileUploadService
    {
        Task<string> SaveFileAsync(IFormFile file, long maxSizeBytes);

        Task<bool> SaveCourseDocumentAsync(int courseId, int instructorId, string fileName);
        byte[] GetFile(string fileName);
    }
}
