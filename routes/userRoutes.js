const express = require('express')
const {protect} = require('../middleware/Auth')
const { registerUser, loginUser, myProfile, editProfile } = require('../controller/userController')

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(protect, myProfile)
router.route('/editprofile').put(protect, editProfile)


module.exports = router;