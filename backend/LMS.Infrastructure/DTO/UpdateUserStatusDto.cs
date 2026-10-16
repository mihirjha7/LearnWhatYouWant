using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class UpdateUserStatusDto
    {
        public string Email { get; set; }
        public bool IsActive { get; set; }
    }
}
