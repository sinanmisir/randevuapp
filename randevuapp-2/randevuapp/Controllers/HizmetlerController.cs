using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using randevuapp.Data;
using Microsoft.AspNetCore.Authorization;
namespace randevuapp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HizmetlerController : ControllerBase
{
    private readonly AppDbContext _db;

    public HizmetlerController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Hizmetler.ToListAsync();
        return Ok(list);
    }
}