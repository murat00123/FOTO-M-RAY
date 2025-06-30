const { pool } = require('../config/database');

class Photo {
    // Tüm fotoğrafları getir
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM photos ORDER BY upload_date DESC');
            return rows.map(photo => ({
                id: photo.id,
                filename: photo.filename,
                title: photo.title,
                description: photo.description,
                featured: Boolean(photo.featured),
                uploadDate: photo.upload_date,
                createdAt: photo.created_at
            }));
        } catch (error) {
            console.error('Photo getAll hatası:', error);
            throw error;
        }
    }

    // Öne çıkan fotoğrafları getir
    static async getFeatured() {
        try {
            const [rows] = await pool.execute('SELECT * FROM photos WHERE featured = TRUE ORDER BY upload_date DESC');
            return rows.map(photo => ({
                id: photo.id,
                filename: photo.filename,
                title: photo.title,
                description: photo.description,
                featured: Boolean(photo.featured),
                uploadDate: photo.upload_date,
                createdAt: photo.created_at
            }));
        } catch (error) {
            console.error('Photo getFeatured hatası:', error);
            throw error;
        }
    }

    // Yeni fotoğraf ekle
    static async create(data) {
        try {
            const query = `
                INSERT INTO photos (filename, title, description, featured, upload_date) 
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [
                data.filename,
                data.title || '',
                data.description || '',
                data.featured || false,
                new Date()
            ];

            const [result] = await pool.execute(query, values);
            
            // Oluşturulan fotoğrafı getir
            const [newPhoto] = await pool.execute('SELECT * FROM photos WHERE id = ?', [result.insertId]);
            
            return {
                id: newPhoto[0].id,
                filename: newPhoto[0].filename,
                title: newPhoto[0].title,
                description: newPhoto[0].description,
                featured: Boolean(newPhoto[0].featured),
                uploadDate: newPhoto[0].upload_date,
                createdAt: newPhoto[0].created_at
            };
        } catch (error) {
            console.error('Photo create hatası:', error);
            throw error;
        }
    }

    // Fotoğrafları sil
    static async deleteMany(ids) {
        try {
            if (!ids || ids.length === 0) return false;
            
            const placeholders = ids.map(() => '?').join(',');
            const query = `DELETE FROM photos WHERE id IN (${placeholders})`;
            
            const [result] = await pool.execute(query, ids);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Photo deleteMany hatası:', error);
            throw error;
        }
    }

    // Öne çıkan fotoğrafları güncelle
    static async updateFeatured(featuredIds) {
        try {
            // Önce tüm fotoğrafları öne çıkan olmayan yap
            await pool.execute('UPDATE photos SET featured = FALSE');
            
            // Seçilen fotoğrafları öne çıkan yap
            if (featuredIds && featuredIds.length > 0) {
                const placeholders = featuredIds.map(() => '?').join(',');
                const query = `UPDATE photos SET featured = TRUE WHERE id IN (${placeholders})`;
                await pool.execute(query, featuredIds);
            }
            
            return true;
        } catch (error) {
            console.error('Photo updateFeatured hatası:', error);
            throw error;
        }
    }

    // ID'ye göre fotoğraf getir
    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM photos WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            
            const photo = rows[0];
            return {
                id: photo.id,
                filename: photo.filename,
                title: photo.title,
                description: photo.description,
                featured: Boolean(photo.featured),
                uploadDate: photo.upload_date,
                createdAt: photo.created_at
            };
        } catch (error) {
            console.error('Photo getById hatası:', error);
            throw error;
        }
    }
}

module.exports = Photo; 