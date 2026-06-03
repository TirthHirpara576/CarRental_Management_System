import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const paymentSchema = new mongoose.Schema({
    booking: {type: ObjectId,ref: "Booking",required: true},
    user: {type: ObjectId,ref: "User",required: true},
    owner: {type: ObjectId,ref: "User",required: true},
    car: {type: ObjectId,ref: "Car",required: true},
    
    razorpay_order_id: {type: String,required: true},
    razorpay_payment_id: {type: String,default: ""},
    razorpay_signature: {type: String,default: ""},
    amount: {type: Number,required: true},
    currency: {type: String,default: "INR"},
    paymentStatus: { type: String,enum: ["created","paid","failed","refunded"],default: "created"},
    paymentMethod: {type: String,default: "razorpay"},
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;