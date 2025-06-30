const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class AdminUser {
    // Kullanıcı adı ile admin getir
    static async getByUsername(username) {
        try {
            const [rows] = await pool.execute('SELECT * FROM admin_users WHERE username = ?', [username]);
            if (rows.length === 0) return null;
            
            const user = rows[0];
            return {
                id: user.id,
                username: user.username,
                passwordHash: user.password_hash,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
        } catch (error) {
            console.error('AdminUser getByUsername hatası:', error);
            throw error;
        }
    }

    // Giriş doğrulama
    static async authenticate(username, password) {
        try {
            const user = await this.getByUsername(username);
            if (!user) return null;
            
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) return null;
            
            return {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            console.error('AdminUser authenticate hatası:', error);
            throw error;
        }
    }

    // Kullanıcı adını güncelle
    static async updateUsername(currentUsername, newUsername, currentPassword) {
        try {
            // Önce mevcut kullanıcıyı doğrula
            const user = await this.authenticate(currentUsername, currentPassword);
            if (!user) {
                throw new Error('Mevcut şifre yanlış');
            }

            // Yeni kullanıcı adının mevcut olup olmadığını kontrol et
            const existingUser = await this.getByUsername(newUsername);
            if (existingUser && existingUser.id !== user.id) {
                throw new Error('Bu kullanıcı adı zaten kullanılıyor');
            }

            // Kullanıcı adını güncelle
            const [result] = await pool.execute(
                'UPDATE admin_users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newUsername, user.id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('AdminUser updateUsername hatası:', error);
            throw error;
        }
    }

    // Şifreyi güncelle
    static async updatePassword(username, currentPassword, newPassword) {
        try {
            // Önce mevcut kullanıcıyı doğrula
            const user = await this.authenticate(username, currentPassword);
            if (!user) {
                throw new Error('Mevcut şifre yanlış');
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Şifreyi güncelle
            const [result] = await pool.execute(
                'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, user.id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('AdminUser updatePassword hatası:', error);
            throw error;
        }
    }

    // Yeni admin kullanıcısı oluştur
    static async create(username, password) {
        try {
            // Kullanıcı adının mevcut olup olmadığını kontrol et
            const existingUser = await this.getByUsername(username);
            if (existingUser) {
                throw new Error('Bu kullanıcı adı zaten kullanılıyor');
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // Kullanıcıyı oluştur
            const [result] = await pool.execute(
                'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
                [username, hashedPassword]
            );

            // Oluşturulan kullanıcıyı getir
            const [newUser] = await pool.execute('SELECT * FROM admin_users WHERE id = ?', [result.insertId]);
            
            return {
                id: newUser[0].id,
                username: newUser[0].username,
                createdAt: newUser[0].created_at,
                updatedAt: newUser[0].updated_at
            };
        } catch (error) {
            console.error('AdminUser create hatası:', error);
            throw error;
        }
    }
}

module.exports = AdminUser; 