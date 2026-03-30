# TravelSathi - Deploy Instructions

## Render Deployment

### 1. Environment Variables
Add these environment variables in your Render dashboard:

```
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
SECRET=your-secret-key-here
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 2. Build Command
```
npm install
```

### 3. Start Command
```
node deploy-app.js
```

### 4. Required Files for Deployment
- ✅ `deploy-app.js` (Clean main file without admin)
- ✅ `package.json` (Dependencies)
- ✅ `.env.example` (Environment variables template)
- ✅ `views/` folder (EJS templates)
- ✅ `public/` folder (Static assets)
- ✅ `models/` folder (Database models)
- ✅ `routes/` folder (Routes - except admin)
- ✅ `controllers/` folder (Controllers - except admin)
- ✅ `middleware.js` (Authentication middleware)
- ✅ `schema.js` (Validation schemas)
- ✅ `utils/` folder (Helper utilities)

### 5. Files to Exclude
- ❌ `app.js` (Use `deploy-app.js` instead)
- ❌ `routes/admin.js`
- ❌ `controllers/adminController.js`
- ❌ `createAdmin.js`
- ❌ Admin-related views

### 6. Features Available
- ✅ User Authentication (Register/Login)
- ✅ Listing Management (Create/Read/Update/Delete)
- ✅ Review System
- ✅ Image Upload (Cloudinary)
- ✅ Map Integration (Leaflet.js)
- ✅ Contact Form
- ✅ Static Pages (Privacy, Terms, Help)

### 7. Quick Deploy Steps
1. Push code to GitHub
2. Connect GitHub to Render
3. Select "Web Service"
4. Set build command: `npm install`
5. Set start command: `node deploy-app.js`
6. Add environment variables
7. Deploy! 🚀

### 8. Post-Deployment
- Create admin account manually if needed
- Test all user flows
- Verify image uploads work
- Check map functionality
- Test contact form
