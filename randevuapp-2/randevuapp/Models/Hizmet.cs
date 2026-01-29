using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace randevuapp.Models;

[Table("hizmetler")]
public class Hizmet
{
    [Key]
    [Column("hizmet_id")]
    public int HizmetId { get; set; }

    [MaxLength(250)]
    [Column("hizmet_adi")]
    public string HizmetAdi { get; set; } = default!;
}