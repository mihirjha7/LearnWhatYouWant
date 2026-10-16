using LMS.Domain;
using LMS.Domain.Enums;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace LMS.UnitTests;

public class UserServiceTests
{
    private static LmsDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<LmsDbContext>()
            .UseInMemoryDatabase($"lms-users-{Guid.NewGuid()}")
            .Options);

    private static UserService CreateService(LmsDbContext context) =>
        new(context, new PasswordHashing());

    private static async Task<User> AddUserAsync(LmsDbContext context, UserRole role = UserRole.Student)
    {
        var user = new User
        {
            Name = "Test User",
            Email = $"user{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            IsActive = true,
            Role = role
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task GetProfileAsync_ReturnsProfile_WithoutPasswordHash()
    {
        using var context = CreateContext();
        var user = await AddUserAsync(context);

        var result = await CreateService(context).GetProfileAsync(user.UserID);

        Assert.True(result.IsSuccess);
        Assert.Equal(user.Email, result.Value.Email);
        Assert.DoesNotContain(nameof(User.PasswordHash), typeof(UserProfileDto).GetProperties().Select(p => p.Name));
    }

    [Fact]
    public async Task GetProfileAsync_Fails_WhenUserDoesNotExist()
    {
        using var context = CreateContext();

        var result = await CreateService(context).GetProfileAsync(4242);

        Assert.True(result.IsFailure);
        Assert.Equal("User.NotFound", result.Error!.Code);
    }

    [Fact]
    public async Task UpdateProfileAsync_PersistsChanges()
    {
        using var context = CreateContext();
        var user = await AddUserAsync(context);

        var result = await CreateService(context).UpdateProfileAsync(
            user.UserID,
            new UserUpdateProfileBioDto { Name = "Updated", Bio = "New bio" });

        Assert.True(result.IsSuccess);
        var updated = await context.Users.FindAsync(user.UserID);
        Assert.Equal("Updated", updated!.Name);
        Assert.Equal("New bio", updated.Bio);
        Assert.NotNull(updated.UpdatedAt);
    }

    [Fact]
    public async Task DeleteOwnAccountAsync_SoftDeletesAndDeactivates()
    {
        using var context = CreateContext();
        var user = await AddUserAsync(context);

        var result = await CreateService(context).DeleteOwnAccountAsync(user.UserID);

        Assert.True(result.IsSuccess);
        var deleted = await context.Users.IgnoreQueryFilters().FirstAsync(u => u.UserID == user.UserID);
        Assert.True(deleted.IsDeleted);
        Assert.False(deleted.IsActive);
    }

    [Fact]
    public async Task SoftDeletedUsers_AreExcludedByGlobalQueryFilter()
    {
        using var context = CreateContext();
        var user = await AddUserAsync(context);
        await CreateService(context).DeleteOwnAccountAsync(user.UserID);

        Assert.False(await context.Users.AnyAsync(u => u.UserID == user.UserID));
    }

    [Fact]
    public async Task CreateUserAsync_HashesPassword()
    {
        using var context = CreateContext();
        var email = $"new{Guid.NewGuid():N}@example.com";

        var result = await CreateService(context).CreateUserAsync(new CreateUserDto
        {
            Name = "Created",
            Email = email,
            Password = "Str0ng!Password"
        });

        Assert.True(result.IsSuccess);
        var created = await context.Users.FirstAsync(u => u.Email == email);
        Assert.NotEqual("Str0ng!Password", created.PasswordHash);
        Assert.True(new PasswordHashing().VerifyPassword(created.PasswordHash, "Str0ng!Password"));
    }

    [Fact]
    public async Task CreateUserAsync_Fails_WhenEmailAlreadyExists()
    {
        using var context = CreateContext();
        var user = await AddUserAsync(context);

        var result = await CreateService(context).CreateUserAsync(new CreateUserDto
        {
            Name = "Duplicate",
            Email = user.Email,
            Password = "Str0ng!Password"
        });

        Assert.True(result.IsFailure);
        Assert.Equal("User.EmailAlreadyRegistered", result.Error!.Code);
    }

    [Fact]
    public async Task GetUsersByRoleAsync_FiltersByRole()
    {
        using var context = CreateContext();
        await AddUserAsync(context, UserRole.Student);
        await AddUserAsync(context, UserRole.Instructor);

        var result = await CreateService(context).GetUsersByRoleAsync(UserRole.Instructor);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal((int)UserRole.Instructor, result.Value[0].Role);
    }

    [Fact]
    public async Task UpdateUserStatusAsync_Fails_ForUnknownEmail()
    {
        using var context = CreateContext();

        var result = await CreateService(context).UpdateUserStatusAsync("missing@example.com", false);

        Assert.True(result.IsFailure);
        Assert.Equal("User.NotFound", result.Error!.Code);
    }
}
