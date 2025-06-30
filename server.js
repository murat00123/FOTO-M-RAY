// Environment variables'ı yükle
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'foto-miray-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Render.com proxy kullandığı için false olmalı
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// JSON dosya yolları
const contentFile = path.join(__dirname, 'data/content.json');
const messagesFile = path.join(__dirname, 'data/messages.json');
const photosFile = path.join(__dirname, 'data/photos.json');
const adminCredentialsFile = path.join(__dirname, 'admin-credentials.json');

// Veri dosyalarını başlat
function initializeData() {
    // data klasörünü oluştur
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // uploads klasörlerini oluştur
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const galleryDir = path.join(__dirname, 'public/uploads/gallery');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
    }

    // content.json
    if (!fs.existsSync(contentFile)) {
        const defaultContent = {
            heroSubtitle: "Anılarınızı Sanat Eserine Dönüştürüyoruz",
            aboutTitle: "Merhaba, Ben Miray",
            aboutText: "Fotoğrafçılık tutkum ile sizlerin en özel anlarını ölümsüzleştiriyorum. Her kare, bir hikaye anlatır ve ben bu hikayelerin en güzel şekilde anlatılması için buradayım.",
            contactPhones: ["0555 123 45 67", "0532 987 65 43"],
            contactEmails: ["info@fotomiray.com", "miray@fotomiray.com"],
            contactAddressShort: "İstanbul, Türkiye",
            contactAddressFull: "Beşiktaş, İstanbul, Türkiye",
            contactGoogleMapsUrl: "https://maps.google.com",
            instagramUrl: "https://instagram.com/fotomiray",
            instagramUsername: "@fotomiray",
            workingHours: [
                { day: "Pazartesi", hours: "09:00 - 18:00" },
                { day: "Salı", hours: "09:00 - 18:00" },
                { day: "Çarşamba", hours: "09:00 - 18:00" },
                { day: "Perşembe", hours: "09:00 - 18:00" },
                { day: "Cuma", hours: "09:00 - 18:00" },
                { day: "Cumartesi", hours: "10:00 - 16:00" },
                { day: "Pazar", hours: "Kapalı" }
            ]
        };
        fs.writeFileSync(contentFile, JSON.stringify(defaultContent, null, 4));
    }

    // messages.json
    if (!fs.existsSync(messagesFile)) {
        fs.writeFileSync(messagesFile, JSON.stringify([], null, 4));
    }

    // photos.json
    if (!fs.existsSync(photosFile)) {
        const defaultPhotos = [
            { id: 1, filename: "sample1.jpg", title: "Örnek Fotoğraf 1", featured: true },
            { id: 2, filename: "sample2.jpg", title: "Örnek Fotoğraf 2", featured: false }
        ];
        fs.writeFileSync(photosFile, JSON.stringify(defaultPhotos, null, 4));
    }
}

// Helper functions
function getContent() {
    try {
        return JSON.parse(fs.readFileSync(contentFile, 'utf8'));
    } catch (error) {
        console.error('Content okuma hatası:', error);
        return {};
    }
}

function getMessages() {
    try {
        return JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    } catch (error) {
        console.error('Messages okuma hatası:', error);
        return [];
    }
}

function saveMessages(messages) {
    try {
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 4));
        return true;
    } catch (error) {
        console.error('Messages kaydetme hatası:', error);
        return false;
    }
}

function getPhotos() {
    try {
    return JSON.parse(fs.readFileSync(photosFile, 'utf8'));
    } catch (error) {
        console.error('Photos okuma hatası:', error);
        return [];
    }
}

function savePhotos(photos) {
    try {
        fs.writeFileSync(photosFile, JSON.stringify(photos, null, 4));
        return true;
    } catch (error) {
        console.error('Photos kaydetme hatası:', error);
        return false;
    }
}

// Admin credentials functions
function getAdminCredentials() {
    try {
        return JSON.parse(fs.readFileSync(adminCredentialsFile, 'utf8'));
    } catch (error) {
        console.error('Admin credentials okuma hatası:', error);
        return { username: 'admin', password: 'admin123' };
    }
}

