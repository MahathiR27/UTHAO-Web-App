import mongoose from "mongoose";

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
                    image: { type: String },
                    prepareTime: { type: Number, default: 10 }
                }
            ],
            default: []
        },
        offers: {
            type: [
                {
                    title: { type: String, required: true },
                    percentage: { type: Number, required: true, min: 0, max: 100 },
                    menuItemIndices: { type: [Number], default: [] },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        },
        reservations: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
            default: []
        },
        orders: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
            default: []
        },
        rating: {
            type: Number,
            default: 0,
            required: false,
            max: 5,
            min: 0
        },
        totalRatings: {
            type: Number,
            default: 0,
            required: false
        },
        numberOfRatings: {
            type: Number,
            default: 0,
            required: false
        }

    }

)

const Restaurant = mongoose.model('restaurantReg', restaurantDetailsSchema)

export default Restaurant
