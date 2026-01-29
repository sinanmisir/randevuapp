using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace randevuapp.Models;

[Table("randevular")]
public class Randevu
{
    [Key]
    [Column("randevu_id")]
    public int RandevuId { get; set; }

    [MaxLength(50)]
    [Column("randevu_adi")]
    public string RandevuAdi { get; set; } = default!;

    [MaxLength(50)]
    [Column("randevu_soyadi")]
    public string RandevuSoyadi { get; set; } = default!;

    [Column("randevu_hizmet_id")]
    public int RandevuHizmetId { get; set; }

    [Column("randevu_tarih")]
    public DateTime RandevuTarih { get; set; }

    [Column("randevu_olusturulma_zamani")]
    public DateTime RandevuOlusturulmaZamani { get; set; }

    // ✅ EKLENDİ
    [Column("telefon")]
    [MaxLength(20)]
    public string? Telefon { get; set; }

    [ForeignKey(nameof(RandevuHizmetId))]
    public Hizmet? Hizmet { get; set; }
}