function saveAdminCredentials(credentials) {
    try {
        fs.writeFileSync(adminCredentialsFile, JSON.stringify(credentials, null, 2));
        return true;
    } catch (error) {
        console.error('Admin credentials kaydetme hatası:', error);
        return false;
    }
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Multer configuration for photo uploads
const uploadDir = path.join(__dirname, 'public/uploads/gallery');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    const content = getContent();
    const photos = getPhotos();
    const featuredPhotos = photos.filter(photo => photo.featured).slice(0, 6);
    
    res.render('index', { 
        content: content,
        photos: featuredPhotos,
        page: 'home'
    });
});

app.get('/about', (req, res) => {
    const content = getContent();
    res.render('about', { 
        content: content,
        page: 'about'
    });
});

app.get('/gallery', (req, res) => {
    const content = getContent();
    const photos = getPhotos();
    res.render('gallery', { 
        content: content,
        photos: photos,
        page: 'gallery'
});
});

app.get('/contact', (req, res) => {
    const content = getContent();
    res.render('contact', { 
        content: content,
        page: 'contact'
    });
});

// Contact form submission
app.post('/contact/send-message', (req, res) => {
    try {
        const { name, email, phone, service, date, message } = req.body;
        
        const newMessage = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone || '',
            service: service || '',
            date: date || '',
            message: message,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        const messages = getMessages();
        messages.unshift(newMessage);
        
        if (saveMessages(messages)) {
            res.json({ success: true, message: 'Mesajınız başarıyla gönderildi!' });
        } else {
            res.status(500).json({ success: false, message: 'Mesaj gönderilirken bir hata oluştu.' });
        }
    } catch (error) {
        console.error('Message send error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// Admin routes
app.get('/admin/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    
    // Browser credential manager'ı sıfırlamak için cookie temizle
    res.clearCookie('connect.sid');
    res.clearCookie('admin-session');
    
    res.render('admin/login', { error: null });
});

// Logout endpoint'i ekle
app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.clearCookie('admin-session');
        res.redirect('/admin/login');
    });
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Browser credential manager'ı engellemek için header'lar ekle
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // AJAX isteği mi kontrol et
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    try {
        let user = null;
        
        // MySQL kullanılıyorsa AdminUser model'ini kullan
        if (usingMysql) {
            const AdminUser = require('./models/AdminUser');
            user = await AdminUser.authenticate(username, password);
        } else {
            // JSON dosya sistemi fallback
            // Production'da environment variables'ları tercih et
            const envUsername = process.env.ADMIN_USERNAME;
            const envPassword = process.env.ADMIN_PASSWORD;
            
            if (envUsername && envPassword) {
                // Environment variables'dan kontrol et
                if (username === envUsername && password === envPassword) {
                    user = { username: envUsername };
                }
            } else {
                // JSON dosya sistemini kullan
                const adminCreds = getAdminCredentials();
                if (username === adminCreds.username && password === adminCreds.password) {
                    user = { username: adminCreds.username };
                }
            }
        }
        
        if (user) {
        req.session.isAdmin = true;
            req.session.adminUser = { username: user.username };
            
            // Başarılı giriş için özel header ekle
            res.setHeader('X-Login-Success', 'true');
            
            if (isAjax) {
                // AJAX isteği için JSON response
                res.json({ success: true, redirect: '/admin/dashboard' });
            } else {
                // Normal form submit için redirect
        res.redirect('/admin/dashboard');
            }
        } else {
            if (isAjax) {
                // AJAX isteği için JSON error response
                res.status(401).json({ 
                    success: false, 
                    message: 'Geçersiz kullanıcı adı veya şifre.' 
                });
    } else {
                // Normal form submit için error page
        res.render('admin/login', { error: 'Geçersiz kullanıcı adı veya şifre.' });
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        
        if (isAjax) {
            // AJAX isteği için JSON error response
            res.status(500).json({ 
                success: false, 
                message: 'Giriş hatası. Lütfen tekrar deneyin.' 
            });
        } else {
            // Normal form submit için error page
            res.render('admin/login', { error: 'Giriş hatası. Lütfen tekrar deneyin.' });
        }
    }
});

app.get('/admin/dashboard', requireAdmin, (req, res) => {
    const content = getContent();
    const photos = getPhotos();
    const messages = getMessages();
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    
    res.render('admin/dashboard', {
        user: req.session.adminUser,
        content: content,
        photos: photos,
        messages: messages,
        unreadCount: unreadCount
    });
});

app.get('/admin/messages', requireAdmin, (req, res) => {
    const messages = getMessages();
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    
    res.json({
        success: true,
        messages: messages,
        unreadCount: unreadCount
    });
});

app.post('/admin/mark-message-read', requireAdmin, (req, res) => {
    try {
        const { messageId } = req.body;
        const messages = getMessages();
        
        const messageIndex = messages.findIndex(msg => msg.id == messageId);
        if (messageIndex !== -1) {
            messages[messageIndex].isRead = true;
            if (saveMessages(messages)) {
                res.json({ success: true });
            } else {
                res.status(500).json({ success: false, message: 'Mesaj güncellenemedi.' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Mesaj bulunamadı.' });
        }
    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

app.post('/admin/delete-message', requireAdmin, (req, res) => {
    try {
        const { messageId } = req.body;
        const messages = getMessages();
        
        const filteredMessages = messages.filter(msg => msg.id != messageId);
        if (saveMessages(filteredMessages)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Mesaj silinemedi.' });
        }
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// Photo upload endpoint
app.post('/admin/upload-photo', requireAdmin, (req, res) => {
    upload.single('photo')(req, res, (uploadErr) => {
        if (uploadErr) {
            return res.status(400).json({
                success: false,
                message: uploadErr.message || 'Dosya yükleme hatası.'
            });
        }
        
        handlePhotoUpload(req, res);
    });
});

function handlePhotoUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Lütfen bir fotoğraf seçin.' 
            });
        }
        
        const { title, description } = req.body;
        const photos = getPhotos();
        
        const newPhoto = {
            id: Date.now(),
            filename: req.file.filename,
            title: title || '',
            description: description || '',
            uploadDate: new Date().toISOString(),
            featured: false
        };
        
        photos.unshift(newPhoto); // En başa ekle
        
        if (savePhotos(photos)) {
            res.json({ 
                success: true, 
                message: 'Fotoğraf başarıyla yüklendi!',
                photo: newPhoto
            });
        } else {
            // Başarısız olursa dosyayı sil
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ 
                success: false, 
                message: 'Fotoğraf kaydedilirken hata oluştu.' 
            });
        }
    } catch (error) {
        console.error('Photo upload error:', error);
        
        // Hata durumunda dosyayı temizle
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Fotoğraf yükleme hatası.' 
        });
    }
}

// Photo management endpoint
app.post('/admin/manage-photos', requireAdmin, (req, res) => {
    try {
        const { action, photoIds } = req.body;
        const photos = getPhotos();
        
        if (action === 'delete') {
            // Silinecek fotoğraf dosyalarını bul ve sil
            const photosToDelete = photos.filter(photo => photoIds.includes(photo.id.toString()));
            photosToDelete.forEach(photo => {
                const filePath = path.join(__dirname, 'public/uploads/gallery', photo.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
            
            // JSON'dan kaldır
            const updatedPhotos = photos.filter(photo => !photoIds.includes(photo.id.toString()));
            if (savePhotos(updatedPhotos)) {
                res.json({ 
                    success: true, 
                    message: 'Seçilen fotoğraflar silindi.',
                    action: 'delete',
                    photoIds: photoIds
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Fotoğraflar silinirken hata oluştu.' 
                });
            }
            
        } else if (action === 'updateFeatured') {
            // Tüm fotoğrafları featured=false yap
            photos.forEach(photo => photo.featured = false);
            
            // Seçilen fotoğrafları featured=true yap
            photoIds.forEach(id => {
                const photo = photos.find(p => p.id.toString() === id);
                if (photo) photo.featured = true;
            });
            
            if (savePhotos(photos)) {
                res.json({ 
                    success: true, 
                    message: 'Öne çıkan fotoğraflar güncellendi.',
                    action: 'updateFeatured',
                    photoIds: photoIds
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Öne çıkan fotoğraflar güncellenirken hata oluştu.' 
                });
            }
            
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Geçersiz işlem.' 
            });
        }
        
    } catch (error) {
        console.error('Photo management error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Fotoğraf yönetimi hatası.' 
        });
    }
});

// Security settings endpoints
app.post('/admin/update-username', requireAdmin, async (req, res) => {
    try {
        const { newUsername, confirmPassword } = req.body;
        
        console.log('Username update request received:', { newUsername, confirmPassword });
        
        // Validate inputs
        if (!newUsername || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tüm alanları doldurun.' 
            });
        }
        
        // MySQL kullanılıyorsa AdminUser model'ini kullan
        if (usingMysql) {
            const AdminUser = require('./models/AdminUser');
            const currentUsername = req.session.adminUser.username;
            
            const success = await AdminUser.updateUsername(currentUsername, newUsername, confirmPassword);
            if (success) {
                // Update session
                req.session.adminUser.username = newUsername;
                
                res.json({ 
                    success: true, 
                    message: 'Kullanıcı adı başarıyla güncellendi.' 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Kullanıcı adı güncellenemedi.' 
                });
            }
        } else {
            // JSON dosya sistemi fallback
            const adminCreds = getAdminCredentials();
            if (confirmPassword !== adminCreds.password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mevcut şifre yanlış.' 
                });
            }
            
            adminCreds.username = newUsername;
            if (saveAdminCredentials(adminCreds)) {
                req.session.adminUser.username = newUsername;
                res.json({ 
                    success: true, 
                    message: 'Kullanıcı adı başarıyla güncellendi.' 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Kullanıcı adı güncellenemedi.' 
                });
            }
        }
        
    } catch (error) {
        console.error('Username update error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Sunucu hatası.' 
        });
    }
});

