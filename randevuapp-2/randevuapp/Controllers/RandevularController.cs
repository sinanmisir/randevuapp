using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using randevuapp.Data;
using randevuapp.Dtos;
using randevuapp.Models;
using randevuapp.Services;

namespace randevuapp.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RandevularController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SmsService _sms;

    public RandevularController(AppDbContext db, SmsService sms)
    {
        _db = db;
        _sms = sms;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRandevuDto dto)
    {
        var phone = User.FindFirst("phone")?.Value;
        if (string.IsNullOrWhiteSpace(phone))
            return Unauthorized();

        var hizmet = await _db.Hizmetler.FindAsync(dto.HizmetId);
        if (hizmet == null)
            return BadRequest(new { message = "Hizmet bulunamadı." });

        // Slot’u dakikaya sabitle (saniye/ms temizle)
        var slot = new DateTime(
            dto.RandevuTarih.Year, dto.RandevuTarih.Month, dto.RandevuTarih.Day,
            dto.RandevuTarih.Hour, dto.RandevuTarih.Minute, 0
        );

        // Aynı hizmet + aynı dakika çakışması
        var exists = await _db.Randevular.AnyAsync(x =>
            x.RandevuHizmetId == dto.HizmetId &&
            EF.Functions.DateDiffMinute(x.RandevuTarih, slot) == 0
        );

        if (exists)
            return BadRequest(new { message = "Bu hizmet için bu dakika dolu." });

        var randevu = new Randevu
        {
            RandevuAdi = dto.Ad,
            RandevuSoyadi = dto.Soyad,
            RandevuHizmetId = dto.HizmetId,
            RandevuTarih = slot,
            RandevuOlusturulmaZamani = DateTime.Now,
            Telefon = phone // ✅ EKLENDİ
        };

        _db.Randevular.Add(randevu);
        await _db.SaveChangesAsync();

        var msg = $"{dto.Ad} {dto.Soyad}, {slot:dd.MM.yyyy HH:mm} tarihli {hizmet.HizmetAdi} randevunuz oluşturuldu.";
        await _sms.SendSingleTextSmsAsync(phone, msg);

        _db.Sms.Add(new SmsLog
        {
            SmsZaman = DateTime.Now,
            SmsTip = "2",
            SmsMesaj = msg
        });
        await _db.SaveChangesAsync();

        return Ok(new { randevuId = randevu.RandevuId });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Randevular
            .AsNoTracking()
            .Include(x => x.Hizmet)
            .OrderByDescending(x => x.RandevuOlusturulmaZamani)
            .Select(x => new
            {
                x.RandevuId,
                x.RandevuAdi,
                x.RandevuSoyadi,
                Telefon = x.Telefon,
                x.RandevuHizmetId,
                HizmetAdi = x.Hizmet != null ? x.Hizmet.HizmetAdi : null,
                x.RandevuTarih,
                x.RandevuOlusturulmaZamani

            })
            .ToListAsync();

        return Ok(list);
    }
}