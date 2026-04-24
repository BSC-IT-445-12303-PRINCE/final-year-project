const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Show booking form for a listing
module.exports.showBookingForm = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        res.render("./listing/bookingForm", { listing });
    } catch (error) {
        console.error("Error showing booking form:", error);
        req.flash("error", "Something went wrong");
        res.redirect(`/listings/${id}`);
    }
};

// Create a new booking
module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        const { checkIn, checkOut, adults, children, fullName, email, phone, specialRequests } = req.body;
        
        // Calculate nights and total price
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * listing.price;
        
        const booking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: {
                adults: parseInt(adults) || 1,
                children: parseInt(children) || 0
            },
            totalNights: nights,
            pricePerNight: listing.price,
            totalPrice: totalPrice,
            guestInfo: {
                fullName,
                email,
                phone,
                specialRequests
            }
        });
        
        await booking.save();
        
        // Redirect to payment page
        res.redirect(`/bookings/${booking._id}/payment`);
    } catch (error) {
        console.error("Error creating booking:", error);
        req.flash("error", "Failed to create booking");
        res.redirect(`/listings/${id}`);
    }
};

// Show payment page
module.exports.showPaymentPage = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate("listing");
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/listings");
        }
        
        // Check if booking belongs to current user
        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/listings");
        }
        
        res.render("./listing/payment", { booking });
    } catch (error) {
        console.error("Error showing payment page:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

// Process Payment (Card/Cash/UPI)
module.exports.processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, upiId, cashNotes } = req.body;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/bookings/my");
        }
        
        // Check if booking belongs to current user
        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/bookings/my");
        }
        
        // Update payment based on method
        booking.payment.status = "pending"; // Will be confirmed by admin
        booking.payment.method = paymentMethod;
        
        if (paymentMethod === "upi") {
            booking.payment.upiId = upiId;
            booking.payment.notes = `UPI Payment from ${upiId}`;
        } else if (paymentMethod === "cash") {
            booking.payment.notes = cashNotes || "Cash payment at check-in";
        } else if (paymentMethod === "card") {
            booking.payment.notes = "Card payment - awaiting confirmation";
        }
        
        await booking.save();
        
        req.flash("success", `Payment request submitted via ${paymentMethod.toUpperCase()}. Admin will verify shortly.`);
        res.redirect("/bookings/my");
    } catch (error) {
        console.error("Error processing payment:", error);
        req.flash("error", "Failed to process payment");
        res.redirect(`/bookings/${id}/payment`);
    }
};

// Get user's bookings
module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });
        
        res.render("./listing/myBookings", { bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        req.flash("error", "Failed to load bookings");
        res.redirect("/listings");
    }
};

// Cancel booking (user can only cancel pending bookings)
module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/bookings/my");
        }
        
        // Check if booking belongs to current user
        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/bookings/my");
        }
        
        // Only pending bookings can be cancelled by user
        if (booking.status !== "pending") {
            req.flash("error", "Only pending bookings can be cancelled");
            return res.redirect("/bookings/my");
        }
        
        booking.status = "cancelled";
        await booking.save();
        
        req.flash("success", "Booking cancelled successfully");
        res.redirect("/bookings/my");
    } catch (error) {
        console.error("Error cancelling booking:", error);
        req.flash("error", "Failed to cancel booking");
        res.redirect("/bookings/my");
    }
};

// ============================================
// ADMIN BOOKING MANAGEMENT
// ============================================

// Get all bookings (Admin only)
module.exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("listing", "title images location")
            .populate("user", "username email")
            .sort({ createdAt: -1 });
        
        res.render("./listing/users/adminBookings", { bookings });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        req.flash("error", "Failed to fetch bookings");
        res.redirect("/admin/dashboard");
    }
};

// Get booking detail (Admin only)
module.exports.getBookingDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate("listing")
            .populate("user", "username email");
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/admin/bookings");
        }
        
        res.render("./listing/users/adminBookingDetail", { booking });
    } catch (error) {
        console.error("Error fetching booking detail:", error);
        req.flash("error", "Failed to load booking details");
        res.redirect("/admin/bookings");
    }
};

// Update booking status (Admin only)
module.exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/admin/bookings");
        }
        
        req.flash("success", `Booking status updated to ${status}`);
        res.redirect(`/admin/bookings/${id}`);
    } catch (error) {
        console.error("Error updating booking status:", error);
        req.flash("error", "Failed to update booking status");
        res.redirect(`/admin/bookings/${id}`);
    }
};

// Update payment status (Admin only)
module.exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/admin/bookings");
        }
        
        booking.payment.status = paymentStatus;
        if (paymentStatus === "paid") {
            booking.payment.paidAt = new Date();
        }
        await booking.save();
        
        req.flash("success", `Payment status updated to ${paymentStatus}`);
        res.redirect(`/admin/bookings/${id}`);
    } catch (error) {
        console.error("Error updating payment status:", error);
        req.flash("error", "Failed to update payment status");
        res.redirect(`/admin/bookings/${id}`);
    }
};

// Delete booking (Admin only)
module.exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Booking.findByIdAndDelete(id);
        
        req.flash("success", "Booking deleted successfully");
        res.redirect("/admin/bookings");
    } catch (error) {
        console.error("Error deleting booking:", error);
        req.flash("error", "Failed to delete booking");
        res.redirect("/admin/bookings");
    }
};
