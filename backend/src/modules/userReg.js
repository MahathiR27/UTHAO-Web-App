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
        }

    }

)

const User = mongoose.model('userReg', userDetailsSchema)

export default User
