
import { Router } from 'express';

import {
  getAllReviews,
  getReview,
  createReview,
  getPopularMeals
} from '../controllers/reviewController.js';

const router = Router();

// Create a review
router.post('/', createReview);

// Get all reviews
router.get('/', getAllReviews);

// Get popular meals
router.get('/popular', getPopularMeals);

// Get one review by ID
router.get('/:id', getReview);

export default router;
