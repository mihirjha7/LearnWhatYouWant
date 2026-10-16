using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class Message
    {
        public int MessageID { get; set; }
        public int SenderID { get; set; }
        public User Sender { get; set; } = null!;
        public int ReceiverID { get; set; }
        public User Receiver { get; set; } = null!;
        public string Content { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? MessageType { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
