import mongoose from "mongoose";

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
        promocodes: {
            type: [
                {
                    code: { type: String, required: true },
                    discount: { type: Number, required: true }, // Percentage discount
                    used: { type: Boolean, default: false },
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
        }

    }

)

const User = mongoose.model('userReg', userDetailsSchema);

export default User;