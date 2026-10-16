using LMS.Domain;
using LMS.Infrastructure.DTO;
using LMS.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace LMS.Infrastructure.Services
{
    public class JwtService
    {
        private readonly JwtOptions _jwtOptions;
        private readonly LmsDbContext _dbContext;
        private readonly PasswordHashing _passwordHashing;
        public JwtService(IOptions<JwtOptions> jwtOptions, LmsDbContext dbContext, PasswordHashing passwordHashing)
        {
            _jwtOptions = jwtOptions.Value;
            _dbContext = dbContext;
            _passwordHashing = passwordHashing;
        }

        public async Task<LoginResponseModelDto> Authenticate(LoginDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return null;

            }
            var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.Email == request.Email);
            if (user == null)
            {
                return null;
            }

            var passcheck = _passwordHashing.VerifyPassword(user.PasswordHash, request.Password);

            if (!passcheck)
            {
                return null;
            }

            if (user.IsActive == false){
                return null;
            }

            // Adding the login actice stamp
            //user.IsActive = true;

            // Inserting the last login time
            user.LastLogin = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();


            var tokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(_jwtOptions.TokenValidityMins);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                     new Claim(JwtRegisteredClaimNames.Name, request.Email),
                     new Claim(ClaimTypes.Role, user.Role.ToString()),
                     new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString())                 }
                ),
                Expires = tokenExpiryTimeStamp,
                Issuer = _jwtOptions.Issuer,
                Audience = _jwtOptions.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key)),
                SecurityAlgorithms.HmacSha512Signature),
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(securityToken);
            return new LoginResponseModelDto
            {
                AccessToken = accessToken,
                EmailPasswordCredential = request.Email,
                ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds,
                Role = user.Role.ToString(),
                UserId = user.UserID,
                Email = user.Email
            };
        }

    }
}
