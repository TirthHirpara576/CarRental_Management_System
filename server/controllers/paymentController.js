import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// ======================
// Razorpay Instance
// ======================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});


// ======================
// Create Razorpay Order
// ======================
export const createRazorpayOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user._id;

        // Find Booking
        const booking = await Booking.findById(bookingId).populate("car");

        if(!booking) {
            return res.status(404).json({success: false,message: "Booking not found",});
        }

        // Verify user owns this booking
        if(booking.user.toString() !== userId.toString()) {
            return res.status(403).json({success: false,message: "Unauthorized to create payment for this booking",});
        }

        // Owner must approve first
        if(booking.status !== "approved") {
            return res.status(400).json({success: false,message: "Booking must be approved by owner before payment",});
        }

        // Create Razorpay Order First
        const options = {
            amount: booking.price * 100, // Amount in paise
            currency: "INR",
            receipt: booking._id.toString(),
            payment_capture: 1, // Auto capture payment
        };
        const order = await razorpay.orders.create(options); // Create order in Razorpay

        // Create or Update Payment Record with Razorpay Order ID
        let payment = await Payment.findOne({ booking: bookingId }); // Check if payment record already exists for this booking
        if (!payment) {
            payment = await Payment.create({
                booking: bookingId,
                user: userId,
                owner: booking.owner,
                car: booking.car._id,
                razorpay_order_id: order.id,
                amount: booking.price,
                currency: "INR",
                paymentStatus: "created",
            });
        } else {
            payment.razorpay_order_id = order.id;
            payment.paymentStatus = "created";
            await payment.save();
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID,
            },
            paymentId: payment._id,
        });
    }
    catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ======================
// Verify Payment
// ======================
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
        } = req.body;

        // Generate Signature for verification
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // Verify Signature
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - Invalid signature",
            });
        }

        // Find and Update Payment Record
        const payment = await Payment.findOne({ razorpay_order_id });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }

        payment.razorpay_payment_id = razorpay_payment_id;
        payment.razorpay_signature = razorpay_signature;
        payment.paymentStatus = "paid";
        await payment.save();

        // Update Booking Status to Paid
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                status: "paid",
                payment: payment._id,
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            booking,
        });
    }
    catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ======================
// Get Payment Details
// ======================
export const getPaymentDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const payment = await Payment.findOne({ booking: bookingId })
            .populate("booking user owner car");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            payment,
        });
    }
    catch (error) {
        console.error("Get Payment Details Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};