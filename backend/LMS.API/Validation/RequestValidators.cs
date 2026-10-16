using FluentValidation;
using Infrastructure.DTO;
using LMS.Infrastructure.DTO;

namespace LMS.API.Validation
{
    public sealed class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
            RuleFor(x => x.Password).NotEmpty().MaximumLength(100);
        }
    }

    public sealed class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(100);
        }
    }

    public sealed class RegisterInstructorDtoValidator : AbstractValidator<RegisterInstructorDto>
    {
        public RegisterInstructorDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(100);
        }
    }

    public sealed class PasswordChangeDtoValidator : AbstractValidator<PasswordChangeDto>
    {
        public PasswordChangeDtoValidator()
        {
            RuleFor(x => x.token).NotEmpty();
            RuleFor(x => x.password).NotEmpty().MinimumLength(8).MaximumLength(100);
        }
    }

    public sealed class EnrollRequestDtoValidator : AbstractValidator<EnrollRequestDto>
    {
        public EnrollRequestDtoValidator()
        {
            RuleFor(x => x.CourseId).GreaterThan(0);
        }
    }

    public sealed class CreateCourseDtoValidator : AbstractValidator<CreateCourseDto>
    {
        public CreateCourseDtoValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.CategoryID).GreaterThan(0);
        }
    }

    public sealed class CreateCourseCategoryDtoValidator : AbstractValidator<CreateCourseCategoryDto>
    {
        public CreateCourseCategoryDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        }
    }
}
