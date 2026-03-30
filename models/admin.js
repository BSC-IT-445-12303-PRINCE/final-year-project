const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'admin'
    }
});

adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    return otp;
};

adminSchema.methods.verifyOTP = function(enteredOTP) {
    if (!this.otp || !this.otpExpires) {
        return false;
    }
    if (Date.now() > this.otpExpires) {
        return false;
    }
    return this.otp === enteredOTP;
};

adminSchema.methods.clearOTP = function() {
    this.otp = null;
    this.otpExpires = null;
    this.isVerified = true;
};

module.exports = mongoose.model('Admin', adminSchema);
