import Joi from 'joi';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

const createSchema = Joi.object({
  mealCode: Joi.string().trim().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow(''),
  reviewedBy: Joi.string().hex().length(24)
}).required();

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
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ review });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This reviewer has already reviewed this meal' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

// GET /api/reviews/popular?minReviews=2
export async function getPopularMeals(req, res, next) {
  try {
    const rawMinReviews = req.query.minReviews;
    let minReviews = 2;

    if (rawMinReviews !== undefined) {
      if (
        typeof rawMinReviews !== 'string' ||
        !/^[0-9]+$/.test(rawMinReviews) ||
        !Number.isSafeInteger(Number(rawMinReviews)) ||
        Number(rawMinReviews) < 1
      ) {
        return res.status(400).json({ message: 'minReviews must be a positive integer' });
      }
      minReviews = Number(rawMinReviews);
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
      // The group id is the meal code, so it breaks ties alphabetically.
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
