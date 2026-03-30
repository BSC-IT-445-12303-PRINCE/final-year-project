const Admin = require("../models/admin");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const Contact = require("../models/contact");

module.exports.renderAdminLoginForm = (req, res) => {
    res.render("./listing/users/adminLogin.ejs");
};

module.exports.sendOTP = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email);
        
        // Use SendGrid email service (HTTP API - works with Render)
        const { sendOTPEmail } = require("../utils/sendgridEmail");
        
        const admin = await Admin.findOne({ email });
        console.log("Admin found:", admin ? "Yes" : "No");
        
        if (!admin) {
            req.flash("error", "Invalid admin credentials");
            return res.redirect("/admin/login");
        }

        const isPasswordValid = await admin.comparePassword(password);
        console.log("Password valid:", isPasswordValid);
        
        if (!isPasswordValid) {
            req.flash("error", "Invalid admin credentials");
            return res.redirect("/admin/login");
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp);
        
        // Save OTP to admin
        admin.otp = otp;
        admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await admin.save();
        console.log("Admin saved with OTP");
        
        // Send OTP via SendGrid
        const emailSent = await sendOTPEmail(email, otp);
        
        if (emailSent) {
            req.flash("success", "OTP sent to your email!");
            res.redirect("/admin/verify-otp");
        } else {
            // Email failed - show OTP on page for debugging
            console.log('🔐 EMAIL FAILED - OTP FOR DEBUG:', otp);
            req.session.adminEmail = email;
            req.session.debugOTP = otp; // Store OTP in session for display
            return res.render("./listing/users/otpVerification.ejs", { 
                email, 
                debugOTP: otp,
                emailFailed: true 
            });
        }
    } catch (error) {
        console.error("SendOTP Error:", error);
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/login");
    }
};

module.exports.renderOTPVerification = (req, res) => {
    if (!req.session.adminEmail) {
        req.flash("error", "Please login first");
        return res.redirect("/admin/login");
    }
    res.render("./listing/users/otpVerification.ejs", { email: req.session.adminEmail });
};

module.exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.adminEmail;

        if (!email) {
            req.flash("error", "Session expired. Please login again");
            return res.redirect("/admin/login");
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            req.flash("error", "Admin not found");
            return res.redirect("/admin/login");
        }

        if (!admin.verifyOTP(otp)) {
            req.flash("error", "Invalid or expired OTP");
            return res.redirect("/admin/verify-otp");
        }

        admin.clearOTP();
        await admin.save();

        req.session.adminId = admin._id;
        req.session.adminEmail = null;
        
        req.flash("success", "Admin login successful");
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error in verifyOTP:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/admin/verify-otp");
    }
};

module.exports.renderDashboard = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) {
            req.flash("error", "Admin session expired");
            return res.redirect("/admin/login");
        }
        
        const totalUsers = await User.countDocuments();
        const totalListings = await Listing.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalContacts = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        
        res.render("./listing/users/adminDashboard.ejs", { 
            admin, 
            totalUsers, 
            totalListings,
            totalReviews,
            totalContacts,
            newContacts
        });
    } catch (error) {
        console.error("Error in renderDashboard:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/admin/login");
    }
};

module.exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/admin/login");
    });
};

// ============== USERS MANAGEMENT ==============
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        res.render("./listing/users/adminUsers.ejs", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        req.flash("error", "Failed to fetch users");
        res.redirect("/admin/dashboard");
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete user's listings and reviews
        await Listing.deleteMany({ owner: id });
        await Review.deleteMany({ author: id });
        
        // Delete user
        await User.findByIdAndDelete(id);
        
        req.flash("success", "User and all associated data deleted successfully");
        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash("error", "Failed to delete user");
        res.redirect("/admin/users");
    }
};

// ============== LISTINGS MANAGEMENT ==============
module.exports.getAllListings = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate('owner', 'username email')
            .populate('review')
            .sort({ createdAt: -1 });
        res.render("./listing/users/adminListings.ejs", { listings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        req.flash("error", "Failed to fetch listings");
        res.redirect("/admin/dashboard");
    }
};

