# 🚀 Render.com Deployment Rehberi - Miray Photography

Bu rehber, Miray Photography web sitesini Render.com'da yayınlamak için gereken adımları açıklar.

## 📋 Ön Gereksinimler

1. [Render.com](https://render.com) hesabı
2. GitHub repository (kodlarınızın GitHub'da olması gerekir)
3. Git bilgisi

## 🔧 Deployment Adımları

### 1. GitHub Repository Hazırlığı

```bash
# Eğer henüz GitHub'a push etmediyseniz:
git add .
git commit -m "Render.com deployment hazırlığı"
git push origin main
```

### 2. Render.com'da Yeni Service Oluşturma

1. [Render.com Dashboard](https://dashboard.render.com)'a gidin
2. **"New +"** butonuna tıklayın
3. **"Web Service"** seçin
4. GitHub repository'nizi seçin
5. Aşağıdaki ayarları yapın:

**Basic Settings:**
- **Name:** `miray-photography` (veya istediğiniz isim)
- **Environment:** `Node`
- **Region:** `Frankfurt (EU Central)` (Türkiye'ye en yakın)
- **Branch:** `main` (veya master)

**Build & Deploy Settings:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Environment Variables Ayarlama

Dashboard'da **Environment** sekmesine gidin ve şu değişkenleri ekleyin:

```
NODE_ENV=production
SESSION_SECRET=[güçlü-bir-secret-key-oluşturun]
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[güvenli-bir-şifre-belirleyin]

# MySQL kullanmak isterseniz (opsiyonel):
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=foto_miray
DB_PORT=3306
```

### 4. Domain Ayarlama (Opsiyonel)

Kendi domain'inizi kullanmak isterseniz:

1. **Settings** > **Custom Domains** sekmesine gidin
2. Domain'inizi ekleyin
3. DNS kayıtlarını güncelleyin

## 📁 Dosya Sistemi Notları

Render.com'da dosya sistemi ephemeral'dir (geçici). Bu nedenle:

- **Kullanıcı fotoğrafları:** CloudFlare R2, AWS S3 gibi cloud storage kullanın
- **Veritabanı:** PlanetScale, AWS RDS gibi cloud database kullanın
- **Mesajlar:** Cloud database'de saklayın

## ⚙️ Önemli Konfigürasyonlar

### 1. Session Secret
Production'da güçlü bir session secret kullanın:
```javascript
// Otomatik oluşturmak için:
require('crypto').randomBytes(64).toString('hex')
```

### 2. HTTPS Yönlendirmesi
Render.com otomatik HTTPS sağlar, Express'te zorlamaya gerek yok.

### 3. Static Files
Express static middleware Render.com'da düzgün çalışır:
```javascript
app.use(express.static('public'));
```

## 🔍 Deployment Sonrası Kontroller

1. **Site erişimi:** `https://your-app-name.onrender.com`
2. **Admin panel:** `https://your-app-name.onrender.com/admin/login`
3. **Log kontrolü:** Render dashboard'dan logs sekmesi

## 🐛 Yaygın Problemler ve Çözümleri

### Problem: "Application failed to respond"
**Çözüm:** 
- PORT environment variable'ının doğru kullanıldığını kontrol edin
- Logs'dan hata mesajlarını inceleyin

### Problem: Static dosyalar yüklenmiyor
**Çözüm:**
- `public` klasörünün repository'de olduğunu kontrol edin
- Express static middleware'inin doğru yapılandırıldığını kontrol edin

### Problem: Session çalışmıyor
**Çözüm:**
- SESSION_SECRET environment variable'ının set edildiğini kontrol edin
- Production'da `secure: false` kullanın (Render.com proxy kullanır)

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Render.com [documentation](https://render.com/docs)
2. Render.com [community forum](https://community.render.com)

## 🎉 Başarılı Deployment

Deployment başarılı olduktan sonra:
- ✅ Ana sayfa erişilebilir
- ✅ Galeri çalışır
- ✅ İletişim formu çalışır  
- ✅ Admin panel erişilebilir
- ✅ HTTPS otomatik aktif

**Site URL'niz:** `https://your-app-name.onrender.com` 