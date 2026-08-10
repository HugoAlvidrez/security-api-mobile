import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { sendMessageValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/chat/send
 * @desc Send chat message
 * @access Private
 */
router.post(
  '/send',
  authMiddleware,
  validateRequestBody(sendMessageValidator),
  (req, res, next) => chatController.sendMessage(req, res, next)
);

/**
 * @route GET /api/chat/:eventId
 * @desc Get event chat history
 * @access Private
 */
router.get('/:eventId', authMiddleware, (req, res, next) =>
  chatController.getEventChat(req, res, next)
);

/**
 * @route PATCH /api/chat/:eventId/read
 * @desc Mark messages as read
 * @access Private
 */
router.patch('/:eventId/read', authMiddleware, (req, res, next) =>
  chatController.markMessagesAsRead(req, res, next)
);

export default router;
