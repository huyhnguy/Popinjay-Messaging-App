const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const Message = require("../models/message")
const { body, validationResult } = require("express-validator");
const User = require("../models/user")
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const Notification = require("../models/notification");
const streamifier = require('streamifier');
const { uploadStream } = require('../middleware/uploadStream');

exports.dms_create_post = asyncHandler(async (req, res, next) => {
    // look for a possible pre-existing conversation between these two users in the database
    const dm = await Conversation.findOne({ 
        users: { 
            $size: 2,
            $all: [req.body.other_user_id, req.user.id]
        } 
    }).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).exec();
    
    // if this conversation doesn't already exist in the database, create a new one
    if (!dm) {
        const newDm = new Conversation({
            users: [req.body.other_user_id, req.user.id]
        })
        await newDm.save();

        res.json({ sender: req.user.id, dm: newDm, message: "new conversation created"});
    } else {
        res.json({ sender: req.user.id, dm: dm, message: "pre-existing conversation sent"});
    }
});

exports.dms_list_get = asyncHandler(async (req, res, next) => {
    try {
        const dms = await Conversation.find({
            users: {
                $elemMatch: { $eq: req.user.id },
                $size: 2
            },
            history: {
                $ne: []
            }
        }).lean().select({
            history: { $slice: -1 }
        }).populate({
            path: 'history',
            select: 'user content createdAt image'
        }).populate({
            path: 'users',
            match: { _id: { $ne: req.user.id }},
            select: 'display_name profile_picture'
        }).exec();
        
        res.json({ sender: req.user.id, dms: dms });
    } catch (err) {
        console.error('query error', err);
    }
})

exports.dm_get = asyncHandler(async (req, res, next) => {
    const dm = await Conversation.findById(req.params.dmId).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).populate({
        path: 'users',
        match: { _id: { $ne: req.user.id }},
        select: 'display_name profile_picture'
    }).lean().exec();

    res.json({ dm: dm, sender: req.user.id })
})

exports.group_get = asyncHandler(async (req, res, next) => {
    const group = await Conversation.findById( req.params.groupId ).lean().populate({
        path: 'history',
        select: 'content createdAt user image',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).populate({
        path: 'users',
        select: 'display_name'
    }).exec();

    res.json({ group: group, sender: req.user.id })
})

exports.group_settings_get = asyncHandler(async (req, res, next) => {
    try {
        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(req.params.groupId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { 
                            display_name: 1,
                            profile_picture: 1
                        } }
                    ],
                    as: "users",
                },
            },
            {
                $project: {
                    users: {
                        $sortArray: { input: "$users", sortBy: { display_name: 1}}
                    },
                    admins: {
                        $sortArray: { input: "$admins", sortBy: { display_name: 1}}
                    },
                    display_name: 1,
                    admin_permissions: 1,
                    owner: 1,
                    profile_picture: 1,
                }
            }
        ]
    
        const group = await Conversation.aggregate(pipeline).exec();
    
    
        res.json({ group: group[0], sender: req.user.id })
    } catch (err) {
        console.log(err)
    }

})

exports.group_settings_put = [
    body("display_name")
        .trim()
        .isLength({ max: 30 })
        .withMessage("Display name cannot be longer than 30 characters")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                display_name: req.body.display_name,
                profile_picture: req.file,
                about_me: req.body.about_me,
                errors: errors.array()
            })
        } else {
            try {
                
                const conversation = await Conversation.findById(req.params.groupId).exec();
                conversation.display_name = req.body.display_name;

                if (req.body.admin_permissions.includes('delete-messages')) {
                    conversation.admin_permissions.delete_messages = true
                } else {
                    conversation.admin_permissions.delete_messages = false
                }

                if (req.body.admin_permissions.includes('invite-users')) {
                    conversation.admin_permissions.invite_users = true
                } else {
                    conversation.admin_permissions.invite_users = false
                }

                if (req.body.admin_permissions.includes('kick-users')) {
                    conversation.admin_permissions.kick_users = true
                } else {
                    conversation.admin_permissions.kick_users = false
                }

                if (req.file) {
                    const uploadedImageUrl = await uploadStream(req.file.buffer, req.params.groupId);
                    console.log(uploadedImageUrl);
                    conversation.profile_picture = uploadedImageUrl;

                    /*const image = cloudinary.uploader.upload_stream(
                        { 
                            folder: 'uploads',
                            public_id: req.params.groupId,
                            overwrite: true 
                        },
                        async (error, result) => {
                          if (error) {
                            return res.status(500).send(error);
                          }
                          console.log(result.secure_url);
                          conversation.profile_picture = result.secure_url;
                          await conversation.save();
                        }
                      );

                    streamifier.createReadStream(req.file.buffer).pipe(image);*/
                } else {
                    if (req.body.picture_status === "delete") {
                        conversation.profile_picture = null;
                        await cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) })
                    }
                } 

                await conversation.save();
            
                res.json({ group: conversation, message: "new group settings changed" });
              } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error updating group settings' });
              }
        }
    })
]

