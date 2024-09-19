const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification");

exports.notification_list_get = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ to: req.user.id }).sort({ createdAt: -1 }).limit(15).populate('from', 'display_name profile_picture').exec();

    res.json({ notifications: notifications })
});

exports.new_notification_counter_get = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ to: req.user.id, is_read: false }, '_id from_type conversation_id').exec();

    console.log(`new notifications: ${notifications}`);
    res.json({ new_notifications: notifications })
});

exports.notification_list_put = asyncHandler(async (req, res, next) => {
    try {
        const result = await Notification.updateMany( {to: req.user.id}, {$set: { is_read: true }} )
        const notifications = await Notification.find({ to: req.user.id }).populate('from', 'display_name profile_picture').sort({ createdAt: -1 }).exec();
        console.log( `updated ${result.modifiedCount} documents`)

        res.json({ notifications: notifications })
    } catch (err) {
        console.log(err);
    }
})

exports.notification_put = asyncHandler(async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.notificationId).exec();
        notification.is_read = true;
        await notification.save();

        res.json({ notification: notification })
    } catch (err) {
        console.log(err);
    }
})

