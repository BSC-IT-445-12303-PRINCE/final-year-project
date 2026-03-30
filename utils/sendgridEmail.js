const sgMail = require('@sendgrid/mail');

// Load environment variables if not already loaded
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Debug: Check if env variables are loaded
console.log('SendGrid Config:', {
    apiKey: process.env.SENDGRID_API_KEY ? 'Set (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : 'Not Set',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'Not Set'
});

// Set API Key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendOTPEmail = async (email, otp, retries = 3) => {
    try {
        console.log('Attempting to send OTP via SendGrid to:', email);
        
        if (!process.env.SENDGRID_API_KEY) {
            console.error('❌ SENDGRID_API_KEY not set');
            return false;
        }
        
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@travelsathi.com',
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

        const response = await sgMail.send(msg);
        console.log('✅ OTP email sent successfully via SendGrid:', response[0].statusCode);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending OTP email via SendGrid:', error.message);
        
        if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendOTPEmail(email, otp, retries - 1);
        }
        
        if (error.response) {
            console.error('SendGrid API Error:', error.response.body);
        }
        console.error('Full error:', error);
        return false;
    }
};

module.exports = { sendOTPEmail };
