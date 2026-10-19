import mongoose from "mongoose";

const connectDB = async () => {

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGODB connected");
  } catch (error) {
    console.error("MongoDB connection failed: ", error.message);
    throw error;
  }
};
export default connectDB;
