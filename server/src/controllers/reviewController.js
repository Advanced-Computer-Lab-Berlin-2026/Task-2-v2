import Joi from 'joi';
import { Review } from '../models/Review.js';

const createSchema = Joi.object({
  mealCode: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  reviewedBy: Joi.string().hex().length(24).optional()
});

export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    next(err);
  }
}

export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function getPopularMeals(req, res, next) {
  try {
    const raw = req.query.minReviews;
    let minReviews = 2;

    if (raw !== undefined) {
      if (
        typeof raw !== 'string' ||
        !/^\d+$/.test(raw) ||
        !Number.isSafeInteger(Number(raw)) ||
        Number(raw) < 1
      ) {
        return res.status(400).json({
          message: 'minReviews must be a positive integer'
        });
      }

      minReviews = Number(raw);
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

    res.status(200).json({ popular });
  } catch (err) {
    next(err);
  }
}