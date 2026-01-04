import Notification from "../modules/notificationSchema.js";

// Get notifications for current user or driver
export const getNotifications = async (req, res) => {
    try {
        const recipientId = req.user.id;
        const recipientType = req.user.userType; // 'user' or 'driver'

        const notifications = await Notification.find({
            recipientId: recipientId,
            recipientType: recipientType
        })
        .populate('rideId', 'from to price')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

        return res.status(200).json({
            notifications: notifications || []
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const recipientId = req.user.id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Verify the notification belongs to the requesting user
        if (notification.recipientId.toString() !== recipientId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const recipientId = req.user.id;
        const recipientType = req.user.userType;

        await Notification.updateMany(
            {
                recipientId: recipientId,
                recipientType: recipientType,
                isRead: false
            },
            { isRead: true }
        );

        return res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const recipientId = req.user.id;
        const recipientType = req.user.userType;

        const count = await Notification.countDocuments({
            recipientId: recipientId,
            recipientType: recipientType,
            isRead: false
        });

        return res.status(200).json({ unreadCount: count });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
