// TEMPORARY: Create admin via HTTP request
// Use this once, then remove this file

const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

// GET /setup-admin - Create admin (run once, then delete this route)
router.get('/setup-admin', async (req, res) => {
    try {
        const email = process.env.ADMIN_EMAIL || 'princekumar46399@gmail.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123456';
        
        // Check if exists
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.send('Admin already exists! Login at /admin/login');
        }
        
        // Create admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ email, password: hashedPassword });
        await admin.save();
        
        res.send(`✅ Admin created! Email: ${email}<br>Delete this route after use!`);
        
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

module.exports = router;
