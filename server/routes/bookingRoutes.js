import express from 'express';
import { checkAvailabilityOfCar, createBooking, getOwnerBookings, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const bookingRouter = express.Router();

// API to Check Availability of Cars for the given Date and Location
bookingRouter.post('/check-availability', checkAvailabilityOfCar);
// API to Create a Booking
bookingRouter.post('/create', protect, createBooking);
// API to Get Bookings of Logged in User
bookingRouter.get('/user', protect, getUserBookings);
// API to Get Bookings of the Owner
bookingRouter.get('/owner', protect, getOwnerBookings);
// API to Change Booking Status
bookingRouter.post('/change-status', protect, updateBookingStatus);

export default bookingRouter;
