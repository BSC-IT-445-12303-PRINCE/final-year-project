const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware.js");

// Login routes (no auth required)
router.route("/login")
    .get(adminController.renderAdminLoginForm)
    .post(adminController.sendOTP);

router.get("/verify-otp", adminController.renderOTPVerification);
router.post("/verify-otp", adminController.verifyOTP);
router.get("/logout", adminController.logout);

// Dashboard
router.get("/dashboard", isAdmin, adminController.renderDashboard);

// ============== USERS MANAGEMENT ==============
router.get("/users", isAdmin, adminController.getAllUsers);
router.delete("/users/:id", isAdmin, adminController.deleteUser);

// ============== LISTINGS MANAGEMENT ==============
router.get("/listings", isAdmin, adminController.getAllListings);
router.delete("/listings/:id", isAdmin, adminController.deleteListing);

// ============== REVIEWS MANAGEMENT ==============
router.get("/reviews", isAdmin, adminController.getAllReviews);
router.delete("/reviews/:id", isAdmin, adminController.deleteReview);

// ============== SETTINGS ==============
router.get("/settings", isAdmin, adminController.getSettings);
router.post("/settings", isAdmin, adminController.updateProfile);

// ============== CONTACT MESSAGES ==============
router.get("/contacts", isAdmin, adminController.getAllContacts);
router.get("/contacts/:id", isAdmin, adminController.getContactDetail);
router.post("/contacts/:id/status", isAdmin, adminController.updateContactStatus);
router.delete("/contacts/:id", isAdmin, adminController.deleteContact);

module.exports = router;
