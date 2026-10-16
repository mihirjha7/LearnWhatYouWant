using LMS.Infrastructure.Common;
using LMS.Infrastructure.Services;

namespace LMS.UnitTests;

public class PasswordHashingTests
{
    [Fact]
    public void HashPassword_DoesNotReturnPlaintext()
    {
        var hasher = new PasswordHashing();

        var hash = hasher.HashPassword("Str0ng!Password");

        Assert.NotEqual("Str0ng!Password", hash);
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact]
    public void VerifyPassword_ReturnsTrue_ForCorrectPassword()
    {
        var hasher = new PasswordHashing();
        var hash = hasher.HashPassword("Str0ng!Password");

        Assert.True(hasher.VerifyPassword(hash, "Str0ng!Password"));
    }

    [Fact]
    public void VerifyPassword_ReturnsFalse_ForIncorrectPassword()
    {
        var hasher = new PasswordHashing();
        var hash = hasher.HashPassword("Str0ng!Password");

        Assert.False(hasher.VerifyPassword(hash, "wrong-password"));
    }
}

public class ResultTests
{
    [Fact]
    public void Success_ExposesValue()
    {
        var result = Result.Success(42);

        Assert.True(result.IsSuccess);
        Assert.Equal(42, result.Value);
    }

    [Fact]
    public void Failure_ThrowsWhenValueAccessed()
    {
        var result = Result.Failure<int>(Error.NotFound("Test.NotFound", "missing"));

        Assert.True(result.IsFailure);
        Assert.Throws<InvalidOperationException>(() => result.Value);
    }
}
