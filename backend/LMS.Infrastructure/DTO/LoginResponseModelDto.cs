using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class LoginResponseModelDto
    {
        public string AccessToken { get; set; }
        public string EmailPasswordCredential { get; set; }
        public int ExpiresIn { get; set; }
        public string Role { get; set; }           // Add this
        public int UserId { get; set; }

        public string Email { get; set; }
    }
}
