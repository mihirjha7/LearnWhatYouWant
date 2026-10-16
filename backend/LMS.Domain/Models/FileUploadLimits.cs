using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Models
{
    public class FileUploadLimits
    {
        public long ProfileImageMaxSize { get; set; }
        public long DocumentMaxSize { get; set; }
    }
}
