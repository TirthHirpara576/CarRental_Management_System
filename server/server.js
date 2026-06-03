// To run :- $cd server , $npm run server

// Create basic server using express
import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Initialize express app
const app = express();

// Connect to the database
await connectDB();

// Middleware
app.use(cors()); // for connecting frontend and backend
app.use(express.json()); // for sending data from frontend to backend



// Routes
app.get("/", (req, res) => res.send("Server is running..."));
app.use("/api/user", userRouter); // user routes(for register and login)
app.use("/api/owner", ownerRouter); // owner routes(for adding cars for rent)
app.use("/api/bookings", bookingRouter); // booking routes(for checking availability and creating bookings)
app.use("/api/payment", paymentRoutes); // payment routes(for creating razorpay order and verifying payment)


const PORT = process.env.PORT || 3000;
// Start express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});