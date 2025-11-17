import mongoose from "mongoose";

export const connectDB = async () =>{
  try{
    mongoose.connect(process.env.MONGO_URI); // .env file theke niye ashbe value

    console.log("MongoDB Connected Successfully!!!")
  }
  catch(error){
    console.error("Error connecting to MongoDB",error);
    process.exit(1) // exit with failure
  }
}