import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    recipientType: {
        type: String,
        enum: ['user', 'driver'],
        required: true
    },
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RideRequest',
        required: true
    },
    type: {
        type: String,
        enum: ['ride_request', 'ride_accepted', 'ride_completed'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
