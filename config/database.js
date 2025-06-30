const mysql = require('mysql2/promise');

// Veritabanı bağlantı ayarları
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',          // MySQL kullanıcı adınız
    password: '',          // MySQL şifreniz (boş bırakabilirsiniz)
    database: 'foto_miray',
    charset: 'utf8mb4',
    connectTimeout: 10000
};

// Veritabanı bağlantı havuzu oluştur
let pool = null;
let isConnected = false;

try {
    pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} catch (error) {
    console.log('⚠️  MySQL pool oluşturulamadı:', error.message);
}

// Veritabanı ve tabloları oluştur
async function initializeDatabase() {
    try {
        console.log('🔄 MySQL bağlantısı test ediliyor...');
        
        // MySQL bağlantısını test et
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        
        const connection = await mysql.createConnection(tempConfig);
        console.log('✅ MySQL bağlantısı başarılı!');
        
        // Veritabanını oluştur
        await connection.execute(`CREATE DATABASE IF NOT EXISTS foto_miray CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Veritabanı oluşturuldu: foto_miray');
        
        // Veritabanına bağlan
        await connection.changeUser({ database: 'foto_miray' });
        
        // Tabloları oluştur
        await createTables(connection);
        
        await connection.end();
        isConnected = true;
        console.log('🗄️  MySQL veritabanı sistemi (aktif)');
        
    } catch (error) {
        console.log('⚠️  MySQL bağlantı hatası:', error.message);
        console.log('📁 JSON dosya sistemi kullanılacak...');
        isConnected = false;
        // MySQL bağlantısı yoksa hata atmayalım, JSON sistemini kullanacağız
    }
}

// Tabloları oluştur
async function createTables(connection) {
    try {
        // Content tablosu
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS content (
                id INT PRIMARY KEY AUTO_INCREMENT,
                hero_subtitle TEXT,
                about_title VARCHAR(255),
                about_text TEXT,
                contact_phones JSON,
                contact_emails JSON,
                contact_address_short TEXT,
                contact_address_full TEXT,
                contact_google_maps_url TEXT,
                instagram_url VARCHAR(255),
                instagram_username VARCHAR(100),
                working_hours JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Content tablosu oluşturuldu');

        // Photos tablosu
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS photos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                filename VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                description TEXT,
                featured BOOLEAN DEFAULT FALSE,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Photos tablosu oluşturuldu');

        // Messages tablosu
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                service VARCHAR(100),
                date DATE,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Messages tablosu oluşturuldu');

        // Admin users tablosu
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admin users tablosu oluşturuldu');

        // Varsayılan admin kullanıcısını ekle (sadece hiç admin yoksa)
        const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
        
        if (adminCount[0].count === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO admin_users (username, password_hash) 
                VALUES (?, ?)
            `, ['icardi99', hashedPassword]);
            console.log('✅ Varsayılan admin kullanıcısı eklendi: icardi99');
        } else {
            console.log('ℹ️  Admin kullanıcıları zaten mevcut, yeni eklenmedi');
        }

        // Varsayılan content verilerini ekle
        await insertDefaultContent(connection);

    } catch (error) {
        console.error('❌ Tablo oluşturma hatası:', error);
        throw error;
    }
}

// Varsayılan içerik verilerini ekle
async function insertDefaultContent(connection) {
    try {
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM content');
        
        if (rows[0].count === 0) {
            const defaultContent = {
                hero_subtitle: 'Anılarınızı Sanat Eserine Dönüştürüyoruz',
                about_title: 'Merhaba, Ben Miray',
                about_text: 'Fotoğrafçılık tutkum ile sizlerin en özel anlarını ölümsüzleştiriyorum. Her kare, bir hikaye anlatır ve ben bu hikayelerin en güzel şekilde anlatılması için buradayım.',
                contact_phones: JSON.stringify(['0555 123 45 67', '0532 987 65 43']),
                contact_emails: JSON.stringify(['info@fotomiray.com', 'miray@fotomiray.com']),
                contact_address_short: 'İstanbul, Türkiye',
                contact_address_full: 'Beşiktaş, İstanbul, Türkiye',
                contact_google_maps_url: 'https://maps.google.com',
                instagram_url: 'https://instagram.com/fotomiray',
                instagram_username: '@fotomiray',
                working_hours: JSON.stringify([
                    { day: 'Pazartesi', hours: '09:00 - 18:00' },
                    { day: 'Salı', hours: '09:00 - 18:00' },
                    { day: 'Çarşamba', hours: '09:00 - 18:00' },
                    { day: 'Perşembe', hours: '09:00 - 18:00' },
                    { day: 'Cuma', hours: '09:00 - 18:00' },
                    { day: 'Cumartesi', hours: '10:00 - 16:00' },
                    { day: 'Pazar', hours: 'Kapalı' }
                ])
            };

            await connection.execute(`
                INSERT INTO content (
                    hero_subtitle, about_title, about_text, contact_phones, 
                    contact_emails, contact_address_short, contact_address_full,
                    contact_google_maps_url, instagram_url, instagram_username, working_hours
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                defaultContent.hero_subtitle,
                defaultContent.about_title,
                defaultContent.about_text,
                defaultContent.contact_phones,
                defaultContent.contact_emails,
                defaultContent.contact_address_short,
                defaultContent.contact_address_full,
                defaultContent.contact_google_maps_url,
                defaultContent.instagram_url,
                defaultContent.instagram_username,
                defaultContent.working_hours
            ]);
            
            console.log('✅ Varsayılan içerik verileri eklendi');
        }
    } catch (error) {
        console.error('❌ Varsayılan içerik ekleme hatası:', error);
    }
}

module.exports = {
    pool,
    initializeDatabase,
    isConnected: () => isConnected
}; 