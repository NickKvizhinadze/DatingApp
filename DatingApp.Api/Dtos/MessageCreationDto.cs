using System;

namespace DatingApp.Api.Dtos
{
    public class MessageCreationDto
    {
        public MessageCreationDto()
        {
            DateSent = DateTime.Now;
        }

        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public DateTime DateSent { get; set; }
        public string Content { get; set; }
    }
}