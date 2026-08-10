import { Router } from 'express';
import { noteController } from '../controllers/noteController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { createNoteValidator, updateNoteValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/notes
 * @desc Create personal note
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  validateRequestBody(createNoteValidator),
  (req, res, next) => noteController.createNote(req, res, next)
);

/**
 * @route GET /api/notes
 * @desc Get all user notes
 * @access Private
 */
router.get('/', authMiddleware, (req, res, next) =>
  noteController.getUserNotes(req, res, next)
);

/**
 * @route GET /api/notes/:noteId
 * @desc Get note by ID
 * @access Private
 */
router.get('/:noteId', authMiddleware, (req, res, next) =>
  noteController.getNoteById(req, res, next)
);

/**
 * @route PUT /api/notes/:noteId
 * @desc Update note
 * @access Private
 */
router.put(
  '/:noteId',
  authMiddleware,
  validateRequestBody(updateNoteValidator),
  (req, res, next) => noteController.updateNote(req, res, next)
);

/**
 * @route DELETE /api/notes/:noteId
 * @desc Delete note
 * @access Private
 */
router.delete('/:noteId', authMiddleware, (req, res, next) =>
  noteController.deleteNote(req, res, next)
);

export default router;
