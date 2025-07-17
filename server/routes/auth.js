const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  verifyToken,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify', verifyToken);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
