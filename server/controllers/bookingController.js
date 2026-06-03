import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    });

    return bookings.length === 0; // it means car is available if there are no bookings for the given date range
};

// API to Check Availability of Cars for the given Date and Location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body; // get this data from frontend form

        // fetch all available cars for the given location
        const cars = await Car.find({ location, isAvailable: true });

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(
                car._id,
                pickupDate,
                returnDate
            );

            return { ...car._doc, isAvailable: isAvailable };
        });

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter((car) => car.isAvailable === true);

        res.json({ success: true, availableCars });
    } 
    catch (error) {
        console.log(error.message);
        res.json({success: false,message: error.message,});
    }
};

// API to Create a Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user; // get user id from auth middleware
        const { carId, pickupDate, returnDate } = req.body; // get this data from frontend form
        const isAvailable = await checkAvailability(carId, pickupDate, returnDate);

        if (!isAvailable) {
            return res.status(400).json({ success: false, message: "Car is not available for the selected dates." });
        }

        const carData = await Car.findById(carId);
        if (!carData) {
            return res.status(404).json({ success: false, message: "Car not found." });
        }

        // calulate price based on pickup and return date and price per day of the car
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned-picked) / (1000 * 60 * 60 * 24)) + 1;
        const price = noOfDays * carData.pricePerDay;

        const booking = await Booking.create({
            car: carId,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price
        });

        res.status(201).json({ success: true, message: "Booking created successfully.", booking });
    } 
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to List Bookings of a User
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user; // get user id from auth middleware

        // Find all bookings of the user. Populate(add) car details in the response.
        const bookings = await Booking.find({ user: _id })
            .populate("car").sort({ createdAt: -1 }); // new booking will show first
        
        res.json({ success: true, bookings });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if(req.user.role !== "owner"){
            return res.json({ success: false, message: "Only owners can access this resource." });
        }

        const { _id } = req.user; // get user id from auth middleware
        // Find all bookings of the owner. Populate(add) car and user details in the response.
        const bookings = await Booking.find({ owner: _id })
            .populate("car user").select("-password").sort({ createdAt: -1 }); // new booking will show first

        res.json({ success: true, bookings });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Update Booking Status (Confirm or Cancel)
export const updateBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, newStatus } = req.body;

        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        // Check if the user is the owner of the booking
        if (booking.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "You are not the owner of this booking." });
        }

        // IMPORTANT: Prevent owner from manually setting status to "paid"
        if (newStatus === "paid") {
            return res.status(400).json({ 
                success: false, 
                message: "Payment status can only be set through Razorpay verification." 
            });
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['approve', 'reject', 'cancelled'],
            'approved': ['cancelled'],
            'paid': ['completed'],
            'completed': [],
            'rejected': [],
            'cancelled': []
        };

        const currentStatus = booking.status;
        const allowedTransitions = validTransitions[currentStatus] || [];

        // Check if action is allowed for current status
        if (!allowedTransitions.includes(newStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot transition from ${currentStatus} to ${newStatus}.` 
            });
        }

        // Map actions to actual status values
        const statusMapping = {
            'approve': 'approved',
            'reject': 'rejected',
            'cancelled': 'cancelled',
            'completed': 'completed'
        };

        // Update status with mapped value
        booking.status = statusMapping[newStatus] || newStatus;
        await booking.save();

        res.status(200).json({ success: true, message: "Booking status updated successfully." });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }   
};