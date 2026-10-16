using LMS.API.Common;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {

        private readonly IMessageService _messageService;
        private readonly ICurrentUserService _currentUser;

        public MessagesController(IMessageService messageService, ICurrentUserService currentUser)
        {
            _messageService = messageService;
            _currentUser = currentUser;
        }


        [HttpPost("send")]
        [Authorize(Roles = "Instructor,Student")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var result = await _messageService.SendMessageAsync(_currentUser.GetRequiredUserId(), dto);
            return result.ToActionResult(this);
        }




        [HttpGet("conversation/{otherUserId:int}")]
        [Authorize(Roles = "Instructor,Student")]
        public async Task<IActionResult> GetConversation(int otherUserId)
        {
            var result = await _messageService.GetConversationAsync(_currentUser.GetRequiredUserId(), otherUserId);
            return result.ToActionResult(this);
        }

    }
}
