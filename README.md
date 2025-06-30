# 📸 FOTO MİRAY - Photography Portfolio Website

Modern, responsive photography portfolio website with admin panel and messaging system.

## 🚀 Features

- **Portfolio Gallery**: Beautiful photo showcase with responsive grid layout
- **Admin Panel**: Full-featured admin interface for content management
- **Contact System**: Contact form with message management
- **MySQL Integration**: Full database support with JSON fallback
- **Responsive Design**: Mobile-first design approach
- **Dark Theme Admin**: Modern dark-themed admin interface

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, CSS3, JavaScript
- **Database**: MySQL with JSON fallback
- **Authentication**: bcrypt, express-session
- **File Upload**: Multer
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (for production) - optional, falls back to JSON
- Vercel account (for deployment)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/murat00123/FOTO-M-RAY.git
cd FOTO-M-RAY
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file (copy from .env.example):
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env` file

5. Run the application:
```bash
npm start
```

## 🌐 Vercel Deployment

### 1. Environment Variables

In your Vercel dashboard, add these environment variables:

```
DB_HOST=your-mysql-host.com
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=foto_miray
DB_PORT=3306
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production
```

### 2. Database Options

**Option A: PlanetScale (Recommended)**
- Free MySQL hosting
- Automatic scaling
- Built-in branching

**Option B: Railway/AWS RDS**
- Traditional MySQL hosting
- More configuration options

**Option C: JSON Fallback**
- No database setup required
- Data stored in JSON files
- Good for testing/demo

### 3. Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add

# Redeploy with env vars
vercel --prod
```

## 📁 Project Structure

```
FOTO-MIRAY/
├── config/
│   └── database.js          # Database configuration
├── data/                    # JSON data files (fallback)
├── models/                  # Database models
├── public/                  # Static assets
├── uploads/                 # Uploaded files
├── views/                   # EJS templates
├── server.js               # Main server file
├── vercel.json             # Vercel configuration
└── package.json
```

## 🔑 Admin Panel

- **URL**: `/admin/login`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`

### Admin Features:
- Content management
- Photo gallery management
- Message inbox
- User credential updates

## 🎨 Customization

1. **Styling**: Edit files in `public/css/`
2. **Templates**: Modify EJS files in `views/`
3. **Content**: Use admin panel or edit JSON files
4. **Database**: Configure MySQL connection in `config/database.js`

## 📸 Photo Upload

- Supports: JPG, PNG, GIF
- Max size: 5MB per file
- Auto-resize for optimization
- Gallery management through admin panel

## 🔒 Security Features

- Password hashing with bcrypt
- Session management
- CSRF protection
- Input validation
- File upload security

## 🚦 Environment Modes

- **Development**: JSON file system, local MySQL
- **Production**: Cloud database, secure sessions

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@domain.com]

## 📄 License

MIT License - see LICENSE file for details

---

Made with ❤️ for photographers 