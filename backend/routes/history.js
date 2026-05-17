import express from 'express';
import * as historyController from '../controllers/historyController.js';
import authMiddleware from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.route('/')
  .get(historyController.getAllHistory)
  .post(
    [
      body('content').notEmpty().withMessage('Content cannot be empty')
    ],
    historyController.createHistory
  );

router.route('/:id')
  .put(
    [
      body('content').notEmpty().withMessage('Content cannot be empty')
    ],
    historyController.updateHistory
  )
  .delete(historyController.deleteHistory);

export default router;


