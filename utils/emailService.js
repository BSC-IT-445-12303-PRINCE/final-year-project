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
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    pool: false,
    maxConnections: 1,
    maxMessages: 1,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
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

const sendOTPEmail = async (email, otp, retries = 3) => {
    try {
        console.log('Attempting to send OTP to:', email);
        
        const mailOptions = {
            from: `"TravelSathi Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Admin Login OTP - TravelSathi',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Admin Login OTP</h2>
                    <p style="font-size: 16px; color: #555;">Your OTP for admin login is:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #007bff;">
                        <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully:', info.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending OTP email:', error.message);
        
        if (retries > 0 && (error.code === 'ESOCKET' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendOTPEmail(email, otp, retries - 1);
        }
        
        console.error('Full error:', error);
        return false;
    }
};

module.exports = { sendOTPEmail };
