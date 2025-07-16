const Session = require('../models/Session');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Public
const getSessions = asyncHandler(async (req, res) => {
  const {
    category,
    difficulty,
    type,
    instructor,
    status = 'published',
    page = 1,
    limit = 10,
    sort = 'startDate'
  } = req.query;

  const query = { status, isActive: true };

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (type) query.type = type;
  if (instructor) query.instructor = instructor;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: 1 },
    populate: [
      { path: 'instructor', select: 'username profile.firstName profile.lastName profile.avatar stats' },
      { path: 'participants.user', select: 'username profile.firstName profile.lastName' }
    ]
  };

  const sessions = await Session.paginate(query, options);
  res.json(sessions);
});

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Public
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('instructor', 'username profile stats badges')
    .populate('participants.user', 'username profile.firstName profile.lastName');

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Increment views if session is published
  if (session.status === 'published') {
    // You might want to track views differently
  }

  res.json(session);
});

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Instructors only)
const createSession = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    category,
    difficulty,
    duration,
    maxParticipants,
    price,
    schedule,
    materials,
    requirements,
    learningOutcomes,
    tags
  } = req.body;

  const session = await Session.create({
    title,
    description,
    instructor: req.user._id,
    type,
    category,
    difficulty,
    duration,
    maxParticipants,
    price,
    schedule,
    materials,
    requirements,
    learningOutcomes,
    tags
  });

  res.status(201).json(session);
});

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Session owner only)
const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user is the session instructor
  if (session.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this session');
  }

  const updatedSession = await Session.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('instructor', 'username profile.firstName profile.lastName');

  res.json(updatedSession);
});

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Session owner only)
const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user is the session instructor
  if (session.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this session');
  }

  // Check if session has participants
  if (session.participants.length > 0) {
    res.status(400);
    throw new Error('Cannot delete session with registered participants');
  }

  await session.remove();

  res.json({ message: 'Session removed' });
});

// @desc    Register for session
// @route   POST /api/sessions/:id/register
// @access  Private
const registerForSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status !== 'published') {
    res.status(400);
    throw new Error('Session is not available for registration');
  }

  try {
    await session.addParticipant(req.user._id);
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sessionsAttended': 1 }
    });

    res.json({ message: 'Successfully registered for session' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Cancel session registration
// @route   DELETE /api/sessions/:id/register
// @access  Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  try {
    await session.removeParticipant(req.user._id);
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sessionsAttended': -1 }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get instructor sessions
// @route   GET /api/sessions/instructor/:id
// @access  Public
const getInstructorSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    instructor: req.params.id,
    status: 'published',
    isActive: true
  })
  .populate('instructor', 'username profile.firstName profile.lastName')
  .sort({ 'schedule.startDate': 1 });

  res.json(sessions);
});

// @desc    Get user's registered sessions
// @route   GET /api/sessions/my-registrations
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    'participants.user': req.user._id,
    isActive: true
  })
  .populate('instructor', 'username profile.firstName profile.lastName')
  .sort({ 'schedule.startDate': 1 });

  res.json(sessions);
});

// @desc    Get user's hosted sessions
// @route   GET /api/sessions/my-sessions
// @access  Private
const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    instructor: req.user._id
  })
  .populate('participants.user', 'username profile.firstName profile.lastName')
  .sort({ createdAt: -1 });

  res.json(sessions);
});

// @desc    Rate session
// @route   POST /api/sessions/:id/rate
// @access  Private
const rateSession = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user participated in the session
  const participant = session.participants.find(
    p => p.user.toString() === req.user._id.toString()
  );

  if (!participant) {
    res.status(403);
    throw new Error('You can only rate sessions you attended');
  }

  // Update participant rating
  participant.rating = rating;
  participant.review = review;
  participant.reviewDate = new Date();

  await session.save();
  await session.updateAverageRating();

  res.json({ message: 'Rating submitted successfully' });
});

module.exports = {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  registerForSession,
  cancelRegistration,
  getInstructorSessions,
  getMyRegistrations,
  getMySessions,
  rateSession
}; 