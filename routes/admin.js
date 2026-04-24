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
router.get("/listings/new", isAdmin, adminController.renderNewListingForm);
router.post("/listings", isAdmin, adminController.createListing);
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

// ============== BOOKINGS MANAGEMENT ==============
const bookingController = require("../controllers/booking.js");
router.get("/bookings", isAdmin, bookingController.getAllBookings);
router.get("/bookings/:id", isAdmin, bookingController.getBookingDetail);
router.post("/bookings/:id/status", isAdmin, bookingController.updateBookingStatus);
router.post("/bookings/:id/payment", isAdmin, bookingController.updatePaymentStatus);
router.delete("/bookings/:id", isAdmin, bookingController.deleteBooking);

module.exports = router;
