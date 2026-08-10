import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { createEventValidator, updateEventValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/events
 * @desc Create emergency event
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  validateRequestBody(createEventValidator),
  (req, res, next) => eventController.createEvent(req, res, next)
);

/**
 * @route GET /api/events
 * @desc Get user events
 * @access Private
 */
router.get('/', authMiddleware, (req, res, next) =>
  eventController.getUserEvents(req, res, next)
);

/**
 * @route GET /api/events/:eventId
 * @desc Get event by ID
 * @access Private
 */
router.get('/:eventId', authMiddleware, (req, res, next) =>
  eventController.getEventById(req, res, next)
);

/**
 * @route PUT /api/events/:eventId
 * @desc Update event
 * @access Private
 */
router.put(
  '/:eventId',
  authMiddleware,
  validateRequestBody(updateEventValidator),
  (req, res, next) => eventController.updateEvent(req, res, next)
);

export default router;
