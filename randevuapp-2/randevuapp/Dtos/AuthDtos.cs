namespace randevuapp.Dtos;

public record RequestCodeDto(string Ad, string Soyad, string Telefon);
public record VerifyCodeDto(string Telefon, string Kod);