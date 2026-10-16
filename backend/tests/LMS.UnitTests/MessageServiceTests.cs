using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace LMS.UnitTests;

public class MessageServiceTests
{
    private static LmsDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<LmsDbContext>()
            .UseInMemoryDatabase($"lms-messages-{Guid.NewGuid()}")
            .Options);

    private static async Task<User> AddUserAsync(LmsDbContext context, string name)
    {
        var user = new User
        {
            Name = name,
            Email = $"{name}{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            IsActive = true
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task SendMessageAsync_PersistsMessage()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var receiver = await AddUserAsync(context, "receiver");
        var service = new MessageService(context);

        var result = await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = receiver.UserID.ToString(),
            Content = "Hello there"
        });

        Assert.True(result.IsSuccess);
        var message = await context.Messages.SingleAsync();
        Assert.Equal(sender.UserID, message.SenderID);
        Assert.Equal(receiver.UserID, message.ReceiverID);
        Assert.False(message.IsRead);
    }

    [Fact]
    public async Task SendMessageAsync_Fails_WhenReceiverDoesNotExist()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var service = new MessageService(context);

        var result = await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = "999999",
            Content = "Hello"
        });

        Assert.True(result.IsFailure);
        Assert.Equal("Message.ReceiverNotFound", result.Error!.Code);
    }

    [Fact]
    public async Task SendMessageAsync_Fails_WhenReceiverIdIsNotNumeric()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var service = new MessageService(context);

        var result = await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = "not-a-number",
            Content = "Hello"
        });

        Assert.True(result.IsFailure);
        Assert.Equal("Message.InvalidReceiver", result.Error!.Code);
    }

    [Fact]
    public async Task SendMessageAsync_Fails_WhenContentIsEmpty()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var receiver = await AddUserAsync(context, "receiver");
        var service = new MessageService(context);

        var result = await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = receiver.UserID.ToString(),
            Content = "   "
        });

        Assert.True(result.IsFailure);
        Assert.Equal("Message.EmptyContent", result.Error!.Code);
    }

    [Fact]
    public async Task SendMessageAsync_Fails_WhenSendingToSelf()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var service = new MessageService(context);

        var result = await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = sender.UserID.ToString(),
            Content = "Note to self"
        });

        Assert.True(result.IsFailure);
        Assert.Equal("Message.SelfMessage", result.Error!.Code);
    }

    [Fact]
    public async Task GetConversationAsync_ReturnsBothDirectionsInOrder()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var receiver = await AddUserAsync(context, "receiver");
        var service = new MessageService(context);

        await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = receiver.UserID.ToString(),
            Content = "First"
        });
        await service.SendMessageAsync(receiver.UserID, new SendMessageDto
        {
            ReceiverId = sender.UserID.ToString(),
            Content = "Second"
        });

        var result = await service.GetConversationAsync(sender.UserID, receiver.UserID);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.Count);
        Assert.Equal("First", result.Value[0].Content);
        Assert.Equal("Second", result.Value[1].Content);
    }

    [Fact]
    public async Task GetConversationAsync_ExcludesUnrelatedConversations()
    {
        using var context = CreateContext();
        var sender = await AddUserAsync(context, "sender");
        var receiver = await AddUserAsync(context, "receiver");
        var stranger = await AddUserAsync(context, "stranger");
        var service = new MessageService(context);

        await service.SendMessageAsync(sender.UserID, new SendMessageDto
        {
            ReceiverId = stranger.UserID.ToString(),
            Content = "Private"
        });

        var result = await service.GetConversationAsync(sender.UserID, receiver.UserID);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value);
    }
}
