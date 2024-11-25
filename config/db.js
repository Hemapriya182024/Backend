import mongoose from "mongoose";



const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGO_URL is not defined in the environment variables.");
    }
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

export { connectDB };
