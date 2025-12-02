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
        }

    }

)

const User = mongoose.model('userReg', userDetailsSchema)

export default User
