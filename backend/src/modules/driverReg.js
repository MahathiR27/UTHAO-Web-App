import mongoose from "mongoose";

const driverDetailSchema = new mongoose.Schema(
  {
    fullName:{
      type: String,
      required: true
    },
    UserName:{
      type: String,
      required: true,
      unique:true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    carModel: {
      type: String,
      required: true
    },
    carColor: {
      type: String,
      required: true
    },
    licensePlate: {
      type: String,
      required: true,
      unique:true
    },
    rating:{
      type: Number,
      default: 0,
      required: false,
      max: 5,
      min: 0
    }
  }
)

const Driver = mongoose.model('driverReg', driverDetailSchema);

export default Driver;