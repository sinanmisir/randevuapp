# 📅 Randevu Uygulaması

Modern, mobil uyumlu randevu sistemi. Müşteriler SMS doğrulama ile güvenli şekilde randevu alabilir.

## 🚀 Teknolojiler

### Frontend
- **React** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Hızlı geliştirme ortamı
- **Axios** - HTTP client
- **React Router** - Sayfa yönlendirme

### Backend
- **.NET 8.0** - Web API
- **Entity Framework Core** - ORM
- **SQL Server** - Veritabanı
- **JWT Authentication** - Güvenlik
- **Dinamik SMS API** - SMS gönderimi

## 📋 Özellikler

✅ SMS ile telefon doğrulama (OTP)  
✅ JWT token tabanlı güvenlik  
✅ Hizmet seçimi ve randevu oluşturma  
✅ Dolu saatleri görüntüleme  
✅ Kullanıcının kendi randevularını listeleme  
✅ Otomatik SMS bildirimleri  
✅ Responsive ve modern UI/UX  
✅ Gradient tasarım ve animasyonlar  

## 🗂️ Proje Yapısı

```
randevuapp-2/
├── randevuapp/              # .NET Core Web API
│   ├── Controllers/         # API endpoint'leri
│   ├── Models/             # Veritabanı modelleri
│   ├── Data/               # DbContext
│   ├── Services/           # SMS servisi
│   ├── Dtos/               # Data Transfer Objects
│   └── Migrations/         # EF migrations
│
└── randevu-frontend/       # React uygulaması
    ├── src/
    │   ├── pages/          # Sayfa bileşenleri
    │   ├── api/            # Axios konfigürasyonu
    │   └── assets/         # Statik dosyalar
    └── public/
```

## 🗄️ Veritabanı Yapısı

### Hizmetler Tablosu
```sql
CREATE TABLE Hizmetler (
    HizmetId INT IDENTITY PRIMARY KEY,
    HizmetAdi VARCHAR(250) NOT NULL
);
```

### Randevular Tablosu
```sql
CREATE TABLE Randevular (
    RandevuId INT IDENTITY PRIMARY KEY,
    RandevuAdi VARCHAR(50) NOT NULL,
    RandevuSoyadi VARCHAR(50) NOT NULL,
    RandevuHizmetId INT NOT NULL,
    RandevuTarih DATETIME NOT NULL,
    RandevuOlusturulmaZamani DATETIME NOT NULL,
    Telefon VARCHAR(20) NOT NULL,
    FOREIGN KEY (RandevuHizmetId) REFERENCES Hizmetler(HizmetId)
);
```

### SMS Tablosu
```sql
CREATE TABLE Sms (
    SmsId INT IDENTITY PRIMARY KEY,
    SmsZaman DATETIME NOT NULL,
    SmsTip CHAR(1) NOT NULL,
    SmsMesaj VARCHAR(1000) NOT NULL
);
```

## ⚙️ Kurulum

### Gereksinimler
- .NET 8.0 SDK
- Node.js 18+
- SQL Server
- Visual Studio veya VS Code

### Backend Kurulumu

1. SQL Server bağlantısını yapılandırın:
```json
// randevuapp/appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=RandevuDb;..."
  }
}
```

2. Migration çalıştırın:
```bash
cd randevuapp
dotnet ef database update
```

3. Backend'i başlatın:
```bash
dotnet run
```

Backend `http://localhost:5065` adresinde çalışacak.

### Frontend Kurulumu

1. Bağımlılıkları yükleyin:
```bash
cd randevu-frontend
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

## 🔐 SMS Konfigürasyonu

`randevuapp/Services/SmsService.cs` dosyasında SMS ayarlarını yapılandırın:

```csharp
private const string Username = "YOUR_USERNAME";
private const string Password = "YOUR_PASSWORD";
private const string Originator = "YOUR_ORIGINATOR";
```

## 📱 Kullanıcı Akışı

1. **Giriş** - Kullanıcı ad, soyad ve telefon numarası girer
2. **OTP Doğrulama** - Telefona gelen 4 haneli kodu girer (120 saniye geçerli)
3. **Randevu Oluşturma** - Hizmet ve tarih seçer
4. **Onay** - Randevu oluşturulur ve SMS ile bilgilendirme yapılır

## 🎨 Ekran Görüntüleri

- Modern gradient tasarım
- Glassmorphism efektleri
- Responsive layout (mobil, tablet, desktop)
- Smooth animasyonlar
- İkonlu form alanları

## 🔧 API Endpoint'leri

### Authentication
- `POST /api/auth/request-code` - OTP kodu gönder
- `POST /api/auth/verify-code` - OTP doğrula ve JWT token al

### Hizmetler
- `GET /api/hizmetler` - Tüm hizmetleri listele

### Randevular
- `GET /api/randevular` - Tüm randevuları listele (JWT gerekli)
- `POST /api/randevular` - Yeni randevu oluştur (JWT gerekli)

## 🛡️ Güvenlik

- JWT token authentication
- OTP tabanlı telefon doğrulama
- Rate limiting (120 saniye SMS gönderimleri arası)
- CORS yapılandırması
- Input validasyonu

## 📦 Production Build

### Frontend
```bash
cd randevu-frontend
npm run build
```

### Backend
```bash
cd randevuapp
dotnet publish -c Release
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👨‍💻 Geliştirici

Proje, React, .NET Core API, veritabanı, API kullanımı ve dokümantasyon okuma becerilerini ölçmek amacıyla geliştirilmiştir.

---

**Not:** `.vs` klasörü Visual Studio'nun geçici dosyalarını içerir ve `.gitignore` ile GitHub'a yüklenmez. Silmek isterseniz güvenle silebilirsiniz.
