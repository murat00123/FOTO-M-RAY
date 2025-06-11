const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable view caching in all environments to ensure data is fresh
app.disable('view cache');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'miray-photography-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// EJS template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './public/uploads/gallery';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Data storage
const dataFile = './data/content.json';
const photosFile = './data/photos.json';

// Initialize data files
function initializeData() {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }
    
    if (!fs.existsSync(dataFile)) {
        const defaultContent = {
            heroTitle: "MİRAY PHOTOGRAPHY",
            heroSubtitle: "Capturing Life's Beautiful Moments",
            aboutTitle: "About Me",
            aboutText: "Professional photographer specializing in portraits, weddings, and artistic photography. With years of experience, I capture the essence of every moment.",
            instagramUrl: "",
            footerCopyright: "© 2024 Miray Photography. All rights reserved.",
            contactEmail1: "fotomiray55@gmail.com",
            contactEmail2: "fotomiray55@hotmail.com",
            contactAddressShort: "Atakum / Samsun",
            contactAddressFull: "Esenevler Mah. İsmet İnönü Bulv. No: 15/B (Samgaz Karşısı) Atakum / Samsun",
            contactGoogleMapsUrl: "https://www.google.com/maps/place/FOTO+M%C4%B0RAY+(+Hakan+TUN%C3%87AY+)/@41.325155,36.2945797,17z/data=!4m6!3m5!1s0x408879c3e7c895c3:0x14afca97c25d7aad!8m2!3d41.325151!4d36.29716!16s%2Fg%2F11n_n46csy?hl=tr&entry=ttu&g_ep=EgoyMDI1MDYwNC4wIKXMDSoASAFQAw%3D%3D"
        };
        fs.writeFileSync(dataFile, JSON.stringify(defaultContent, null, 4));
    }
    
    if (!fs.existsSync(photosFile)) {
        fs.writeFileSync(photosFile, JSON.stringify([], null, 2));
    }
}

// Helper functions
function getContent() {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function saveContent(content) {
    fs.writeFileSync(dataFile, JSON.stringify(content, null, 4));
}

function getPhotos() {
    return JSON.parse(fs.readFileSync(photosFile, 'utf8'));
}

function savePhotos(photos) {
    fs.writeFileSync(photosFile, JSON.stringify(photos, null, 2));
}

// Admin authentication middleware
function requireAuth(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Routes

// Home page
app.get('/', (req, res) => {
    const content = getContent();
    const allPhotos = getPhotos();
    const photos = allPhotos.filter(p => p.featured).slice(0, 6); // Ana sayfada öne çıkan 6 fotoğrafı göster
    res.render('index', { content, photos, page: 'home' });
});

// Gallery page
app.get('/gallery', (req, res) => {
    const content = getContent();
    const photos = getPhotos();
    res.render('gallery', { content, photos, page: 'gallery' });
});

// About page
app.get('/about', (req, res) => {
    const content = getContent();
    res.render('about', { content, page: 'about' });
});

// Contact page
app.get('/contact', (req, res) => {
    const content = getContent();
    res.render('contact', { content, page: 'contact' });
});

// Admin login page
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// Admin login POST
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple admin credentials (in production, this should be in a database)
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Geçersiz kullanıcı adı veya şifre.' });
    }
});

// Admin dashboard
app.get('/admin/dashboard', requireAuth, (req, res) => {
    const content = getContent();
    const photos = getPhotos();
    res.render('admin/dashboard', { content, photos });
});

// Admin content update
app.post('/admin/update-content', requireAuth, (req, res) => {
    const content = getContent();
    content.heroSubtitle = req.body.heroSubtitle;
    content.aboutTitle = req.body.aboutTitle;
    content.aboutText = req.body.aboutText;
    content.instagramUrl = req.body.instagramUrl;
    content.instagramUsername = req.body.instagramUsername;
    
    // Handle dynamic phones
    if (req.body.contactPhones) {
        let phones = req.body.contactPhones;
        if (!Array.isArray(phones)) {
            phones = [phones];
        }
        content.contactPhones = phones.filter(phone => phone && phone.trim() !== '');
    } else {
        content.contactPhones = [];
    }
    
    // Handle dynamic emails
    if (req.body.contactEmails) {
        let emails = req.body.contactEmails;
        if (!Array.isArray(emails)) {
            emails = [emails];
        }
        content.contactEmails = emails.filter(email => email && email.trim() !== '');
    } else {
        content.contactEmails = [];
    }

    content.contactAddressShort = req.body.contactAddressShort;
    content.contactAddressFull = req.body.contactAddressFull;
    content.contactGoogleMapsUrl = req.body.contactGoogleMapsUrl;
    
    if (req.body.workingHours) {
        content.workingHours = req.body.workingHours.map(wh => ({
            day: wh.day,
            hours: wh.hours
        }));
    }

    if (req.body.services) {
        content.services = req.body.services.map((service, index) => ({
            title: service.title,
            description: service.description
        }));
    }

    saveContent(content);
    res.json({ success: true, message: 'İçerik başarıyla güncellendi.' });
});

// Admin photo upload
app.post('/admin/upload-photo', requireAuth, upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Lütfen bir dosya seçin.'});
    }
    
    const photos = getPhotos();
    const newPhoto = {
        id: Date.now(),
        filename: req.file.filename,
        title: req.body.title || '',
        description: req.body.description || '',
        uploadDate: new Date().toISOString(),
        featured: false // Varsayılan olarak öne çıkan değil
    };
    
    photos.unshift(newPhoto);
    savePhotos(photos);
    
    res.json({ success: true, message: 'Fotoğraf başarıyla yüklendi.', photo: newPhoto });
});

// Admin manage photos (update featured and delete)
app.post('/admin/manage-photos', requireAuth, (req, res) => {
    const { action, photoIds } = req.body;
    if (!action || !photoIds || !Array.isArray(photoIds)) {
        return res.status(400).json({ success: false, message: 'Geçersiz istek.' });
    }

    let photos = getPhotos();
    let message = '';

    if (action === 'updateFeatured') {
        // Gelen ID'leri sayıya çevir
        const featuredIds = photoIds.map(id => parseInt(id, 10));
        
        // Tüm fotoğrafların üzerinden geçerek 'featured' durumunu ayarla
        photos.forEach(photo => {
            photo.featured = featuredIds.includes(photo.id);
        });
        message = 'Öne çıkan fotoğraflar güncellendi.';

    } else if (action === 'delete') {
        const idsToDelete = photoIds.map(id => parseInt(id, 10));
        
        const photosToDelete = photos.filter(p => idsToDelete.includes(p.id));
        
        // Delete files from server
        photosToDelete.forEach(photo => {
            const filePath = path.join(__dirname, 'public/uploads/gallery', photo.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        photos = photos.filter(p => !idsToDelete.includes(p.id));
        message = 'Seçilen fotoğraflar silindi.';
    } else {
        return res.status(400).json({ success: false, message: 'Geçersiz eylem.' });
    }

    savePhotos(photos);
    // Dönen ID'lerin de sayı olduğundan emin olalım
    const processedIds = photoIds.map(id => parseInt(id, 10));
    res.json({ success: true, message: message, action: action, photoIds: processedIds });
});

// Admin logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Initialize data and start server
initializeData();

app.listen(PORT, () => {
    console.log(`Miray Photography website running on http://localhost:${PORT}`);
    console.log('Admin panel: http://localhost:' + PORT + '/admin/login');
    console.log('Default admin credentials: username=admin, password=admin123');
}); 