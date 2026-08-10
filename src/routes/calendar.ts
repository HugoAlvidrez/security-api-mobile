import { Router } from 'express';
import { calendarController } from '../controllers/calendarController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { createCalendarEventValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/calendar
 * @desc Create calendar event
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  validateRequestBody(createCalendarEventValidator),
  (req, res, next) => calendarController.createEvent(req, res, next)
);

/**
 * @route GET /api/calendar
 * @desc Get upcoming events
 * @access Private
 */
router.get('/', authMiddleware, (req, res, next) =>
  calendarController.getUpcomingEvents(req, res, next)
);

/**
 * @route GET /api/calendar/:eventId
 * @desc Get calendar event by ID
 * @access Private
 */
router.get('/:eventId', authMiddleware, (req, res, next) =>
  calendarController.getEventById(req, res, next)
);

/**
 * @route PUT /api/calendar/:eventId
 * @desc Update calendar event
 * @access Private
 */
router.put('/:eventId', authMiddleware, (req, res, next) =>
  calendarController.updateEvent(req, res, next)
);

/**
 * @route DELETE /api/calendar/:eventId
 * @desc Delete calendar event
 * @access Private
 */
router.delete('/:eventId', authMiddleware, (req, res, next) =>
  calendarController.deleteEvent(req, res, next)
);

export default router;
