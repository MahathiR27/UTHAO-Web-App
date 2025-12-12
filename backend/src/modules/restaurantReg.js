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
        }

    }

)

const Restaurant = mongoose.model('restaurantReg', restaurantDetailsSchema)

export default Restaurant
