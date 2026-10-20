import { Router } from 'express';
import {
  createReview,
  getAllReviews,
  getReview,
  getPopularMeals
} from '../controllers/reviewController.js';

const router = Router();

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/popular', getPopularMeals);
router.get('/:id', getReview);

export default router;