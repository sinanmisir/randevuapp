using System.ComponentModel.DataAnnotations;

namespace randevuapp.Dtos;

public class CreateRandevuDto
{
    [Required(ErrorMessage = "Hizmet seçilmelidir.")]
    public int HizmetId { get; set; }

    [Required(ErrorMessage = "Randevu tarihi zorunludur.")]
    public DateTime RandevuTarih { get; set; }

    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [StringLength(50, ErrorMessage = "Ad en fazla 50 karakter olabilir.")]
    public string Ad { get; set; } = default!;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    [StringLength(50, ErrorMessage = "Soyad en fazla 50 karakter olabilir.")]
    public string Soyad { get; set; } = default!;
}