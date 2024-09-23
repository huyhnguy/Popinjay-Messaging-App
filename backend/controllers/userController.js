const User = require("../models/user");
const Conversation = require("../models/conversation");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const cloudinary = require('cloudinary').v2;
const Notification = require('../models/notification');

exports.login_post = [
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter your username")
        .custom(async (value) => {
            const user = await User.findOne({ 
                'login.username' : value
            });

            if (!user) {
                throw new Error
            } 
        })
        .withMessage("Invalid username")
        .escape(),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter your password")
        .custom(async (value, {req}) => {
            const user = await User.findOne({ 
                'login.username' : req.body.username
            });
            const isPasswordValid = await bcrypt.compare(value, user.login.password);
            if (!isPasswordValid) {
                throw new Error
            }
        })
        .withMessage("Invalid password")
        .escape(),
        asyncHandler(async (req, res, next) => {

            const errors = validationResult(req);
    
            if (!errors.isEmpty()) {
                res.json({
                    username: req.body.username,
                    password: req.body.password,
                    errors: errors.array()
                })
            } else {
                const userInfo = await User.findOne({ 
                    'login.username' : req.body.username
                });

                const user = { 
                    display_name: userInfo.display_name,
                    id: userInfo._id
                };
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                
                let options = {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 900000,
                }
                
                try {
                    res.set('Access-Control-Allow-Origin', 'https://popinjay-frontend.vercel.app');
                    res.cookie("token", accessToken, options);
                    res.json({ status: 200, message: "Cookie has been set" })
                } catch (error) {
                    console.error("Error setting cookie:", error);
                    res.status(500).send("Error setting cookie");
                }
            }
        })
]

exports.logout = (req, res, next) => {
    res.clearCookie("token");
    res.end();
}

exports.signup_post = [
    body("display_name")
        .trim()
        .isLength({ min: 1})
        .withMessage("Enter a display name")
        .isLength({ max: 30 })
        .withMessage("Cannot be longer than 30 characters")
        .custom(async displayName => {
            const user = await User.findOne({ 
                display_name : displayName
            });
            if (user) {
                throw new Error
            } 
        })
        .withMessage("Display name already taken")
        .escape(),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a username")
        .custom(async username => {
            const user = await User.findOne({ 
                'login.username' : username
            });
            if (user) {
                throw new Error
            } 
        })
        .withMessage("Username already taken")
        .escape(),
    body("password")
        .trim()
        .isStrongPassword({ minLowercase: 0, minSymbols: 0, minUppercase: 0 })
        .withMessage("Password must be atleast 8 characters and include a number")
        .escape(),
    body("confirm_password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter your password to confirm")
        .custom((value, {req}) => {
            return value === req.body.password
        })
        .withMessage("confirm password does not match password")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                display_name: req.body.display_name,
                username: req.body.username,
                password: req.body.password,
                confirm_password: req.body.confirm_password,
                errors: errors.array()
            })
        } else {
            const user = new User({
                display_name: req.body.display_name,
                login: {
                    username: req.body.username,
                },
            })
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    throw new Error("Can't generate salt to hash password")
                }
                bcrypt.hash(req.body.password, salt, async function(err, hash) {
                    if (err) {
                        throw new Error("Can't hash password")
                    }
                    user.login.password = hash;
                    await user.save();
                })
            })

            const result = await Conversation.updateOne({ _id: '66ef1677007b15bccb9a1cca' }, { 
                $push: { users: user._id }
            });
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

            const notification = new Notification({
                to: [user._id],
                from: '66ef1677007b15bccb9a1cca',
                from_type: 'Conversation',
                conversation_id: '66ef1677007b15bccb9a1cca',
                update: "You have been added to the group."
            })

            await notification.save();

            res.status(201).json({ "status": 201, message: 'Successfully signed up' })
        }
    })
];

exports.users_list = asyncHandler(async (req, res, next) => {
    const users = await User.find({ _id: {$ne: req.user.id}}).lean().select('display_name profile_picture').sort({ display_name: 1 });

    if (!users) {
        throw new Error("can't find users");
    }

    res.json(users);
  });

exports.user_profile_get = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).lean().exec();

    if (req.user.id === "66ef189e146ab1b35b827993") {
        res.json({
            display_name: user.display_name,
            profile_picture: user.profile_picture,
            about_me: user.about_me,
            guest: true
        })
    } else {
        res.json({
            display_name: user.display_name,
            profile_picture: user.profile_picture,
            about_me: user.about_me,
            guest: false
        })
    }
});

exports.user_profile_put = [
    body("display_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a display name")
        .isLength({ max: 30 })
        .withMessage("Display name cannot be longer than 30 characters")
        .custom(async (displayName, {req}) => {
            if (displayName === req.user.display_name) {
                return true
            }

            const user = await User.findOne({ 
                display_name : displayName
            });

            if (user) {
                throw new Error
            } 
        })
        .withMessage("Display name already taken")
        .escape(),
    body("about_me")
        .trim()
        .isLength({ max: 150 })
        .withMessage("'About Me' cannot be longer than 150 characters")
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
                const user = await User.findById(req.user.id).exec();
                user.display_name = req.body.display_name;
                user.about_me = req.body.about_me;

                if (req.file) {
                    const options = {
                        public_id: req.user.id,
                        overwrite: true,
                      };              
                    const image = await cloudinary.uploader.upload(req.file.path , options);
                    user.profile_picture = image.secure_url;
                } else {
                    if (req.body.picture_status === "delete") {
                        user.profile_picture = null;
                        await cloudinary.uploader.destroy(req.user.id, function(result) { console.log(result) })
                    }
                } 

                await user.save();
            
                res.json({ user: user, message: "new user settings changed" });
              } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error updating user profile' });
              }
        }
    })
]

exports.user_update = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} PUT`);  
});

exports.user_delete = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} DELETE`);  
});

exports.user_get = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId).lean().select('display_name profile_picture about_me createdAt').exec();
    res.json(user);

    /*if (req.user.id === "66d0f850353bc0d50dfd3f1c") {
        res.json({
            display_name: user.display_name,
            profile_picture: user.profile_picture,
            about_me: user.about_me,
            guest: true
        })
    } else {
        res.json({
            display_name: user.display_name,
            profile_picture: user.profile_picture,
            about_me: user.about_me,
            guest: false
        })
    }*/
})