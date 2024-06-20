const express = require('express')
const router = express.Router()
const upload = require('../middleware/admin_app')
const {addNewProduct, updateProduct, sendProducts, addNewImages, deleteImagePaths, deleteProduct} = require('../controllers/admin_app')

router.route('/add_prod').post([upload.array('images'), addNewProduct])
router.route('/manage_prods').get(sendProducts)
router.route('/manage_prods/:id').put(updateProduct)
router.route('/manage_prods/addImg/:id').post([upload.array('images'), addNewImages])
router.route('/manage_prods/deleteImgPaths/:id').delete(deleteImagePaths)
router.route('/manage_prods/deleteProduct/:id').delete(deleteProduct)


module.exports = router