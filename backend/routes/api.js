const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')
require("dotenv").config();

const userController = require("../controllers/userController");
const conversationController = require("../controllers/conversationController");

function authenticateToken(req, res, next) {
    /*const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })*/
   const token = req.cookies.token;
   try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        next();
   } catch (err) {
        res.clearCookie("token");
        return
   }
}

router.post("/login", userController.login_post);

router.post("/signup", userController.signup_post);

router.get("/users", userController.users_list);

router.get("/users/:userId", userController.user_profile);

router.put("/users/:userId", userController.user_update);

router.delete("/users/:userId", userController.user_delete);

router.get("/groups", authenticateToken, function (req, res) {
    res.send("groups GET");
});

router.get("/groups/:groupId", function (req, res) {
    res.send(`group ${req.params.groupId} GET`);
});

router.put("/groups/:groupId", function (req, res) {
    res.send(`group ${req.params.groupId} PUT`);
});

router.get("/dms", function (req, res) {
    res.send("dms GET");
  });

router.post("/dms/create", authenticateToken, conversationController.dms_create_post);

router.get("/dms/:dmId", function (req, res) {
    res.send(`dm ${req.params.dmId} GET`);
});

router.put("/dms/:dmId", function (req, res) {
    res.send(`dm ${req.params.dmId} GET`);
});

module.exports = router;