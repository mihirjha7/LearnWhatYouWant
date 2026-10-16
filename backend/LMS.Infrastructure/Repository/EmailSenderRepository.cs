using LMS.Infrastructure.Repository.Interfaces;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Repository
{
    using SmtpClient = MailKit.Net.Smtp.SmtpClient;

    public class EmailSenderRepository : IEmailSenderRepository
    {

        private readonly IConfiguration _config;

        public EmailSenderRepository(IConfiguration config)

        {
            _config = config;
        }

        private class SmtpSettings

        {
            public string Host { get; set; }
            public int Port { get; set; }
            public string User { get; set; }
            public string Password { get; set; }
            public string FromEmail { get; set; }
            public string FromName { get; set; }

        }



        public async Task SendResetLinkAsync(string toEmail, string token)
        {
            var settings = _config.GetSection("smtp").Get<SmtpSettings>();

            var resetLink = $"http://localhost:4200/reset-password?token={token}";

            var message = new MimeMessage
            {
                From = { new MailboxAddress(settings.FromName, settings.FromEmail) },
                To = { new MailboxAddress("", toEmail) },
                Subject = "Password Reset Request",
                Body = new TextPart("plain")
                {
                    Text = $"Hi,\n\nWe received a request to reset your password. Click the link below to proceed:\n{resetLink}\n\nNote: This link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nOlms Team"
                }
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(settings.Host, settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(settings.User, settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
