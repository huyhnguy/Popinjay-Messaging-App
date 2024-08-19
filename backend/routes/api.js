const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/login", userController.login_post);

router.post("/signup", userController.signup_post);

router.get("/users", userController.users_list);

router.get("/users/:userId", userController.user_profile);

router.put("/users/:userId", userController.user_update);

router.delete("/users/:userId", userController.user_delete);

router.get("/groups", function (req, res) {
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

router.get("/dms/:dmId", function (req, res) {
    res.send(`dm ${req.params.dmId} GET`);
});

router.put("/dms/:dmId", function (req, res) {
    res.send(`dm ${req.params.dmId} GET`);
});

module.exports = router;