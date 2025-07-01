const { pool, isConnected } = require('../config/database');
const fs = require('fs');
const path = require('path');

// JSON fallback için dosya yolu
const contentFile = path.join(__dirname, '../data/content.json');

class Content {
    // JSON dosyasından veri oku
    static getFromJSON() {
        try {
            if (fs.existsSync(contentFile)) {
                const data = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
                return {
                    heroSubtitle: data.heroSubtitle || data.heroTitle || 'Anılarınızı Sanat Eserine Dönüştürüyoruz',
                    aboutTitle: data.aboutTitle || 'Merhaba, Ben Miray',
                    aboutText: data.aboutText || 'Fotoğrafçılık tutkum ile sizlerin en özel anlarını ölümsüzleştiriyorum.',
                    contactPhones: data.contactPhones || [data.contactPhone1, data.contactPhone2].filter(Boolean) || ['0555 123 45 67'],
                    contactEmails: data.contactEmails || [data.contactEmail1, data.contactEmail2].filter(Boolean) || ['info@fotomiray.com'],
                    contactAddressShort: data.contactAddressShort || 'İstanbul, Türkiye',
                    contactAddressFull: data.contactAddressFull || 'Beşiktaş, İstanbul, Türkiye',
                    contactGoogleMapsUrl: data.contactGoogleMapsUrl || 'https://maps.google.com',
                    instagramUrl: data.instagramUrl || 'https://instagram.com/fotomiray',
                    instagramUsername: data.instagramUsername || '@fotomiray',
                    workingHours: data.workingHours || [
                        { day: 'Pazartesi', hours: '09:00 - 18:00' },
                        { day: 'Salı', hours: '09:00 - 18:00' },
                        { day: 'Çarşamba', hours: '09:00 - 18:00' },
                        { day: 'Perşembe', hours: '09:00 - 18:00' },
                        { day: 'Cuma', hours: '09:00 - 18:00' },
                        { day: 'Cumartesi', hours: '10:00 - 16:00' },
                        { day: 'Pazar', hours: 'Kapalı' }
                    ]
                };
            }
            return null;
        } catch (error) {
            console.error('JSON content okuma hatası:', error);
            return null;
        }
    }

