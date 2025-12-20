import mongoose, { Schema } from "mongoose";
import Order from "./orderSchema.js";
import Reservation from "./reservationSchema.js";

const userDetailsSchema = new mongoose.Schema(

    {
        fullName: {
            type: String,
            required: true
        },
        UserName:{
            type: String,
            required: true,
            unique: true
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
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
            default: []
        },
        orders: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
            default: []
        }

    }

)

const User = mongoose.model('userReg', userDetailsSchema);

export default User;
export { Reservation, Order };
