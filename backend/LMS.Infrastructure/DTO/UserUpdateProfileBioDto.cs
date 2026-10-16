using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.DTO
{
    public class UserUpdateProfileBioDto
    {
        public string Name { get; set; }

        [MaxLength(1000)]
        public string Bio { get; set; } 
    }
}