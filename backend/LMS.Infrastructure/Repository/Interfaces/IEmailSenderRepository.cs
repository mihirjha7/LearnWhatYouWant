using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository.Interfaces
{
    public interface IEmailSenderRepository
    {
        Task SendResetLinkAsync(string toEmail, string link);

    }
}
