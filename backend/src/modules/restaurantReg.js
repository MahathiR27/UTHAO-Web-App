import mongoose, { Schema } from "mongoose";

const restaurantDetailsSchema = new mongoose.Schema(

    {
        RestaurantName:{
            type: String,
            required: true
        },
        OwnerName:{
            type: String,
            required: true
        },
        description: {
            type: String
        },
        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        RestaurantPhone: {
            type: String,
            required: true
        },
        OwnerPhone: {
            type: String
        },
        UserName: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        reservationLimit: {
            type: Number,
            required: false,
            default: 0
        },
        currentReservations: {
            type: Number,
            default: 0,
            required: false
        },
        menu: {
            type: [
                {
                    name: { type: String },
                    price: { type: Number },
                    description: { type: String },
                    image: { type: String }
                }
            ],
            default: []
        },
        reservations: {
            type: [
                {
                    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userReg' },
                    name: { type: String, required: true },
                    address: { type: String, required: true },
                    date: { type: Date, required: true },
                    numberOfPeople: { type: Number, required: true },
                    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        }

    }

)

const Restaurant = mongoose.model('restaurantReg', restaurantDetailsSchema)

export default Restaurant
