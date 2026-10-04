import Notification from "../models/Notification.js";


// Get notifications for logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("relatedTask", "title status")
      .populate("relatedProject", "title status")
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Mark one notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      message: "All notifications marked as read",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};