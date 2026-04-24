const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const bookingController = require("../controllers/booking.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

// User booking routes (require login)
router.get("/my", isLoggedIn, wrapAsync(bookingController.getUserBookings));

// Booking form and creation
router.get("/new/:id", isLoggedIn, wrapAsync(bookingController.showBookingForm));
router.post("/create/:id", isLoggedIn, wrapAsync(bookingController.createBooking));

// Payment page
router.get("/:id/payment", isLoggedIn, wrapAsync(bookingController.showPaymentPage));
router.post("/:id/payment/process", isLoggedIn, wrapAsync(bookingController.processPayment));

// Cancel booking
router.post("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

// Admin booking routes (require admin)
router.get("/admin/all", isAdmin, wrapAsync(bookingController.getAllBookings));
router.get("/admin/:id", isAdmin, wrapAsync(bookingController.getBookingDetail));
router.post("/admin/:id/status", isAdmin, wrapAsync(bookingController.updateBookingStatus));
router.post("/admin/:id/payment", isAdmin, wrapAsync(bookingController.updatePaymentStatus));
router.delete("/admin/:id", isAdmin, wrapAsync(bookingController.deleteBooking));

module.exports = router;
