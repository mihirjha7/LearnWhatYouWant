using System.Security.Claims;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace LMS.API.Services
{
    public sealed class HttpCurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        public int? UserId
        {
            get
            {
                var claim = httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(claim, out var userId) ? userId : null;
            }
        }

        public string? Role => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

        public bool IsAuthenticated =>
            httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public int GetRequiredUserId() =>
            UserId ?? throw new UnauthorizedAccessException("The request does not contain a valid user identifier.");
    }
}
