using System.ComponentModel.DataAnnotations;

namespace LMS.Infrastructure.Options
{
    public sealed class JwtOptions
    {
        public const string SectionName = "JwtConfig";

        [Required]
        public string Issuer { get; init; } = string.Empty;

        [Required]
        public string Audience { get; init; } = string.Empty;

        [Required]
        [MinLength(32)]
        public string Key { get; init; } = string.Empty;

        [Range(1, 1440)]
        public int TokenValidityMins { get; init; } = 60;
    }
}
