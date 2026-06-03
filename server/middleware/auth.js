import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    // 1. Check if token exists
    const authHeader = req.headers.authorization; // Authorization: Bearer <token>
    if (!authHeader) return res.json({ success: false, message: "Not authorized" });

    try {
        // 2. Extract token from "Bearer <token>" format
        const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
        if (!token) {
            return res.json({ success: false, message: "Not authorized" });
        }
        
        // 3. Extract userId from token & verify it
        const userId = jwt.verify(token, process.env.JWT_SECRET)?.id;
        if (!userId) {
            return res.json({ success: false, message: "Not authorized" });
        }
        req.user = await User.findById(userId).select("-password"); // -password means we are not sending password in the response

        // now, call next requested controller
        next();
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}