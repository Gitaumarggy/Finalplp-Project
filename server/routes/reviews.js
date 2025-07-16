const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  unmarkHelpful,
  getUserReviews,
  getReviewStats
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/:targetType/:targetId', getReviews);
router.get('/user/:userId', getUserReviews);
router.get('/stats/:targetType/:targetId', getReviewStats);

// Protected routes
router.use(protect);

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);
router.delete('/:id/helpful', unmarkHelpful);

// Upload review photo
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL (assuming /uploads is served statically)
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router; 