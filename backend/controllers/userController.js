const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');


exports.login_post = asyncHandler(async (req, res, next) => {
  res.send("login POST");
});

exports.signup_post = [
    body("display_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a display name")
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
                console.log(user);
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
        .withMessage("Confirm your password is correct")
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

            res.status(201).json({ "status": 201, message: 'Successfully signed up' })
        }
    })
];

exports.users_list = asyncHandler(async (req, res, next) => {
    res.send("users list");
  });

exports.user_profile = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} GET`);  
});

exports.user_update = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} PUT`);  
});

exports.user_delete = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} DELETE`);  
});