    // JSON dosyasına veri yaz
    static saveToJSON(data) {
        try {
            const dir = path.dirname(contentFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(contentFile, JSON.stringify(data, null, 4));
            return true;
        } catch (error) {
            console.error('JSON content yazma hatası:', error);
            return false;
        }
    }

    // Tüm içeriği getir
    static async getAll() {
        try {
            if (isConnected() && pool) {
                const [rows] = await pool.execute('SELECT * FROM content ORDER BY id DESC LIMIT 1');
                if (rows.length === 0) return this.getFromJSON();
                
                const content = rows[0];
                
                // JSON alanları parse et (MySQL zaten otomatik parse ediyor olabilir)
                let contactPhones = [];
                if (content.contact_phones) {
                    if (Array.isArray(content.contact_phones)) {
                        contactPhones = content.contact_phones;
                    } else if (typeof content.contact_phones === 'string') {
                        try {
                            contactPhones = JSON.parse(content.contact_phones);
                        } catch (e) {
                            console.error('contact_phones JSON parse hatası:', content.contact_phones);
                            contactPhones = ['0555 123 45 67'];
                        }
                    }
                } else {
                    contactPhones = ['0555 123 45 67'];
                }
                
                let contactEmails = [];
                if (content.contact_emails) {
                    if (Array.isArray(content.contact_emails)) {
                        contactEmails = content.contact_emails;
                    } else if (typeof content.contact_emails === 'string') {
                        try {
                            contactEmails = JSON.parse(content.contact_emails);
                        } catch (e) {
                            console.error('contact_emails JSON parse hatası:', content.contact_emails);
                            contactEmails = ['info@fotomiray.com'];
                        }
                    }
                } else {
                    contactEmails = ['info@fotomiray.com'];
                }
                
                let workingHours = [];
                if (content.working_hours) {
                    if (Array.isArray(content.working_hours)) {
                        workingHours = content.working_hours;
                    } else if (typeof content.working_hours === 'string') {
                        try {
                            workingHours = JSON.parse(content.working_hours);
                        } catch (e) {
                            console.error('working_hours JSON parse hatası:', content.working_hours);
                            workingHours = [
                                { day: 'Pazartesi', hours: '09:00 - 18:00' },
                                { day: 'Salı', hours: '09:00 - 18:00' },
                                { day: 'Çarşamba', hours: '09:00 - 18:00' },
                                { day: 'Perşembe', hours: '09:00 - 18:00' },
                                { day: 'Cuma', hours: '09:00 - 18:00' },
                                { day: 'Cumartesi', hours: '10:00 - 16:00' },
                                { day: 'Pazar', hours: 'Kapalı' }
                            ];
                        }
                    }
                } else {
                    workingHours = [
                        { day: 'Pazartesi', hours: '09:00 - 18:00' },
                        { day: 'Salı', hours: '09:00 - 18:00' },
                        { day: 'Çarşamba', hours: '09:00 - 18:00' },
                        { day: 'Perşembe', hours: '09:00 - 18:00' },
                        { day: 'Cuma', hours: '09:00 - 18:00' },
                        { day: 'Cumartesi', hours: '10:00 - 16:00' },
                        { day: 'Pazar', hours: 'Kapalı' }
                    ];
                }
                
                // Camel case'e çevir
                return {
                    id: content.id,
                    heroSubtitle: content.hero_subtitle || 'Anılarınızı Sanat Eserine Dönüştürüyoruz',
                    aboutTitle: content.about_title || 'Merhaba, Ben Miray',
                    aboutText: content.about_text || 'Fotoğrafçılık tutkum ile sizlerin en özel anlarını ölümsüzleştiriyorum.',
                    contactPhones: contactPhones,
                    contactEmails: contactEmails,
                    contactAddressShort: content.contact_address_short || 'İstanbul, Türkiye',
                    contactAddressFull: content.contact_address_full || 'Beşiktaş, İstanbul, Türkiye',
                    contactGoogleMapsUrl: content.contact_google_maps_url || 'https://maps.google.com',
                    instagramUrl: content.instagram_url || 'https://instagram.com/fotomiray',
                    instagramUsername: content.instagram_username || '@fotomiray',
                    workingHours: workingHours,
                    createdAt: content.created_at,
                    updatedAt: content.updated_at
                };
            } else {
                // MySQL bağlantısı yoksa JSON kullan
                return this.getFromJSON();
            }
        } catch (error) {
            console.error('Content getAll hatası:', error);
            // Hata durumunda JSON'a fallback
            return this.getFromJSON();
        }
    }

    // İçeriği güncelle
    static async update(data) {
        try {
            if (isConnected() && pool) {
                const query = `
                    UPDATE content SET 
                        hero_subtitle = ?,
                        about_title = ?,
                        about_text = ?,
                        contact_phones = ?,
                        contact_emails = ?,
                        contact_address_short = ?,
                        contact_address_full = ?,
                        contact_google_maps_url = ?,
                        instagram_url = ?,
                        instagram_username = ?,
                        working_hours = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = (SELECT id FROM (SELECT id FROM content ORDER BY id DESC LIMIT 1) as temp)
                `;

                const values = [
                    data.heroSubtitle,
                    data.aboutTitle,
                    data.aboutText,
                    JSON.stringify(data.contactPhones || []),
                    JSON.stringify(data.contactEmails || []),
                    data.contactAddressShort,
                    data.contactAddressFull,
                    data.contactGoogleMapsUrl,
                    data.instagramUrl,
                    data.instagramUsername,
                    JSON.stringify(data.workingHours || [])
                ];

                const [result] = await pool.execute(query, values);
                return result.affectedRows > 0;
            } else {
                // MySQL bağlantısı yoksa JSON kullan
                return this.saveToJSON(data);
            }
        } catch (error) {
            console.error('Content update hatası:', error);
            // Hata durumunda JSON'a fallback
            return this.saveToJSON(data);
        }
    }
}

module.exports = Content; 