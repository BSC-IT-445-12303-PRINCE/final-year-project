// TEMPORARY: Create admin via HTTP request
// Use this once, then remove this file

const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

// GET /setup-admin - Create or reset admin
router.get('/setup-admin', async (req, res) => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        
        // Check if exists and delete
        const existing = await Admin.findOne({ email });
        if (existing) {
            await Admin.deleteOne({ email });
            console.log('Deleted existing admin');
        }
        
        // Create fresh admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ email, password: hashedPassword });
        await admin.save();
        
        res.send(`✅ Admin reset! Email: ${email}<br>Password: ${password}<br>Login at /admin/login`);
        
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

module.exports = router;
