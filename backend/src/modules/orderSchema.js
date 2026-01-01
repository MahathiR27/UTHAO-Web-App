import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userReg',
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurantReg',
        required: true
    },
    menuItemId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userRating: {
        type: Number,
        default: null,
        required: false,
        max: 5,
        min: 1
    },
    userReview: {
        type: String,
        default: null,
        required: false
    },
    ratedAt: {
        type: Date,
        default: null,
        required: false
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;