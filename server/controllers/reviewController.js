const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const Session = require('../models/Session');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get reviews for a target (recipe, session, or instructor)
// @route   GET /api/reviews/:targetType/:targetId
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

  // Check for valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ error: 'Invalid targetId' });
  }

  const query = { targetType, targetId };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: -1 },
    populate: [
      { path: 'user', select: 'username profile.firstName profile.lastName profile.avatar' }
    ]
  };

  const reviews = await Review.paginate(query, options);
  res.json(reviews);
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const {
    targetType,
    targetId,
    rating,
    title,
    comment,
    photos,
    tips,
    difficulty,
    wouldMakeAgain,
    modifications
  } = req.body;

  // Check if target exists
  let target;
  switch (targetType) {
    case 'recipe':
      target = await Recipe.findById(targetId);
      break;
    case 'session':
      target = await Session.findById(targetId);
      break;
    case 'instructor':
      target = await User.findById(targetId);
      break;
    default:
      res.status(400);
      throw new Error('Invalid target type');
  }

  if (!target) {
    res.status(404);
    throw new Error('Target not found');
  }

  // Check if user already reviewed this target
  // const existingReview = await Review.findOne({
  //   user: req.user._id,
  //   targetType,
  //   targetId
  // });

  // if (existingReview) {
  //   res.status(400);
  //   throw new Error('You have already reviewed this item');
  // }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    targetType,
    targetId,
    rating,
    title,
    comment,
    photos,
    tips,
    difficulty,
    wouldMakeAgain,
    modifications
  });

  // Update target ratings
  await updateTargetRatings(targetType, targetId);

  // Update user stats if reviewing an instructor
  if (targetType === 'instructor') {
    await User.findByIdAndUpdate(targetId, {
      $inc: { 
        'stats.totalRating': rating,
        'stats.reviewCount': 1
      }
    });
  }

  // Populate user info
  await review.populate('user', 'username profile.firstName profile.lastName profile.avatar');

  res.status(201).json(review);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  const updatedReview = await review.editReview(req.body);

  // Update target ratings
  await updateTargetRatings(review.targetType, review.targetId);

  // Update user stats if reviewing an instructor
  if (review.targetType === 'instructor') {
    const ratingDiff = req.body.rating - review.rating;
    await User.findByIdAndUpdate(review.targetId, {
      $inc: { 
        'stats.totalRating': ratingDiff
      }
    });
  }

  await updatedReview.populate('user', 'username profile.firstName profile.lastName profile.avatar');

  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const { targetType, targetId, rating } = review;

  await Review.deleteOne({ _id: review._id });

  // Update target ratings
  await updateTargetRatings(targetType, targetId);

  // Update user stats if reviewing an instructor
  if (targetType === 'instructor') {
    await User.findByIdAndUpdate(targetId, {
      $inc: { 
        'stats.totalRating': -rating,
        'stats.reviewCount': -1
      }
    });
  }

  res.json({ message: 'Review removed' });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.markHelpful(req.user._id);
  res.json({ message: 'Review marked as helpful' });
});

// @desc    Unmark review as helpful
// @route   DELETE /api/reviews/:id/helpful
// @access  Private
const unmarkHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.unmarkHelpful(req.user._id);
  res.json({ message: 'Review unmarked as helpful' });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'user', select: 'username profile.firstName profile.lastName profile.avatar' }
    ]
  };

  const reviews = await Review.paginate(
    { user: req.params.userId },
    options
  );

  res.json(reviews);
});

// @desc    Get review statistics
// @route   GET /api/reviews/stats/:targetType/:targetId
// @access  Public
const getReviewStats = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;

  const [averageRating, ratingDistribution] = await Promise.all([
    Review.getAverageRating(targetType, targetId),
    Review.getRatingDistribution(targetType, targetId)
  ]);

  const stats = {
    average: averageRating.length > 0 ? Math.round(averageRating[0].average * 10) / 10 : 0,
    count: averageRating.length > 0 ? averageRating[0].count : 0,
    distribution: ratingDistribution
  };

  res.json(stats);
});

// Helper function to update target ratings
const updateTargetRatings = async (targetType, targetId) => {
  const [averageRating] = await Review.getAverageRating(targetType, targetId);
  
  if (averageRating) {
    const updateData = {
      'ratings.average': Math.round(averageRating.average * 10) / 10,
      'ratings.count': averageRating.count,
      'ratings.total': averageRating.average * averageRating.count
    };

    switch (targetType) {
      case 'recipe':
        await Recipe.findByIdAndUpdate(targetId, updateData);
        break;
      case 'session':
        await Session.findByIdAndUpdate(targetId, updateData);
        break;
    }
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  unmarkHelpful,
  getUserReviews,
  getReviewStats
}; 