app.post('/admin/update-password', requireAdmin, async (req, res) => {
    // Browser credential manager'ı engellemek için özel header'lar
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Password-Update', 'no-save');
    
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        console.log('Password update request received');
        console.log('Current password from form:', currentPassword);
        console.log('New password from form:', newPassword);
        console.log('Confirm password from form:', confirmPassword);
        
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Tüm alanları doldurun.' 
            });
        }
        
        // Check password confirmation
        if (newPassword !== confirmPassword) {
            console.log('Password confirmation mismatch!');
            return res.status(400).json({ 
                success: false, 
                message: 'Yeni şifreler eşleşmiyor.' 
            });
        }
        
        // Password strength check
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Şifre en az 6 karakter olmalıdır.' 
            });
        }
        
        // MySQL kullanılıyorsa AdminUser model'ini kullan
        if (usingMysql) {
            const AdminUser = require('./models/AdminUser');
            const currentUsername = req.session.adminUser.username;
            
            const success = await AdminUser.updatePassword(currentUsername, currentPassword, newPassword);
            if (success) {
                res.json({ 
                    success: true, 
                    message: 'Şifre başarıyla güncellendi.' 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Şifre güncellenemedi.' 
                });
            }
        } else {
            // JSON dosya sistemi fallback
            const adminCreds = getAdminCredentials();
            console.log('Current password from credentials file:', adminCreds.password);
            if (currentPassword !== adminCreds.password) {
                console.log('Current password mismatch!');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mevcut şifre yanlış.' 
                });
            }
            
            adminCreds.password = newPassword;
            if (saveAdminCredentials(adminCreds)) {
                res.json({ 
                    success: true, 
                    message: 'Şifre başarıyla güncellendi.' 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    message: 'Şifre güncellenemedi.' 
                });
            }
        }
        
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Sunucu hatası.' 
        });
    }
});

