import { Review } from '../models/Review.js';

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().populate('reviewedBy', 'name email');
    res.status(200).json({ reviews });
  } catch (err) { 
    next(err); 
  }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ review });
  } catch (err) { 
    next(err); 
  }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ review });
  } catch (err) { 
    next(err); 
  }
}

// GET /api/reviews/summary?mealCode=ML101
export async function getReviewSummary(req, res, next) {
  try {
    const { mealCode } = req.query;
    
    if (!mealCode) {
      return res.status(400).json({ message: 'mealCode query parameter is required' });
    }

    const summary = await Review.aggregate([
      { $match: { mealCode } },
      {
        $group: {
          _id: '$mealCode',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $project: {
          _id: 0,
          mealCode: '$_id',
          reviewCount: 1,
          averageRating: 1,
        },
      },
    ]);

    const result = summary[0] || { mealCode, reviewCount: 0, averageRating: 0 };
    res.status(200).json(result);
  } catch (err) { 
    next(err); 
  }
}