using AutoMapper;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.Api.Dtos;
using DatingApp.Api.Helpers;
using DatingApp.Api.Models;

namespace DatingApp.Api.Dtos
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    public class PhotosController : Controller
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly Cloudinary _cloudinary;

        public PhotosController(IDatingRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _repo = repo;
            _mapper = mapper;

            Account acc = new Account(cloudinaryConfig.Value.CloudName, cloudinaryConfig.Value.ApiKey, cloudinaryConfig.Value.ApiSecret);

            _cloudinary = new Cloudinary(acc);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photo = await _repo.GetPhoto(id);
            return Ok(_mapper.Map<PhotoForReturnDto>(photo));
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, PhotoForCreationDto photoDto)
        {
            var user = await _repo.GetUser(userId);

            if (user == null)
                return BadRequest("Could not find user");

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (user.Id != currentUserId)
                return Unauthorized();

            var uploadResult = new ImageUploadResult();
            if (photoDto.File.Length > 0)
            {
                using (var stream = photoDto.File.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(photoDto.File.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoDto.Url = uploadResult.Uri.ToString();
            photoDto.PublicId = uploadResult.PublicId;

            var photo = _mapper.Map<Photo>(photoDto);
            photo.User = user;

            if (!user.Photos.Any(m => m.IsMain))
                photo.IsMain = true;

            user.Photos.Add(photo);


            if (await _repo.SaveAll())
            {
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var existingPhoto = await _repo.GetPhoto(id);

            if (existingPhoto == null)
                return NotFound();

            if (existingPhoto.IsMain)
                return BadRequest("This is already the main photo");

            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
            if (currentMainPhoto != null)
                currentMainPhoto.IsMain = false;

            existingPhoto.IsMain = true;
            if (await _repo.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var existingPhoto = await _repo.GetPhoto(id);

            if (existingPhoto == null)
                return NotFound();

            if (existingPhoto.IsMain)
                return BadRequest("you can't delete the main photo");

            bool ifDeleted = true;
            if (existingPhoto.PublicId != null)
            {
                var deleteParams = new DeletionParams(existingPhoto.PublicId);
                var result = _cloudinary.Destroy(deleteParams);
                if (result.Result != "ok")
                    ifDeleted = false;
            }

            if (ifDeleted)
                _repo.Delete(existingPhoto);

            if (await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed to delete the photo");
        }
    }
}
