# 🔧 Render.com Production Fixes

## 🚨 Ana Sorun: Ephemeral File System

Render.com'da dosya sistemi geçici olduğu için yüklenen fotoğraflar kaybolur.

## ✅ Çözüm 1: CloudFlare R2 (Ücretsiz)

### 1. CloudFlare R2 Setup:
```javascript
// Cloudflare R2 konfigürasyonu
const AWS = require('aws-sdk');

const r2 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
    region: 'auto',
    signatureVersion: 'v4',
});
```

### 2. Environment Variables (Render.com):
```
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET_NAME=foto-miray-uploads
```

### 3. Upload Function:
```javascript
async function uploadToR2(file, filename) {
    const params = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `gallery/${filename}`,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype
    };
    
    const result = await r2.upload(params).promise();
    return result.Location;
}
```

## ✅ Çözüm 2: Kısa Vadeli Fix (Geçici)

Upload klasörünü her restart'ta yeniden oluştur:

```javascript
// server.js startup'ta
function ensureUploadDirectories() {
    const dirs = [
        'public/uploads',
        'public/uploads/gallery'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
}
```

## ✅ Çözüm 3: AWS S3 (Alternatif)

### Environment Variables:
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=foto-miray-uploads
```

## 🔧 Production Deploy Adımları:

### 1. Environment Variables Set Et:
```
NODE_ENV=production
SESSION_SECRET=güçlü-session-key
ADMIN_USERNAME=icardi99
ADMIN_PASSWORD=admin123

# Cloud Storage (seç):
R2_ENDPOINT=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET_NAME=...
```

### 2. Render.com Logs Kontrol:
- Dashboard > Logs sekmesi
- Upload hatalarını izle

### 3. Manual Deploy:
- Render Dashboard > Manual Deploy

## 🚨 Acil Geçici Çözüm

Şimdilik uploads klasörü her restart'ta kaybolmasın diye:

1. **Render.com Dashboard** > **Environment** 
2. Bu değişkeni ekle:
```
ENABLE_UPLOAD_DIR_RECREATION=true
```

3. **Manual Deploy** yap

## 📞 Destek

Production'da fotoğraf sistemi çalışmazsa cloud storage şart!

**Önerilen: CloudFlare R2 (ücretsiz 10GB)** 