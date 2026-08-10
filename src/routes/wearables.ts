import { Router } from 'express';
import { wearableController } from '../controllers/wearableController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { pairWearableValidator, updateWearableValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/wearables/pair
 * @desc Pair a new wearable device
 * @access Private
 */
router.post(
  '/pair',
  authMiddleware,
  validateRequestBody(pairWearableValidator),
  (req, res, next) => wearableController.pairWearable(req, res, next)
);

/**
 * @route GET /api/wearables
 * @desc Get all user wearables
 * @access Private
 */
router.get('/', authMiddleware, (req, res, next) =>
  wearableController.getUserWearables(req, res, next)
);

/**
 * @route GET /api/wearables/:wearableId
 * @desc Get wearable by ID
 * @access Private
 */
router.get('/:wearableId', authMiddleware, (req, res, next) =>
  wearableController.getWearableById(req, res, next)
);

/**
 * @route PUT /api/wearables/:wearableId
 * @desc Update wearable
 * @access Private
 */
router.put(
  '/:wearableId',
  authMiddleware,
  validateRequestBody(updateWearableValidator),
  (req, res, next) => wearableController.updateWearable(req, res, next)
);

/**
 * @route DELETE /api/wearables/:wearableId
 * @desc Delete wearable
 * @access Private
 */
router.delete('/:wearableId', authMiddleware, (req, res, next) =>
  wearableController.deleteWearable(req, res, next)
);

export default router;
