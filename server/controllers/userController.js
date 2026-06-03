import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";

// Generate JWT Token
const generateToken = (userId) => {
    const payload = { id: userId };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }); // 1 day
}

// Register User Controller
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Get data from register form

        if (!name || !email || !password || password.length < 6) {
            return res.json({ success: false, message: "Fill all the fields" });
        }

        const userExist = await User.findOne({ email }); // we are finding in "User" Model that is database collection
        if (userExist) {
            return res.json({ success: false, message: "User already exists" });
        }

        // for hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Now, we can add new user in "User" Model
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
        });

        // whenever a user will be created, we have to generate token for him & This token will be send as a response to Frontend. --> using this token, we can allow the user to access restricted pages.
        // To generate a token --> .env ma secret key create karvi pade...
        const token = generateToken(user._id.toString()); // passing the _id(unique id of user) in the function

        // Response to Frontend  
        res.json({ success: true, message: "User registered successfully", token });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}

// Login User Controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // Get data from login form

        if (!email || !password) {
            return res.json({ success: false, message: "Fill all the fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = generateToken(user._id.toString());
        res.json({ success: true, message: "Login successful", token });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get user data using Token (JWT) - for user profile page...
export const getUserData = async (req, res) => {
    try {
        const { user } = req; // This user_data will come from auth.js middleware --> middleware is a function which will run before the controller. --> middleware will extract the user data from the token and send it to the controller.
        res.json({ success: true, user }); // sending the user data to the frontend
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all cars for the frontend
export const getCars = async (req, res) => {
    try{
        const cars = await Car.find({ isAvailable: true }); // find all cars which are available for booking
        res.json({ success: true, cars });
    }
    catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get a single car by ID
export const getCarById = async (req, res) => {
    try{
        const { id } = req.params;
        const car = await Car.findById(id);
        if(!car) {
            return res.json({ success: false, message: "Car not found" });
        }
        res.json({ success: true, car });
    }
    catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}