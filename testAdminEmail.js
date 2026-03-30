require('dotenv').config();

const mongoose = require('mongoose');
const Admin = require('./models/admin');

async function testAdminAndEmail() {
    try {
        await mongoose.connect(process.env.ATLASDB_URL);
        console.log('Connected to database');

        // Load email service after dotenv is configured
        const { sendOTPEmail } = require('./utils/emailService');
        
        // 1. Check if admin exists
        let admin = await Admin.findOne({ email: 'princekumar46399@gmail.com' });
        console.log('Admin exists:', admin ? 'Yes' : 'No');

        if (!admin) {
            console.log('Creating admin...');
            admin = new Admin({
                email: 'princekumar46399@gmail.com',
                password: 'admin123456'
            });
            await admin.save();
            console.log('Admin created');
        }

        // 2. Test password
        const isValid = await admin.comparePassword('admin123456');
        console.log('Password valid:', isValid);

        // 3. Generate OTP
        const otp = admin.generateOTP();
        console.log('Generated OTP:', otp);
        await admin.save();

        // 4. Send email
        console.log('Sending OTP email...');
        const result = await sendOTPEmail('princekumar46399@gmail.com', otp);
        console.log('Email sent:', result);

        // 5. Check admin in DB
        const updatedAdmin = await Admin.findOne({ email: 'princekumar46399@gmail.com' });
        console.log('Admin OTP in DB:', updatedAdmin.otp);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testAdminAndEmail();
