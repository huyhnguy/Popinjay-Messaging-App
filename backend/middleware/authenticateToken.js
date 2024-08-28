const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    try {
         const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
         req.user = user;
         next();
    } catch (err) {
         res.clearCookie("token");
         res.status(401).json({message: "JWT not provided. Please log in."})
         return console.log(err);
    }
 }

 module.exports = { authenticateToken }