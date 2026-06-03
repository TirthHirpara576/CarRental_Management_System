// server/routes/paymentRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import {
   createRazorpayOrder,
   verifyPayment,
   getPaymentDetails,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

// ==============================
// Create Razorpay Order
// ==============================

paymentRoutes.post("/create-order", protect, createRazorpayOrder);

// ==============================
// Verify Payment
// ==============================

paymentRoutes.post("/verify-payment", protect, verifyPayment);

// ==============================
// Get Payment Details
// ==============================

paymentRoutes.get("/details/:bookingId", protect, getPaymentDetails);

export default paymentRoutes;