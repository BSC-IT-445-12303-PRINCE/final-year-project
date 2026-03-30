const nodemailer = require('nodemailer');

// Load environment variables if not already loaded
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Debug: Check if env variables are loaded
console.log('Email Config:', {
    user: process.env.EMAIL_USER ? 'Set (' + process.env.EMAIL_USER.substring(0, 5) + '...)' : 'Not Set',
    pass: process.env.EMAIL_PASS ? 'Set (' + process.env.EMAIL_PASS.substring(0, 3) + '...)' : 'Not Set'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Transporter verification failed:', error.message);
        console.error('Please check your EMAIL_USER and EMAIL_PASS in .env file');
    } else {
        console.log('Transporter is ready to send emails');
    }
});

const sendOTPEmail = async (email, otp) => {
    try {
        console.log('Attempting to send OTP to:', email);
        
        const mailOptions = {
            from: `"Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Admin Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Admin Login OTP</h2>
                    <p>Your OTP for admin login is:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</span>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

module.exports = { sendOTPEmail };
