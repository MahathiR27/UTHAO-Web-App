import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (!uri) {
      // Start an in-memory MongoDB for local dev when no MONGO_URI provided
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      console.log("Using in-memory MongoDB for development");
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected Successfully!!!");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // exit with failure
  }
};

export const stopDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) await mongodInstance.stop();
  } catch (err) {
    console.warn('Error stopping in-memory MongoDB', err);
  }
};