using LMS.Infrastructure.Common;
using LMS.Infrastructure.DTO;

namespace LMS.Infrastructure.Services.Interfaces
{
    public interface IMessageService
    {
        Task<Result> SendMessageAsync(int senderId, SendMessageDto request);

        Task<Result<IReadOnlyList<MessageDto>>> GetConversationAsync(int userId, int otherUserId);
    }
}
