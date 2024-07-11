const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.registerUser); // User registration
router.post('/login', userController.loginUser); // User login
router.put('/profile', auth, userController.updateUserProfile); // update current user profile
router.get('/profile', auth, userController.getUserProfile); // Get current user profile
router.get('/:id', auth, userController.getUserById); // Get user by ID

module.exports = router;