using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using randevuapp.Data;
using randevuapp.Dtos;
using randevuapp.Models;
using randevuapp.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace randevuapp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMemoryCache _cache;
    private readonly SmsService _sms;
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IMemoryCache cache,
        SmsService sms,
        IConfiguration config,
        AppDbContext db,
        ILogger<AuthController> logger)
    {
        _cache = cache;
        _sms = sms;
        _config = config;
        _db = db;
        _logger = logger;
    }

    [HttpPost("request-code")]
    public async Task<IActionResult> RequestCode([FromBody] RequestCodeDto dto)
    {
        try
        {
            var phone = NormalizePhone(dto.Telefon);

            // Gateway için doğru format: 90XXXXXXXXXX
            if (string.IsNullOrWhiteSpace(phone) || !IsValidPhone(phone))
            {
                return BadRequest(new { message = "Geçerli bir telefon numarası girin (örn: 0535XXXXXXX)." });
            }

            var lastKey = $"otp:last:{phone}";
            if (_cache.TryGetValue<DateTime>(lastKey, out var lastTime))
            {
                var diff = DateTime.UtcNow - lastTime;
                var wait = 120 - (int)diff.TotalSeconds;
                if (wait > 0)
                    return BadRequest(new { message = $"Çok sık istek. {wait} saniye sonra tekrar deneyin." });
            }

            var code = GenerateOtpCode();
            var otpKey = $"otp:{phone}";

            _cache.Set(otpKey, code, TimeSpan.FromMinutes(5));
            _cache.Set(lastKey, DateTime.UtcNow, TimeSpan.FromSeconds(120));

            var msg = $"Doğrulama kodunuz: {code}";

            _logger.LogInformation("OTP oluşturuldu: {Phone} - Kod: {Code}", phone, code);

            var gatewayResp = await _sms.SendSingleTextSmsAsync(phone, msg);

            _db.Sms.Add(new SmsLog
            {
                SmsZaman = DateTime.Now,
                SmsTip = "1",
                SmsMesaj = msg
            });
            await _db.SaveChangesAsync();

            return Ok(new { message = "Kod gönderildi", gateway = gatewayResp });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "request-code hatası: {Phone}", dto.Telefon);
            return StatusCode(500, new { message = "Kod gönderilemedi. Lütfen tekrar deneyin." });
        }
    }

    [HttpPost("verify-code")]
    public IActionResult VerifyCode([FromBody] VerifyCodeDto dto)
    {
        try
        {
            var phone = NormalizePhone(dto.Telefon);
            var otpKey = $"otp:{phone}";

            if (!_cache.TryGetValue<string>(otpKey, out var saved) ||
                !string.Equals(saved, dto.Kod?.Trim(), StringComparison.Ordinal))
            {
                _logger.LogWarning("Hatalı OTP denemesi: {Phone} - Girilen: {Code}", phone, dto.Kod);
                return BadRequest(new { message = "Kod hatalı veya süresi dolmuş." });
            }

            _cache.Remove(otpKey);

            _logger.LogInformation("OTP doğrulandı: {Phone}", phone);

            var token = CreateJwt(phone);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "verify-code hatası: {Phone}", dto.Telefon);
            return StatusCode(500, new { message = "Doğrulama yapılamadı. Lütfen tekrar deneyin." });
        }
    }

    private string CreateJwt(string phone)
    {
        var key = _config["Jwt:Key"]!;
        var issuer = _config["Jwt:Issuer"]!;
        var audience = _config["Jwt:Audience"]!;
        var minutes = int.Parse(_config["Jwt:ExpireMinutes"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, phone),
            new Claim("phone", phone)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }

    private static string GenerateOtpCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(2);
        var num = BitConverter.ToUInt16(bytes, 0) % 9000 + 1000;
        return num.ToString();
    }

    // gateway formatı: 90 + 10 hane
    private static bool IsValidPhone(string phone)
    {
        var regex = new Regex(@"^90\d{10}$");
        return regex.IsMatch(phone);
    }

    // 0535... / 535... / +90535... / 90535... -> 90535...
    private static string NormalizePhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return phone;

        phone = phone.Replace(" ", "").Replace("+", "").Replace("(", "").Replace(")", "").Replace("-", "").Trim();

        if (phone.StartsWith("0") && phone.Length == 11)
            return "9" + phone;      // 0535... => 90535...

        if (phone.StartsWith("5") && phone.Length == 10)
            return "90" + phone;     // 535... => 90535...

        if (phone.StartsWith("90") && phone.Length == 12)
            return phone;

        return phone;
    }
}