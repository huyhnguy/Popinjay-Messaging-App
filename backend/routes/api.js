const express = require("express");
const router = express.Router();
require("dotenv").config();
const { authenticateToken } = require('../middleware/authenticateToken');
const upload = require('../middleware/upload');

const userController = require("../controllers/userController");
const conversationController = require("../controllers/conversationController");
const messageController = require('../controllers/messageController');

router.post("/login", userController.login_post);

router.post("/signup", userController.signup_post);

router.get("/users", authenticateToken, userController.users_list);

router.get("/users/settings", authenticateToken, userController.user_profile_get);

router.put("/users/settings", authenticateToken, upload.single('profile_picture'), userController.user_profile_put);

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

router.post("/messages/create", authenticateToken, messageController.message_create_post);


module.exports = router;