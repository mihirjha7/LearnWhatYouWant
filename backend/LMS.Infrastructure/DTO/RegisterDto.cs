using System.ComponentModel.DataAnnotations;

namespace LMS.Infrastructure.DTO
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [RegularExpression(@"^[a-zA-Z0-9\s@]+$", ErrorMessage = "Name can only contain letters, numbers, spaces, and @.")]
        [StringLength(100, ErrorMessage = "Name must be under 100 characters.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(100, ErrorMessage = "Email must be under 100 characters.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain uppercase, lowercase, digit, and special character.")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = null!;
    }
}
