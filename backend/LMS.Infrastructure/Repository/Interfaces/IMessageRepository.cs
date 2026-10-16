using LMS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IMessageRepository
    {
        Task SendMessageAsync(Message message);
        Task<List<Message>> GetMessagesAsync(string userId, string otherUserId);
    }

}
