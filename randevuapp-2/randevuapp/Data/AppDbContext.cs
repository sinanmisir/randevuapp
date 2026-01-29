using Microsoft.EntityFrameworkCore;
using randevuapp.Models;

namespace randevuapp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Hizmet> Hizmetler => Set<Hizmet>();
    public DbSet<Randevu> Randevular => Set<Randevu>();
    public DbSet<SmsLog> Sms => Set<SmsLog>();
}