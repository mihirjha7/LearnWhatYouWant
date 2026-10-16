using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Services
{
    public class MessageService : IMessageService
    {
        private const int MaxMessageLength = 4000;

        private readonly LmsDbContext _dbContext;

        public MessageService(LmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result> SendMessageAsync(int senderId, SendMessageDto request)
        {
            if (!int.TryParse(request.ReceiverId, out var receiverId))
            {
                return Result.Failure(Error.Validation(
                    "Message.InvalidReceiver",
                    "The receiver identifier is not valid."));
            }

            if (receiverId == senderId)
            {
                return Result.Failure(Error.Validation(
                    "Message.SelfMessage",
                    "A message cannot be sent to yourself."));
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return Result.Failure(Error.Validation(
                    "Message.EmptyContent",
                    "The message content is required."));
            }

            if (request.Content.Length > MaxMessageLength)
            {
                return Result.Failure(Error.Validation(
                    "Message.ContentTooLong",
                    $"The message content cannot exceed {MaxMessageLength} characters."));
            }

            var receiverExists = await _dbContext.Users.AnyAsync(u => u.UserID == receiverId);
            if (!receiverExists)
            {
                return Result.Failure(Error.NotFound("Message.ReceiverNotFound", "The recipient was not found."));
            }

            _dbContext.Messages.Add(new Message
            {
                SenderID = senderId,
                ReceiverID = receiverId,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });

            await _dbContext.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IReadOnlyList<MessageDto>>> GetConversationAsync(int userId, int otherUserId)
        {
            var messages = await _dbContext.Messages
                .AsNoTracking()
                .Where(m =>
                    (m.SenderID == userId && m.ReceiverID == otherUserId) ||
                    (m.SenderID == otherUserId && m.ReceiverID == userId))
                .OrderBy(m => m.CreatedAt)
                .Select(m => new MessageDto
                {
                    SenderName = m.Sender.Name,
                    Content = m.Content,
                    SentAt = m.CreatedAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();

            return Result.Success<IReadOnlyList<MessageDto>>(messages);
        }
    }
}
