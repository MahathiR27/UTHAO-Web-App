import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 39
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userReg',
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
