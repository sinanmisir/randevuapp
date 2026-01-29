using System.Security;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;

namespace randevuapp.Services;

/// <summary>
/// Dinamik SMS API ile SMS gönderimi - SingleTextSMS formatı
/// Dokümantasyon: https://dinamiksms.com.tr/api
/// </summary>
public class SmsService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<SmsService> _logger;

    // Dinamik SMS Gateway adresi
    private static readonly string[] GatewayUrls = new[]
    {
        "http://g3.iletimx.com"             // Doğru API gateway
    };
    

    public SmsService(HttpClient http, IConfiguration config, ILogger<SmsService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
        
        // Timeout ayarı
        _http.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<string> SendSingleTextSmsAsync(string phone, string message)
    {
        var user = _config["SmsSettings:UserName"] ?? "";
        var pass = _config["SmsSettings:Password"] ?? "";
        var originator = _config["SmsSettings:Header"] ?? "";

        if (string.IsNullOrWhiteSpace(user)) return "HATA: UserName boş.";
        if (string.IsNullOrWhiteSpace(pass)) return "HATA: Password boş.";

        // Telefon formatı: 5XXXXXXXXX
        var phoneClean = NormalizePhoneForXmlApi(phone);

        // Türkçe karakter kontrolü - Action: 0=normal, 12=türkçe karakter
        var hasTurkish = HasTurkishChars(message);
        var action = hasTurkish ? "12" : "0";


        var xml = $@"<SingleTextSMS>
<UserName>{SecurityElement.Escape(user)}</UserName>
<PassWord>{SecurityElement.Escape(pass)}</PassWord>
<Action>{action}</Action>
<Mesgbody>{SecurityElement.Escape(message)}</Mesgbody>
<Numbers>{SecurityElement.Escape(phoneClean)}</Numbers>
<Originator>{SecurityElement.Escape(originator)}</Originator>
<SDate></SDate>
</SingleTextSMS>";

        _logger.LogInformation("SMS gönderiliyor (SingleTextSMS): Phone={Phone} Action={Action} User={User}",
            phoneClean, action, user);

        _logger.LogDebug("Gönderilen XML: {Xml}", xml);

        // Tüm gateway'leri dene
        foreach (var gatewayUrl in GatewayUrls)
        {
            try
            {
                var result = await TrySendSmsAsync(gatewayUrl, xml, phoneClean);
                if (result != null)
                    return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Gateway {Url} başarısız: {Error}", gatewayUrl, ex.Message);
                continue;
            }
        }

        return "HATA: Tüm SMS gateway'leri başarısız oldu. Lütfen internet bağlantınızı kontrol edin.";
    }

    private async Task<string?> TrySendSmsAsync(string baseUrl, string xml, string phone)
    {
        try
        {
            var fullUrl = $"{baseUrl}/?anabayi=1";
            
            _logger.LogInformation("SMS gateway deneniyor: {Url}", fullUrl);

            using var req = new HttpRequestMessage(HttpMethod.Post, fullUrl);
            req.Content = new StringContent(xml, Encoding.UTF8, "text/xml");

            var resp = await _http.SendAsync(req);
            var respText = await resp.Content.ReadAsStringAsync();

            _logger.LogInformation("Gateway yanıt: Url={Url} Status={Status} Body={Body}", 
                baseUrl, resp.StatusCode, respText);

            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gateway HTTP hatası: {Status}", resp.StatusCode);
                return null; // Sonraki gateway'i dene
            }

            // Başarılı: "ID: 27765"
            if (respText.Contains("ID:", StringComparison.OrdinalIgnoreCase))
                return respText.Trim();

            // Hata kodları
            if (respText.Contains("error:", StringComparison.OrdinalIgnoreCase))
            {
                var errorCode = ExtractErrorCode(respText);
                return $"HATA: {GetErrorMessage(errorCode)} (Kod: {errorCode})";
            }

            // Sadece sayı dönerse (01, 02 vb.)
            if (respText.Trim().Length <= 2 && int.TryParse(respText.Trim(), out _))
            {
                return $"HATA: {GetErrorMessage(respText.Trim())} (Kod: {respText.Trim()})";
            }

            return respText.Trim();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "SMS gateway bağlantı hatası: {Phone} - {Url}", phone, baseUrl);
            return null; // Sonraki gateway'i dene
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "SMS gateway timeout: {Phone} - {Url}", phone, baseUrl);
            return null; // Sonraki gateway'i dene
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS gönderim hatası: {Phone}", phone);
            return $"HATA: {ex.Message}";
        }
    }

    private static string NormalizePhoneForXmlApi(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return phone;

        phone = phone.Replace(" ", "").Replace("+", "").Replace("(", "").Replace(")", "").Replace("-", "").Trim();

        if (phone.StartsWith("90") && phone.Length == 12)
            return phone.Substring(2);

        if (phone.StartsWith("0") && phone.Length == 11)
            return phone.Substring(1);

        if (phone.StartsWith("5") && phone.Length == 10)
            return phone;

        return phone;
    }

    private static bool HasTurkishChars(string text)
    {
        const string tr = "ğĞıİşŞçÇöÖüÜ";
        return text.Any(c => tr.Contains(c));
    }

    private static string ExtractErrorCode(string response)
    {
        var match = System.Text.RegularExpressions.Regex.Match(response, @"error:(\d+)",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : "UNKNOWN";
    }

    private static string GetErrorMessage(string errorCode)
    {
        return errorCode switch
        {
            "01" => "Hatalı Kullanıcı Adı, Şifre veya Bayi Kodu",
            "02" => "Yetersiz Kredi / Ödenmemiş Fatura Borcu",
            "03" => "Tanımsız Action Parametresi",
            "05" => "XML Düğümü Eksik veya Hatalı",
            "06" => "Tanımsız Originator",
            "07" => "Mesaj Kodu (ID) yok",
            "09" => "Tarih alanları hatalı",
            "10" => "SMS Gönderilemedi",
            _ => "Bilinmeyen Hata"
        };
    }
}