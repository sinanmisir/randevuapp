using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace randevuapp.Models;

[Table("sms")]
public class SmsLog
{
    [Key]
    [Column("sms_id")]
    public int SmsId { get; set; }

    [Column("sms_zaman")]
    public DateTime SmsZaman { get; set; }

    [MaxLength(1)]
    [Column("sms_tip", TypeName = "char(1)")]
    public string SmsTip { get; set; } = default!;

    [MaxLength(1000)]
    [Column("sms_mesaj")]
    public string SmsMesaj { get; set; } = default!;
}