const express = require('express')
const router = express.Router()
const { handleNewUser, handleLogin, handleRefreshToken, handleLogout, editProfile, placeOrder, submitRev, sendPrevOrders } = require('../controllers/user_api')
const {verifyRoles, verifyJWT} = require('../middleware/user_api')
const ROLES_LIST = require("../config/roles_list")
 

router.route('/register').post(handleNewUser)
router.route('/login').post(handleLogin)
router.route('/refresh').get(handleRefreshToken)
router.route('/logout').get(handleLogout)
router.route('/edit_profile/:username').post(verifyJWT, verifyRoles(ROLES_LIST.User), editProfile)
router.route('/order/:username').post(verifyJWT, verifyRoles(ROLES_LIST.User), placeOrder)
router.route('/submit_rev/:id').post(verifyJWT, verifyRoles(ROLES_LIST.User), submitRev)
router.route('/get_prev_orders/:username').get(verifyJWT, verifyRoles(ROLES_LIST.User), sendPrevOrders)




module.exports = router