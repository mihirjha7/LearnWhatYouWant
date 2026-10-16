using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace LMS.UnitTests;

public class EnrollmentServiceTests
{
    private static LmsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LmsDbContext>()
            .UseInMemoryDatabase($"lms-tests-{Guid.NewGuid()}")
            .Options;

        return new LmsDbContext(options);
    }

    private static async Task<(LmsDbContext Context, int UserId, int CourseId)> SeedAsync(bool published = true)
    {
        var context = CreateContext();

        var user = new User
        {
            Name = "Test Student",
            Email = $"student{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            IsActive = true
        };

        var category = new CourseCategory { Name = "General" };
        var course = new Course { Title = "Test Course", Category = category, Published = published };

        context.Users.Add(user);
        context.Categories.Add(category);
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        return (context, user.UserID, course.CourseID);
    }

    [Fact]
    public async Task EnrollAsync_CreatesEnrollment_WhenCourseIsPublished()
    {
        var (context, userId, courseId) = await SeedAsync();
        var service = new EnrollmentService(context);

        var result = await service.EnrollAsync(courseId, userId);

        Assert.True(result.IsSuccess);
        Assert.True(await context.Enrollments.AnyAsync(e => e.UserID == userId && e.CourseID == courseId));
    }

    [Fact]
    public async Task EnrollAsync_Fails_WhenAlreadyEnrolled()
    {
        var (context, userId, courseId) = await SeedAsync();
        var service = new EnrollmentService(context);

        await service.EnrollAsync(courseId, userId);
        var result = await service.EnrollAsync(courseId, userId);

        Assert.True(result.IsFailure);
        Assert.Equal("Enrollment.AlreadyEnrolled", result.Error!.Code);
    }

    [Fact]
    public async Task EnrollAsync_Fails_WhenCourseIsNotPublished()
    {
        var (context, userId, courseId) = await SeedAsync(published: false);
        var service = new EnrollmentService(context);

        var result = await service.EnrollAsync(courseId, userId);

        Assert.True(result.IsFailure);
        Assert.Equal("Enrollment.CourseNotPublished", result.Error!.Code);
    }

    [Fact]
    public async Task EnrollAsync_Fails_WhenCourseDoesNotExist()
    {
        var (context, userId, _) = await SeedAsync();
        var service = new EnrollmentService(context);

        var result = await service.EnrollAsync(9999, userId);

        Assert.True(result.IsFailure);
        Assert.Equal("Enrollment.CourseNotFound", result.Error!.Code);
    }

    [Fact]
    public async Task GetEnrolledCoursesAsync_ReturnsCourseDtos()
    {
        var (context, userId, courseId) = await SeedAsync();
        var service = new EnrollmentService(context);
        await service.EnrollAsync(courseId, userId);

        var result = await service.GetEnrolledCoursesAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Test Course", result.Value[0].Title);
    }
}
