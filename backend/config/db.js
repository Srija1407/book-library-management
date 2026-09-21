const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed");
        console.error("Error:", error.message);
        console.error("Name:", error.name);

        if (error.reason) {
            console.error("Reason:", error.reason);
        }

        process.exit(1);
    }
};

module.exports = connectDB;