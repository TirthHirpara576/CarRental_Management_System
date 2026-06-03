import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import fs from "fs";
import path from "path";
import imagekit from "../configs/imageKit.js";

// API to change role from customer to owner (for Adding cars for rent)
export const changeRoleToOwner = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByIdAndUpdate(userId, { role: "owner" });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: user.name + " is now owner" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to list all cars (for customer to book)
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData); // car data will be added using Middleware
        const imageFile = req.file; // this file will be upload using middleware. [multer package]

        // upload this image in imagekit
        const fileBuffer = fs.readFileSync(imageFile.path); // Read the file buffer
        const uploadedImage = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/cars",
        });

        // Optimization through imagekit URL transformation
        const optimizedImageURL = imagekit.url({
            path: uploadedImage.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' }, // Auto compression
                { format: 'webp' }, // convert to modern format 
            ]
        });

        const image = optimizedImageURL;
        // Save this image_url in mongodb database
        await Car.create({ ...car, image, owner: _id });

        res.json({ success: true, message: "Car added successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to List of Owner's Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user; // (get userId from token) this _id is coming from auth.js file middleware
        const cars = await Car.find({ owner: _id }); // (get all cars of that userId)
        if (!cars) {
            return res.json({ success: false, message: "No cars found" });
        }
        res.json({ success: true, cars });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        // Checking -> wheather this car is belongs to this user or not?
        if (car.owner.toString() != _id.toString()) { // converting into string because one is object and other is string
            return res.json({ success: false, message: "You can't toggle availability of someone else's car" });
        }

        car.isAvailable = !car.isAvailable; // toggle the value of isAvailable
        await car.save(); // save the changes in database
        res.json({ success: true, message: car.isAvailable ? "Car is now available" : "Car is now not available" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to Delete a Car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        // Checking -> wheather this car is belongs to this user or not?
        if (car.owner.toString() != _id.toString()) { // converting into string because one is object and other is string
            return res.json({ success: false, message: "You can't delete someone else's car" });
        }
        // Deleting the car
        car.owner = null;
        car.isAvailable = false;
        await car.save();
        res.json({ success: true, message: "Car deleted successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to get Dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;
        if (role !== "owner") {
            return res.json({ success: false, message: "Unauthorized! Only owners can access dashboard!" });
        }

        // Fetching car data & Booking data from database
        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        // Count bookings by status
        const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
        const approvedBookings = await Booking.find({ owner: _id, status: "approved" });
        const completedBookings = await Booking.find({ owner: _id, status: "completed" });

        // Calculate monthly revenue ONLY from "paid" and "completed" bookings
        const paidBookings = await Booking.find({ owner: _id, status: "paid" });
        const monthlyRevenue = bookings
            .filter(booking => booking.status === "paid" || booking.status === "completed")
            .reduce((total, booking) => total + booking.price, 0);

        const deshboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            approvedBookings: approvedBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 5), // get recent 5 bookings
            monthlyRevenue
        };

        res.json({ success: true, dashboardData: deshboardData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to update owner profile image
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file; // this file will be upload using middleware. [multer package]
        // upload this image in imagekit
        const fileBuffer = fs.readFileSync(imageFile.path); // Read the file buffer
        const uploadedImage = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/users",
        });
        // Optimization through imagekit URL transformation
        const optimizedImageURL = imagekit.url({
            path: uploadedImage.filePath,
            transformation: [
                {width: '400'},
                {quality: 'auto'}, // Auto compression
                {format: 'webp'} // convert to modern format
            ]
        });
        // Update the owner's profile image URL in the database
        const image = optimizedImageURL;
        await User.findByIdAndUpdate(_id, { image: image });
        res.json({ success: true, message: "Profile image updated successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}