import Joi from 'joi';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

const createReviewSchema = Joi.object({
  mealCode: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string(),
  reviewedBy: Joi.string().hex().length(24)
});

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/popular?minReviews=2
export async function getPopularMeals(req, res, next) {
  try {
    const rawMinReviews = req.query.minReviews;
    const minReviews = rawMinReviews === undefined ? 2 : Number(rawMinReviews);
    if ((rawMinReviews !== undefined && typeof rawMinReviews !== 'string') ||
        !Number.isInteger(minReviews) || minReviews < 1) {
      return res.status(400).json({ message: 'minReviews must be a positive integer' });
    }

    const popular = await Review.aggregate([
      {
        $group: {
          _id: '$mealCode',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $match: { reviewCount: { $gte: minReviews } } },
      { $sort: { reviewCount: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          mealCode: '$_id',
          reviewCount: 1,
          averageRating: 1
        }
      }
    ]);
    res.json({ popular });
  } catch (err) { next(err); }
}
