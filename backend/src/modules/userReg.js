import mongoose, { Schema } from "mongoose";

const userDetailsSchema = new mongoose.Schema(

    {
        UserName:{
            type: String,
            required: true
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
            type: String
        },
        refId: {
            type: String,
            unique: true,
            sparse: true
        },
        reservations: {
            type: [
                {
                    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurantReg' },
                    name: { type: String, required: true },
                    address: { type: String, required: true },
                    date: { type: Date, required: true },
                    numberOfPeople: { type: Number, required: true },
                    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        },
        orders: {
            type: [
                {
                    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
                    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurantReg' },
                    menuItemId: { type: String },
                    date: { type: Date, required: true },
                    price: { type: Number, required: true },
                    deliveryAddress: { type: String, required: true },
                    status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'], default: 'pending' },
                }
            ],
            default: []
        }

    }

)

const User = mongoose.model('userReg', userDetailsSchema)

export default User
