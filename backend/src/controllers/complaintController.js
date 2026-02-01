import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit a new complaint
 * Can be anonymous (isAnonymous=true) or named
 */
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, isAnonymous } = req.body;
    const userId = req.user?.id || 1; // Default to employee 1 if anonymous

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    // Mock AI confidence score (0-1)
    const confidenceScore = Math.random();

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        isAnonymous: isAnonymous || false,
        reportedById: userId,
        confidenceScore,
        status: 'RECEIVED',
        currentStep: 1
      },
      include: {
        reportedBy: !isAnonymous,
        files: true,
        comments: true
      }
    });

    // Add initial workflow step
    await prisma.workflowStep.create({
      data: {
        complaintId: complaint.id,
        step: 'RECEIVED',
        notes: 'Complaint received'
      }
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

/**
 * Get complaint by ID with all details
 */
export const getComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) },
      include: {
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        },
        workflow: {
          orderBy: { completedAt: 'asc' }
        },
        reportedBy: true
      }
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
};

/**
 * Get all complaints (HR only)
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        files: true,
        comments: true,
        reportedBy: true,
        workflow: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(complaints);
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

/**
 * Get all complaints for the logged-in employee
 */
export const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const complaints = await prisma.complaint.findMany({
      where: { reportedById: userId },
      include: {
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        },
        workflow: {
          orderBy: { completedAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(complaints);
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch your complaints' });
  }
};

/**
 * Update complaint status/workflow step (HR only)
 * Enforces linear progression: RECEIVED → REVIEW → INVESTIGATION → ACTION → CLOSED
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStep, notes } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) }
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Define workflow steps
    const steps = ['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'];
    const currentIndex = steps.indexOf(complaint.status);
    const nextIndex = steps.indexOf(nextStep);

    // Enforce linear progression (no skipping)
    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({
        error: 'Invalid workflow transition. Must follow: RECEIVED → REVIEW → INVESTIGATION → ACTION → CLOSED'
      });
    }

    // Update complaint
    const updated = await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: {
        status: nextStep,
        currentStep: nextIndex + 1
      },
      include: {
        files: true,
        comments: true,
        workflow: true
      }
    });

    // Add workflow step record
    await prisma.workflowStep.create({
      data: {
        complaintId: parseInt(id),
        step: nextStep,
        notes: notes || `Moved to ${nextStep}`
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
};

/**
 * Add internal HR comment to complaint
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        complaintId: parseInt(id)
      },
      include: { author: true }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

/**
 * Upload file evidence to complaint
 * Uses Multer for file handling
 */
export const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        complaintId: parseInt(id)
      }
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
