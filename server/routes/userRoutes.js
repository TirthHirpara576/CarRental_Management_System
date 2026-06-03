import express from "express";
import { registerUser, loginUser, getUserData, getCars, getCarById } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUserData);
userRouter.get("/cars", getCars);
userRouter.get("/car/:id", getCarById);

export default userRouter; // export for server.js