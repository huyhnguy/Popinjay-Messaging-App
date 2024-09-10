const express = require("express");
const router = express.Router();
require("dotenv").config();
const { authenticateToken } = require('../middleware/authenticateToken');
const upload = require('../middleware/multer-config');
const userController = require("../controllers/userController");
const conversationController = require("../controllers/conversationController");
const messageController = require('../controllers/messageController');

router.post("/login", userController.login_post);

router.post("/logout", userController.logout);

router.post("/signup", userController.signup_post);

router.get("/users", authenticateToken, userController.users_list);

router.get("/users/settings", authenticateToken, userController.user_profile_get);

router.put("/users/settings", authenticateToken, upload.single('profile_picture'), userController.user_profile_put);

router.get("/users/:userId", authenticateToken, userController.user_get);

router.put("/users/:userId", authenticateToken, userController.user_update);

router.delete("/users/:userId", userController.user_delete);

router.get("/groups", authenticateToken, conversationController.groups_list_get);

router.post("/groups/create", authenticateToken, upload.single('group_picture'), conversationController.groups_create_post);

router.get("/groups/:groupId", authenticateToken, conversationController.group_get);


router.put("/groups/:groupId", function (req, res) {
    res.send(`group ${req.params.groupId} PUT`);
});

router.get("/dms", authenticateToken, conversationController.dms_list_get);

router.post("/dms/create", authenticateToken, conversationController.dms_create_post);

router.get("/dms/:dmId", authenticateToken, conversationController.dm_get);

router.put("/dms/:dmId", function (req, res) {
    res.send(`dm ${req.params.dmId} GET`);
});

router.post("/messages/create", authenticateToken, upload.single('image'), messageController.message_create_post);

router.put("/messages/:messageId", authenticateToken, upload.single('image'), messageController.message_update);

router.delete("/messages/:messageId", authenticateToken, messageController.message_delete);


module.exports = router;