// Content update endpoint
app.post('/admin/update-content', requireAdmin, async (req, res) => {
    try {
        const {
            heroSubtitle,
            aboutTitle,
            aboutText,
            contactPhones,
            contactEmails,
            contactAddressShort,
            contactAddressFull,
            contactGoogleMapsUrl,
            instagramUrl,
            instagramUsername,
            workingHours
        } = req.body;

        console.log('Content update request received');

        // Validate required fields
        if (!heroSubtitle || !aboutTitle || !aboutText) {
            return res.status(400).json({
                success: false,
                message: 'Ana başlık, hakkında başlığı ve metin alanları zorunludur.'
            });
        }

        // MySQL kullanılıyorsa Content model'ini kullan
        if (usingMysql) {
            const Content = require('./models/Content');
            
            const contentData = {
                heroSubtitle,
                aboutTitle,
                aboutText,
                contactPhones: Array.isArray(contactPhones) ? contactPhones : [contactPhones].filter(Boolean),
                contactEmails: Array.isArray(contactEmails) ? contactEmails : [contactEmails].filter(Boolean),
                contactAddressShort,
                contactAddressFull,
                contactGoogleMapsUrl,
                instagramUrl,
                instagramUsername,
                workingHours: Array.isArray(workingHours) ? workingHours : []
            };

            const success = await Content.update(contentData);
            
            if (success) {
                res.json({
                    success: true,
                    message: 'İçerik başarıyla güncellendi.'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'İçerik güncellenemedi.'
                });
            }
        } else {
            // JSON dosya sistemi fallback
            const contentData = {
                heroSubtitle,
                aboutTitle,
                aboutText,
                contactPhones: Array.isArray(contactPhones) ? contactPhones : [contactPhones].filter(Boolean),
                contactEmails: Array.isArray(contactEmails) ? contactEmails : [contactEmails].filter(Boolean),
                contactAddressShort,
                contactAddressFull,
                contactGoogleMapsUrl,
                instagramUrl,
                instagramUsername,
                workingHours: Array.isArray(workingHours) ? workingHours : []
            };

            try {
                fs.writeFileSync(contentFile, JSON.stringify(contentData, null, 4));
                res.json({
                    success: true,
                    message: 'İçerik başarıyla güncellendi.'
                });
            } catch (error) {
                console.error('Content JSON update error:', error);
                res.status(500).json({
                    success: false,
                    message: 'İçerik güncellenemedi.'
                });
            }
        }

    } catch (error) {
        console.error('Content update error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sunucu hatası.'
        });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Database import
const { initializeDatabase } = require('./config/database');

// MySQL kullanım durumu
let usingMysql = false;

// Ensure upload directories exist (for Render.com)
function ensureUploadDirectories() {
    const dirs = [
        path.join(__dirname, 'public/uploads'),
        path.join(__dirname, 'public/uploads/gallery')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created missing directory: ${dir}`);
        }
    });
}

// Start server
async function startServer() {
    console.log('🔄 Sistem başlatılıyor...');
    
    // Render.com için upload klasörlerini oluştur
    ensureUploadDirectories();
    
    // Veritabanını başlat
    try {
        await initializeDatabase();
        usingMysql = true;
    } catch (error) {
        console.log('⚠️  MySQL kullanılamıyor, JSON dosya sistemine geçiliyor');
        usingMysql = false;
    }
    
    // JSON dosya sistemini hazırla
initializeData();

app.listen(PORT, () => {
        console.log(`🚀 Miray Photography website running on http://localhost:${PORT}`);
        console.log('📱 Admin panel: http://localhost:' + PORT + '/admin/login');
        console.log('🔑 Default admin credentials: username=admin, password=admin123');
        if (usingMysql) {
            console.log('🗄️  MySQL veritabanı sistemi (aktif)');
        } else {
            console.log('📁 JSON dosya sistemi (aktif)');
        }
    });
}

startServer().catch(error => {
    console.error('❌ Sunucu başlatma hatası:', error);
    process.exit(1);
}); 