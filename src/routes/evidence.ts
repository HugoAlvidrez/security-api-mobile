import { Router } from 'express';
import multer from 'multer';
import { evidenceController } from '../controllers/evidenceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/mp3',
      'video/mp4',
      'video/webm',
      'application/octet-stream',
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|wav|mp3|bin)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * @route POST /api/evidence/upload
 * @desc Upload event media (audio/video)
 * @access Private
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  (req, res, next) => evidenceController.uploadEventMedia(req, res, next)
);

/**
 * @route GET /api/evidence/:eventId
 * @desc Get event media
 * @access Private
 */
router.get('/:eventId', authMiddleware, (req, res, next) =>
  evidenceController.getEventMedia(req, res, next)
);

/**
 * @route GET /api/evidence/:eventId/chain
 * @desc Get evidence chain of custody
 * @access Private
 */
router.get('/:eventId/chain', authMiddleware, (req, res, next) =>
  evidenceController.getEvidenceChain(req, res, next)
);

/**
 * @route POST /api/evidence/:chainId/verify
 * @desc Verify evidence integrity
 * @access Private
 */
router.post('/:chainId/verify', authMiddleware, (req, res, next) =>
  evidenceController.verifyIntegrity(req, res, next)
);

export default router;
