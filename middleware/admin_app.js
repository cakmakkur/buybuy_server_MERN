const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './db/product_images');
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload