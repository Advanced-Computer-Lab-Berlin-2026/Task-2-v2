
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find();

    return res.status(200).json({ reviews });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    return res.status(200).json({ review });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { mealCode, rating, comment, reviewedBy } = req.body;

    const review = await Review.create({
      mealCode,
      rating,
      comment,
      reviewedBy
    });

    return res.status(201).json({ review });
  } catch (err) {
    if (
      err.name === 'ValidationError' ||
      err.name === 'CastError'
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate review'
      });
    }

    next(err);
  }
}

// GET /api/reviews/popular?minReviews=2
export async function getPopularMeals(req, res, next) {
  try {
    const value = req.query.minReviews;
    let minReviews = 2;

    if (value !== undefined) {
      if (
        typeof value !== 'string' ||
        !/^[0-9]+$/.test(value) ||
        !Number.isSafeInteger(Number(value)) ||
        Number(value) < 1
      ) {
        return res.status(400).json({
          message: 'minReviews must be a positive integer'
        });
      }

      minReviews = Number(value);
    }

    const popular = await Review.aggregate([
      {
        $group: {
          _id: '$mealCode',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $match: {
          reviewCount: { $gte: minReviews }
        }
      },
      {
        $sort: {
          reviewCount: -1,
          _id: 1
        }
      },
      {
        $project: {
          _id: 0,
          mealCode: '$_id',
          reviewCount: 1,
          averageRating: 1
        }
      }
    ]);

    return res.status(200).json({ popular });
  } catch (err) {
    next(err);
  }
}
