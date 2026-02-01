import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit a new complaint
 * Can be anonymous (isAnonymous=true) or named
 */
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, isAnonymous } = req.body;
    let userId = req.user?.id;

    console.log('📝 Complaint submission received:');
    console.log('   Title:', title);
    console.log('   Description:', description ? description.substring(0, 50) + '...' : 'EMPTY');
    console.log('   Anonymous:', isAnonymous);
    console.log('   User ID:', userId);

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    // If no user (anonymous), create or use default system user
    if (!userId) {
      console.log('🔍 No user ID, looking for system user...');
      let systemUser = await prisma.user.findFirst({
        where: { email: 'system@trustshield.local' }
      });
      
      if (!systemUser) {
        console.log('❌ System user not found, creating...');
        systemUser = await prisma.user.create({
          data: {
            email: 'system@trustshield.local',
            password: 'system',
            name: 'System User',
            role: 'SYSTEM'
          }
        });
        console.log('✅ System user created with ID:', systemUser.id);
      } else {
        console.log('✅ System user found with ID:', systemUser.id);
      }
      userId = systemUser.id;
    } else {
      // Verify the user exists
      console.log('🔍 Verifying user exists with ID:', userId);
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!userExists) {
        console.log('❌ User ID', userId, 'not found in database');
        return res.status(400).json({ error: 'User account not found. Please ensure your account is properly set up.' });
      }
      console.log('✅ User found:', userExists.email);
    }

    // Mock AI confidence score (0-1)
    const confidenceScore = Math.random();

    console.log('💾 Creating complaint with reportedById:', userId);
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
        reportedBy: true,
        files: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });

    console.log('✅ Complaint created with ID:', complaint.id);

    // Add initial workflow step
    await prisma.workflowStep.create({
      data: {
        complaintId: complaint.id,
        step: 'RECEIVED',
        notes: 'Complaint received'
      }
    });

    console.log('✅ Workflow step created');

    res.status(201).json(complaint);
  } catch (error) {
    console.error('❌ Submit complaint error:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Meta:', error.meta);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to submit complaint', details: error.message });
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
          orderBy: [
            { stepOrder: 'asc' },
            { createdAt: 'asc' }
          ]
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
    console.error('❌ Get complaint error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch complaint', details: error.message });
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
    console.error('❌ Get all complaints error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch complaints', details: error.message });
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
    console.error('❌ Get my complaints error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch your complaints', details: error.message });
  }
};

/**
 * Update complaint status/workflow step (HR only)
 * Enforces linear progression: RECEIVED → REVIEW → INVESTIGATION → ACTION → CLOSED
 * NEW: Requires at least one comment for current step before moving to next step
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

    // NEW: Check if at least one comment exists for the current step
    const currentStep = complaint.status;
    const commentExists = await hasCommentForStep(parseInt(id), currentStep);
    
    if (!commentExists) {
      return res.status(400).json({
        error: `Please add a comment for the ${currentStep} step before proceeding to the next step`
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
 * Comments are now tagged with the workflow step they belong to
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, step } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    if (!step) {
      return res.status(400).json({ error: 'Workflow step required for comment' });
    }

    // Map step names to order numbers
    const stepOrderMap = {
      'RECEIVED': 1,
      'REVIEW': 2,
      'INVESTIGATION': 3,
      'ACTION': 4,
      'CLOSED': 5
    };

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        complaintId: parseInt(id),
        step: step,
        stepOrder: stepOrderMap[step] || 1
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
 * Helper function to check if a comment exists for a specific step
 */
const hasCommentForStep = async (complaintId, step) => {
  const count = await prisma.comment.count({
    where: {
      complaintId: complaintId,
      step: step
    }
  });
  return count > 0;
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
