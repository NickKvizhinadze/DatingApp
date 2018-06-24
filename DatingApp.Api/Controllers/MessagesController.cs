using AutoMapper;
using DatingApp.Api.Dtos;
using DatingApp.Api.Helpers;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DatingApp.Api.Dtos
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    public class MessagesController : Controller
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        [HttpGet("{id}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var result = await _repo.GetMessage(id);
            if (result == null)
                return NotFound();

            return Ok(_mapper.Map<MessageCreationDto>(result));
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, MessageParams messageParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messages = await _repo.GetMessagesForUser(messageParams);

            var result = _mapper.Map<IEnumerable<MessageDto>>(messages);
            Response.AddPagination(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages);

            return Ok(result);
        }

        [HttpGet("thread/{id}")]
        public async Task<IActionResult> GetMessageThread(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messages = await _repo.GetMessagesThread(userId, id);
            var result = _mapper.Map<IEnumerable<MessageDto>>(messages);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, [FromBody] MessageCreationDto model)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            model.SenderId = userId;

            var recipient = await _repo.GetUser(model.RecipientId);
            var sender = await _repo.GetUser(model.SenderId);
            if (recipient == null)
                return BadRequest("Could not find recipient");

            var message = _mapper.Map<Message>(model);

            _repo.Add(message);

            var result = _mapper.Map<MessageDto>(message);
            if (await _repo.SaveAll())
                return CreatedAtRoute("GetMessage", new { id = message.Id }, result);

            throw new Exception("Creating the message faild on Save");
        }

    }
}
