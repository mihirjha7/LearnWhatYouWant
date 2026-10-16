using LMS.Domain;
using LMS.Domain.Models;
using LMS.Infrastructure.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository
{
    public class MessageRepository : IMessageRepository
    {
        private readonly LmsDbContext _context;

        public MessageRepository(LmsDbContext context)
        {
            _context = context;
        }

        public async Task SendMessageAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Message>> GetMessagesAsync(string userId, string otherUserId)
        {
            return await _context.Messages
                .Where(m => (m.SenderID == Convert.ToInt32(userId) && m.ReceiverID == Convert.ToInt32(otherUserId)) ||
                            (m.SenderID == Convert.ToInt32(otherUserId) && m.ReceiverID == Convert.ToInt32(userId)))
                .Include(m => m.Sender)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }
    }

}
