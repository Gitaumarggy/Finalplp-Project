const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getSessions);
router.get('/:id', getSession);
router.get('/instructor/:id', getInstructorSessions);

// Protected routes
router.use(protect);

router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.post('/:id/register', registerForSession);
router.delete('/:id/register', cancelRegistration);
router.get('/my/registrations', getMyRegistrations);
router.get('/my/sessions', getMySessions);
router.post('/:id/rate', rateSession);

module.exports = router; 