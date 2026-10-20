import { Router } from 'express';
import {
  getAllReviews,
  getReview,
  createReview,
  getPopularMeals
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', getAllReviews);
router.post('/', createReview);
router.get('/popular', getPopularMeals); // must come BEFORE '/:id'
router.get('/:id', getReview);

export default router;
