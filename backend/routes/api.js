const express = require("express");
const router = express.Router();

// Home page route.
router.get("/", function (req, res) {
    res.send("home page");
});

router.post("/login", function (req, res) {
    res.send("login POST");
});

router.post("/signup", function (req, res) {
    res.send("signup POST");
});

router.get("/groups", function (req, res) {
    res.send("groups GET");
});

router.get("/groups/:groupid", function (req, res) {
    res.send("groups uniqueId GET");
});

router.put("/groups/:groupid", function (req, res) {
    res.send("groups uniqueId PUT");
});

router.get("/dms", function (req, res) {
    res.send("dms GET");
  });

router.get("/dms/:dmid", function (req, res) {
    res.send("dms uniqueId GET");
});

router.put("/dms/:dmid", function (req, res) {
    res.send("dms uniqueId PUT");
});

router.get("/users", function (req, res) {
    res.send("users list GET");
  });

router.get("/users/:userid", function (req, res) {
    res.send("user profile GET");
});

router.put("/users/:userid", function (req, res) {
    res.send("user profile PUT");
});

router.delete("/users/:userid", function (req, res) {
    res.send("user profile DELETE");
});


module.exports = router;