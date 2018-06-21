using DatingApp.Api.Helpers;
using DatingApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DatingApp.Api.Dtos
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;
        Task<bool> SaveAll();

        Task<PagedList<User>> GetUsers(UserParams userParams);

        Task<User> GetUser(int id);

        Task<Photo> GetPhoto(int id);
        Task<Photo> GetMainPhotoForUser(int userId);
        Task<Like> GetLike(int userId, int recipientId);
        Task<PagedList<User>> GetUserLikes(UserParams userParams);
        Task<Message> GetMessage(int id);
        Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessagesThread(int userId, int recipientId);
    }
}
