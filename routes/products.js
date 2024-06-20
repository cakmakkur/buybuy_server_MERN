const express = require('express')
const router = express.Router()
const {sendFilteredProducts, sendIndividualProd, sendReviews, sendDescription, sendRating, sendSearchResults, sendNewest, sendDeals, sendImgPaths} = require('../controllers/products')


router.route('/search_results/:query').get(sendSearchResults)
router.route('/get_products/:category').get(sendFilteredProducts)

router.route('/getImgPaths/:type').get(sendImgPaths)

router.route('/get_newest').get(sendNewest)
router.route('/get_deals').get(sendDeals)
router.route('/:id').get(sendIndividualProd)
router.route('/get_rev/:id/:sect?').get(sendReviews)
router.route('/get_desc/:id').get(sendDescription)
router.route('/get_rat/:id').get(sendRating)




module.exports = router