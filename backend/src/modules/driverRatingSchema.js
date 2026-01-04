import mongoose from "mongoose";

const driverRatingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userReg',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driverReg',
        required: true
    },
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RideRequest',
        required: true,
        unique: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DriverRating = mongoose.model('DriverRating', driverRatingSchema);

export default DriverRating;
