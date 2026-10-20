
import { Router } from 'express';

import {
  getAllReviews,
  getReview,
  createReview,
  getPopularMeals
} from '../controllers/reviewController.js';

const router = Router();

// POST /api/reviews
router.post('/', createReview);

// GET /api/reviews
router.get('/', getAllReviews);

// GET /api/reviews/popular
router.get('/popular', getPopularMeals);

// GET /api/reviews/:id
router.get('/:id', getReview);

export default router;
