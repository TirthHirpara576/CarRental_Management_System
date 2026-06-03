import mongoose from "mongoose";

// This entire function will connect the server with the database
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
        })
        await mongoose.connect(process.env.MONGODB_URI); // DB connection string and database name
    } catch (error) {
        console.log(error.message);
    }
};

export default connectDB;
