import express from 'express';
import multer from 'multer';
import {
  submitComplaint,
  getComplaint,
  getAllComplaints,
  updateComplaintStatus,
  addComment,
  uploadFile
} from '../controllers/complaintController.js';
import { verifyToken, requireAuth, requireHR } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

/**
 * POST /api/complaints
 * Submit a new complaint (anonymous or named)
 */
router.post('/', verifyToken, submitComplaint);

/**
 * GET /api/complaints/:id
 * Get complaint details by ID
 */
router.get('/:id', getComplaint);

/**
 * GET /api/complaints
 * Get all complaints (HR only)
 */
router.get('/', requireAuth, requireHR, getAllComplaints);

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status (move to next workflow step)
 * HR only, enforces linear progression
 */
router.patch('/:id/status', requireAuth, requireHR, updateComplaintStatus);

/**
 * POST /api/complaints/:id/comments
 * Add internal comment to complaint (HR only)
 */
router.post('/:id/comments', requireAuth, requireHR, addComment);

/**
 * POST /api/complaints/:id/upload
 * Upload evidence file to complaint
 */
router.post('/:id/upload', upload.single('file'), uploadFile);

export default router;
