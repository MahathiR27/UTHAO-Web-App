import Notification from "../modules/notificationSchema.js";

/**
 * Create a notification for ride request (sent to driver)
 * @param {String} driverId - Driver's MongoDB ObjectId
 * @param {String} rideId - Ride's MongoDB ObjectId
 * @param {String} userFullName - User's full name who requested the ride
 */
export const createRideRequestNotification = async (driverId, rideId, userFullName) => {
    try {
        const notification = new Notification({
            recipientId: driverId,
            recipientType: 'driver',
            rideId: rideId,
            type: 'ride_request',
            message: `New ride request from ${userFullName}`
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating ride request notification:', error);
    }
};

/**
 * Create a notification for ride acceptance (sent to user)
 * @param {String} userId - User's MongoDB ObjectId
 * @param {String} rideId - Ride's MongoDB ObjectId
 * @param {String} driverFullName - Driver's full name who accepted the ride
 */
export const createRideAcceptedNotification = async (userId, rideId, driverFullName) => {
    try {
        const notification = new Notification({
            recipientId: userId,
            recipientType: 'user',
            rideId: rideId,
            type: 'ride_accepted',
            message: `Your ride has been accepted by ${driverFullName}`
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating ride accepted notification:', error);
    }
};

/**
 * Create a notification for ride completion (sent to driver)
 * @param {String} driverId - Driver's MongoDB ObjectId
 * @param {String} rideId - Ride's MongoDB ObjectId
 */
export const createRideCompletedNotification = async (driverId, rideId) => {
    try {
        const notification = new Notification({
            recipientId: driverId,
            recipientType: 'driver',
            rideId: rideId,
            type: 'ride_completed',
            message: 'Thank you for making UTHAO better.'
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating ride completed notification:', error);
    }
};
