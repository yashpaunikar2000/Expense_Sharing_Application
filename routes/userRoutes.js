const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

// POST /api/users/register - Register a new user
router.post('/register', registerUser);

// POST /api/users/login - Login user
router.post('/login', loginUser);

// GET /api/users/:userId - Get user profile
router.get('/:userId', getUserProfile);

// PUT /api/users/:userId - Update user profile
router.put('/:userId', updateUserProfile);

module.exports = router;
