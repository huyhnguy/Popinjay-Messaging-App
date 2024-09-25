const multer = require('multer')
const storage = multer.memoryStorage();
//const upload = multer({ dest: '../uploads/' })
const upload = multer({ storage: storage });

module.exports = upload