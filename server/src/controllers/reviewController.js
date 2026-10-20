import { Review } from '../models/Review.js';

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find();
    res.status(200).json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ review });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/popular?minReviews=2
export async function getPopularMeals(req, res, next) {
  try {
    let minReviews = 2;
    if (req.query.minReviews !== undefined) {
      const raw = req.query.minReviews;
      if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
        return res
          .status(400)
          .json({ message: 'minReviews must be a positive integer' });
      }
      minReviews = parseInt(raw, 10);
    }

    const popular = await Review.aggregate([
      {
        $group: {
          _id: '$mealCode',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      { $match: { reviewCount: { $gte: minReviews } } },
      { $sort: { reviewCount: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          mealCode: '$_id',
          reviewCount: 1,
          averageRating: 1,
        },
      },
    ]);

    res.status(200).json({ popular });
  } catch (err) { next(err); }
}