module.exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete all reviews for this listing
        await Review.deleteMany({ listing: id });
        
        // Delete listing
        await Listing.findByIdAndDelete(id);
        
        req.flash("success", "Listing and all reviews deleted successfully");
        res.redirect("/admin/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        req.flash("error", "Failed to delete listing");
        res.redirect("/admin/listings");
    }
};

// ============== REVIEWS MANAGEMENT ==============
module.exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('author', 'username email')
            .populate('listing', 'title')
            .sort({ createdAt: -1 });
        res.render("./listing/users/adminReviews.ejs", { reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        req.flash("error", "Failed to fetch reviews");
        res.redirect("/admin/dashboard");
    }
};

module.exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find review to get listing ID
        const review = await Review.findById(id);
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect("/admin/reviews");
        }
        
        // Remove review reference from listing
        await Listing.findByIdAndUpdate(review.listing, {
            $pull: { reviews: id }
        });
        
        // Delete review
        await Review.findByIdAndDelete(id);
        
        req.flash("success", "Review deleted successfully");
        res.redirect("/admin/reviews");
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Failed to delete review");
        res.redirect("/admin/reviews");
    }
};

// ============== SETTINGS ==============
module.exports.getSettings = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        res.render("./listing/users/adminSettings.ejs", { admin });
    } catch (error) {
        console.error("Error fetching settings:", error);
        req.flash("error", "Failed to load settings");
        res.redirect("/admin/dashboard");
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.session.adminId);
        
        // Verify current password
        const isValid = await admin.comparePassword(currentPassword);
        if (!isValid) {
            req.flash("error", "Current password is incorrect");
            return res.redirect("/admin/settings");
        }
        
        // Update email
        if (email && email !== admin.email) {
            admin.email = email;
        }
        
        // Update password if provided
        if (newPassword && newPassword.trim() !== '') {
            admin.password = newPassword;
        }
        
        await admin.save();
        req.flash("success", "Profile updated successfully");
        res.redirect("/admin/settings");
    } catch (error) {
        console.error("Error updating profile:", error);
        req.flash("error", "Failed to update profile");
        res.redirect("/admin/settings");
    }
};

// ============== CONTACT MESSAGES MANAGEMENT ==============
module.exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 });
        
        // Count new messages
        const newContactsCount = await Contact.countDocuments({ status: 'new' });
        
        res.render("./listing/users/adminContacts.ejs", { 
            contacts,
            newContactsCount
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        req.flash("error", "Failed to load contact messages");
        res.redirect("/admin/dashboard");
    }
};

module.exports.getContactDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findById(id);
        
        if (!contact) {
            req.flash("error", "Contact message not found");
            return res.redirect("/admin/contacts");
        }
        
        // Mark as read if it was new
        if (contact.status === 'new') {
            contact.status = 'read';
            await contact.save();
        }
        
        res.render("./listing/users/adminContactDetail.ejs", { contact });
    } catch (error) {
        console.error("Error fetching contact detail:", error);
        req.flash("error", "Failed to load contact message");
        res.redirect("/admin/contacts");
    }
};

module.exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!contact) {
            req.flash("error", "Contact message not found");
            return res.redirect("/admin/contacts");
        }
        
        req.flash("success", "Status updated successfully");
        res.redirect(`/admin/contacts/${id}`);
    } catch (error) {
        console.error("Error updating contact status:", error);
        req.flash("error", "Failed to update status");
        res.redirect("/admin/contacts");
    }
};

module.exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Contact.findByIdAndDelete(id);
        
        req.flash("success", "Contact message deleted");
        res.redirect("/admin/contacts");
    } catch (error) {
        console.error("Error deleting contact:", error);
        req.flash("error", "Failed to delete contact message");
        res.redirect("/admin/contacts");
    }
};
