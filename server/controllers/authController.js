const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body; // remove role from destructure

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
  
    const hashedPassword = await bcrypt.hash(password, 10);
    // Always set role to 'user'
    const user = await User.create({ firstName, lastName, email, username, password: hashedPassword, role: 'user' });
  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user: { ...user._doc, password: undefined }, token });
  };
  

// @desc    login  user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', req.body); // Log incoming request
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : null); // Log user lookup result
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Fix: Handle plain text passwords
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await user.matchPassword(password);
    } else {
      if (password === user.password) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        isMatch = true;
      }
    }
    console.log('Password match:', isMatch); // Log password comparison result
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // Send response
    res.json({ 
      user: { 
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = Date.now() + 1000 * 60 * 15; // 15 minutes
  await user.save();
  // For now, just log the token (in production, send via email)
  console.log(`Password reset token for ${email}: ${resetToken}`);
  res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({ message: 'Password has been reset. You can now log in.' });
};

// helper to send token response 
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  res
  .status(statusCode)
  .cookie('token', token, options)
  .json({ 
    success: true, 
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};




