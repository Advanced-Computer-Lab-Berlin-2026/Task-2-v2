import { Router } from 'express';
import {
  getAllReviews,
  getReview,
  createReview,
  getReviewSummary
} from '../controllers/reviewController.js';

const router = Router();

// NOTE: /summary must come BEFORE /:id to prevent Express from treating "summary" as an ID
router.get('/summary', getReviewSummary);

router.route('/')
  .get(getAllReviews)
  .post(createReview);

router.route('/:id')
  .get(getReview);

export default router;