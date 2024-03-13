const express = require('express')
const {protect} = require('../middleware/Auth')
const { registerUser, loginUser, myProfile, editProfile, fetchAllUser, fetchUserId, followUser, createPost, findAllPosts } = require('../controller/userController')

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(protect, myProfile)
router.route('/editprofile').put(protect, editProfile)
router.route('/allusers').get(protect, fetchAllUser)
router.route('/user/:id').get(protect, fetchUserId)
router.route('/follow/:id').put(protect, followUser)
router.route('/createpost').put(protect, createPost)
router.route('/allposts').get(protect, findAllPosts)

module.exports = router;