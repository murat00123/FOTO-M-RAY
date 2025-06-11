# MİRAY PHOTOGRAPHY - Fotoğrafçı Web Sitesi

Modern ve profesyonel fotoğrafçı portföy web sitesi. Admin paneli ile içerik yönetimi ve fotoğraf yükleme özellikleri.

## 🌟 Özellikler

- ✨ **Modern Tasarım**: Responsive ve kullanıcı dostu arayüz
- 📸 **Fotoğraf Galerisi**: Lightbox ile büyük görüntüleme
- 🎯 **Admin Paneli**: İçerik düzenleme ve fotoğraf yönetimi
- 📱 **Mobil Uyumlu**: Tüm cihazlarda mükemmel görünüm
- 🔐 **Güvenli Admin**: Session tabanlı kimlik doğrulama
- 📧 **İletişim Formu**: Müşteri mesajları için form
- 🎨 **Animasyonlar**: Smooth scroll ve hover efektleri

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üstü)
- npm veya yarn

### Adım 1: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 2: Logo Dosyasını Ekleyin
- Verdiğiniz MİRAY logo PNG dosyasını `public/images/miray-logo.png` olarak kaydedin
- Önerilen boyut: 200x60 piksel (şeffaf arkaplan)

### Adım 3: Sunucuyu Başlatın
```bash
# Geliştirme modu
npm run dev

# Veya production modu
npm start
```

### Adım 4: Web Sitesini Açın
- Ana site: http://localhost:3000
- Admin paneli: http://localhost:3000/admin/login

## 🔑 Admin Giriş Bilgileri

- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

## 📁 Proje Yapısı

```
miray-photography/
├── server.js              # Ana sunucu dosyası
├── package.json           # Proje bağımlılıkları
├── public/                # Statik dosyalar
│   ├── css/
│   │   ├── style.css      # Ana CSS dosyası
│   │   └── admin.css      # Admin panel CSS
│   ├── js/
│   │   └── script.js      # JavaScript dosyası
│   ├── images/            # Görsel dosyalar
│   └── uploads/           # Yüklenen fotoğraflar
│       └── gallery/
├── views/                 # EJS template dosyaları
│   ├── index.ejs          # Ana sayfa
│   ├── gallery.ejs        # Galeri sayfası
│   ├── about.ejs          # Hakkımda sayfası
│   ├── contact.ejs        # İletişim sayfası
│   └── admin/
│       ├── login.ejs      # Admin giriş
│       └── dashboard.ejs  # Admin panel
└── data/                  # JSON veri dosyaları
    ├── content.json       # Site içeriği
    └── photos.json        # Fotoğraf verileri
```

## 🎨 Özelleştirme

### Renk Teması Değiştirme
CSS dosyalarında aşağıdaki değişkenleri düzenleyin:
```css
/* Ana renkler */
#ff6b35  /* Birincil renk (turuncu) */
#f7931e  /* İkincil renk (altın) */
#2c3e50  /* Koyu renk */
```

### İçerik Düzenleme
1. Admin paneline giriş yapın
2. "İçerik Düzenle" sekmesinden metinleri güncelleyin
3. "Fotoğraf Yönetimi" sekmesinden galeriyi yönetin

## 📸 Fotoğraf Yönetimi

### Fotoğraf Yükleme
1. Admin paneline giriş yapın
2. "Fotoğraf Yönetimi" sekmesine gidin
3. "Yeni Fotoğraf Yükle" formu ile fotoğraf ekleyin
4. Başlık ve açıklama ekleyerek yükleyin

### Desteklenen Formatlar
- JPEG, JPG, PNG, GIF
- Maksimum dosya boyutu: 5MB
- Otomatik boyutlandırma

## 🔧 Teknik Detaylar

### Kullanılan Teknolojiler
- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **File Upload**: Multer
- **Session Management**: express-session
- **Password Hashing**: bcryptjs
- **Frontend**: HTML5, CSS3, JavaScript
- **Animasyonlar**: AOS (Animate On Scroll)
- **Icons**: Font Awesome

### Veritabanı
Basitlik için JSON dosyaları kullanılmıştır:
- `data/content.json`: Site içerikleri
- `data/photos.json`: Fotoğraf metadata'ları

## 🚀 Production Deployment

### Sunucu Gereksinimleri
- Node.js runtime
- 1GB RAM minimum
- 10GB disk alanı (fotoğraflar için)

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
```

### PM2 ile Deploy
```bash
npm install -g pm2
pm2 start server.js --name "miray-photography"
pm2 startup
pm2 save
```

## 🔐 Güvenlik

### Admin Şifresini Değiştirme
1. `server.js` dosyasında `adminPassword` değişkenini bulun
2. Yeni şifreyi bcrypt ile hash'leyin:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('yeniSifre', 12);
console.log(hashedPassword);
```
3. Hash'lenmiş şifreyi kodda güncelleyin

### Güvenlik Önerileri
- Admin şifresini mutlaka değiştirin
- HTTPS kullanın
- Firewall kuralları ayarlayın
- Regular backup alın

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `npm install` komutunu tekrar çalıştırın
2. Node.js versiyonunuzun güncel olduğundan emin olun
3. Port 3000'in boş olduğunu kontrol edin

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

---

**MİRAY PHOTOGRAPHY** - Profesyonel Fotoğrafçılık Hizmetleri 