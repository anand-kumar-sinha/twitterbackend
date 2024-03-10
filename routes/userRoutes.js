const express = require('express')
const {protect} = require('../middleware/Auth')
const { registerUser, loginUser, myProfile } = require('../controller/userController')

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(protect, myProfile)


module.exports = router;