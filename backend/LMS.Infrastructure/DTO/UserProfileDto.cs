using LMS.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
        public string ProfilePicture { get; set; }
        public int Role { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime? UpdatedAt { get; set; }


        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