exports.group_settings_delete = asyncHandler(async (req, res, next) => {
    try {
        const group = await Conversation.findById(req.params.groupId).exec();

        if (!group) {
            console.log('group not found');
            return;
        }

            //await cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) });
            const [deletedImageUrl, deletedMessages, deletedGroup, deletedNotifications] = await Promise.all([
                cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) }),
                Message.deleteMany({_id: { $in: group.history }}), 
                Conversation.deleteOne({ _id: req.params.groupId }),
                Notification.deleteMany({ from: req.params.groupId})
            ]);
       
    
        //const deletedMessages = await Message.deleteMany({_id: { $in: group.history }})
        //const deletedGroup = await Conversation.deleteOne({ _id: req.params.groupId });

       // const [deletedMessages, deletedGroup] = await Promise.all([Message.deleteMany({_id: { $in: group.history }}), Conversation.deleteOne({ _id: req.params.groupId }) ])

        console.log(`deleted ${deletedMessages.deletedCount} messages`);
        
        if (deletedGroup.deletedCount === 1) {
            console.log('conversation successfully deleted')
            res.json({ message: "group successfully deleted"})
        } else {
            console.log ('failed to delete conversation');
            res.json({ message: "failed to delete conversation"})
        }
    } catch (err) {
        console.log('error deleting group: ' + err);
        res.status(500).json({ error: err, message: "error deleting group"})
    }

})

exports.groups_list_get = asyncHandler(async (req, res, next) => {
    try {
        const groups = await Conversation.find({
            users: req.user.id,
            $expr: { $gte: [ {$size: "$users" }, 3]}
        }).lean().select({
            history: { $slice: -1 }
        }).populate({
            path: 'history',
            select: 'user content createdAt image',
            populate: {
                path: 'user',
                select: 'display_name'
            }
        }).populate({
            path: 'users',
            match: { 
                _id: { $ne: req.user.id },
            },
            select: 'display_name',
            options: { limit: 5 }
        }).exec();

        res.json({ sender: req.user.id, groups: groups });
    } catch (err) {
        console.error(err);
    }
})

exports.groups_create_post = [
    body("display_name")
        .trim()
        .isLength({ max: 35 })
        .withMessage("Name cannot be more than 35 characters")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                profile_picture: req.file,
                display_name: req.body.display_name,
                users: req.body.users,
                errors: errors.array()
            })
        } else {
            const userArray = [...req.body.users, req.user.id];
            const conversation = new Conversation({
                display_name: req.body.display_name,
                users: userArray,
                owner: req.user.id
            });

            if (req.file) {
                const uploadedImageUrl = await uploadStream(req.file.buffer, conversation._id);
                console.log(uploadedImageUrl);
                conversation.profile_picture = uploadedImageUrl;
                /*const image = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'uploads',
                        public_id: conversation._id,
                        overwrite: true 
                    },
                    async (error, result) => {
                      if (error) {
                        return res.status(500).send(error);
                      }
                      console.log(result.secure_url);
                      conversation.profile_picture = result.secure_url;
                      await conversation.save();
                    }
                  );

                streamifier.createReadStream(req.file.buffer).pipe(image);*/
            }
            
            await conversation.save();

            const notification = new Notification({
                to: req.body.users,
                from: conversation._id,
                from_type: 'Conversation',
                conversation_id: conversation._id,
                update: "You have been added to the group."
            })

            await notification.save();

            res.status(201).json({ "status": 201, message: 'Successfully created conversation', conversation: conversation, notification: notification });
        }
    })
]

exports.group_user_delete = asyncHandler(async (req, res, next) => {
    try {
        const result = await Conversation.updateOne({ _id: req.params.groupId }, { $pull: { users: req.params.userId, admins: req.params.userId } });
        console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

        const notification = new Notification({
            to: [req.params.userId],
            from: req.params.groupId,
            from_type: 'Conversation',
            update: "You have been kicked."
        })

        await notification.save();

        res.json({ message: "successfully deleted user from group" })
    } catch (err) {
        console.log(`error deleting user from group: ${err}`)

        res.status(500).json({ error: `error deleting user from group: ${err}` })
    }
})

exports.group_user_put = asyncHandler(async (req, res, next) => {
    try {
        if (req.body.action === "Make admin") {
            const result = await Conversation.updateOne({ _id: req.params.groupId }, { 
                $push: { admins: req.params.userId }
            });
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

            const notification = new Notification({
                to: [req.params.userId],
                from: req.params.groupId,
                from_type: 'Conversation',
                conversation_id: req.params.groupId,
                update: "You are now an admin."
            })

            await notification.save();
    
            res.json({ message: "successfully gave user admin" })
        } else if (req.body.action === "Remove admin") {
            const result = await Conversation.updateOne({ _id: req.params.groupId }, { 
                $pull: { admins: req.params.userId }
            });
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

            const notification = new Notification({
                to: [req.params.userId],
                from: req.params.groupId,
                from_type: 'Conversation',
                conversation_id: req.params.groupId,
                update: "You are no longer an admin."
            })

            await notification.save();
    
            res.json({ message: "successfully removed user from admin list" })
        } else if (req.body.action === "Add user") {
            const result = await Conversation.updateOne({ _id: req.params.groupId }, { 
                $push: { users: req.params.userId }
            });
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

            const notification = new Notification({
                to: [req.params.userId],
                from: req.params.groupId,
                from_type: 'Conversation',
                conversation_id: req.params.groupId,
                update: "You have been added to the group."
            })

            await notification.save();
    
            res.json({ message: "successfully added user to group" })
        } else if (req.body.action === "Make owner") {
            const result = await Conversation.updateOne({ _id: req.params.groupId }, { owner: req.params.userId });
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

            const notification = new Notification({
                to: [req.params.userId],
                from: req.params.groupId,
                from_type: 'Conversation',
                conversation_id: req.params.groupId,
                update: "You are the new owner."
            })

            await notification.save();
    
            res.json({ message: "successfully made user owner" })
        }

    } catch (err) {
        console.log(`error giving user admin: ${err}`)
        
        res.status(500).json({ error: `error giving user admin: ${err}` })
    }
})


