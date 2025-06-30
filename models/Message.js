const { pool } = require('../config/database');

class Message {
    // Tüm mesajları getir
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
            return rows.map(message => ({
                id: message.id,
                name: message.name,
                email: message.email,
                phone: message.phone,
                service: message.service,
                date: message.date,
                message: message.message,
                read: Boolean(message.is_read),
                timestamp: message.created_at
            }));
        } catch (error) {
            console.error('Message getAll hatası:', error);
            throw error;
        }
    }

    // Yeni mesaj ekle
    static async create(data) {
        try {
            const query = `
                INSERT INTO messages (name, email, phone, service, date, message, is_read) 
                VALUES (?, ?, ?, ?, ?, ?, FALSE)
            `;
            const values = [
                data.name,
                data.email,
                data.phone || null,
                data.service || null,
                data.date || null,
                data.message
            ];

            const [result] = await pool.execute(query, values);
            
            // Oluşturulan mesajı getir
            const [newMessage] = await pool.execute('SELECT * FROM messages WHERE id = ?', [result.insertId]);
            
            return {
                id: newMessage[0].id,
                name: newMessage[0].name,
                email: newMessage[0].email,
                phone: newMessage[0].phone,
                service: newMessage[0].service,
                date: newMessage[0].date,
                message: newMessage[0].message,
                read: Boolean(newMessage[0].is_read),
                timestamp: newMessage[0].created_at
            };
        } catch (error) {
            console.error('Message create hatası:', error);
            throw error;
        }
    }

    // Mesajı okundu olarak işaretle
    static async markAsRead(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE messages SET is_read = TRUE WHERE id = ?', 
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Message markAsRead hatası:', error);
            throw error;
        }
    }

    // Mesajı sil
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM messages WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Message delete hatası:', error);
            throw error;
        }
    }

    // ID'ye göre mesaj getir
    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM messages WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            
            const message = rows[0];
            return {
                id: message.id,
                name: message.name,
                email: message.email,
                phone: message.phone,
                service: message.service,
                date: message.date,
                message: message.message,
                read: Boolean(message.is_read),
                timestamp: message.created_at
            };
        } catch (error) {
            console.error('Message getById hatası:', error);
            throw error;
        }
    }

    // Okunmamış mesaj sayısını getir
    static async getUnreadCount() {
        try {
            const [rows] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE is_read = FALSE');
            return rows[0].count;
        } catch (error) {
            console.error('Message getUnreadCount hatası:', error);
            throw error;
        }
    }
}

module.exports = Message; 