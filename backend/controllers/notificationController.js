const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification");

exports.notification_list_get = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ to: req.user.id }).populate('from', 'display_name profile_picture').sort({ createdAt: -1 }).exec();

    res.json({ notifications: notifications })
})

