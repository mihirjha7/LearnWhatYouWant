using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.DTO
{
    public class PasswordChangeDto
    {
        public string token { get; set; }
        public string password { get; set; }
    }
}
