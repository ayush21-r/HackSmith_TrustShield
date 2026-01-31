import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.comment.deleteMany({});
    await prisma.workflowStep.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.user.deleteMany({});

    // Create demo users
    const employee = await prisma.user.create({
      data: {
        id: 1,
        email: 'employee@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'EMPLOYEE'
      }
    });

    const hr = await prisma.user.create({
      data: {
        id: 2,
        email: 'hr@example.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'HR'
      }
    });

    // Create demo complaints
    const complaint1 = await prisma.complaint.create({
      data: {
        title: 'Inappropriate Language in Team Meeting',
        description: 'During the team sync meeting on Jan 28, inappropriate language was used that made me uncomfortable.',
        isAnonymous: false,
        reportedById: employee.id,
        confidenceScore: Math.random(),
        status: 'REVIEW',
        currentStep: 2
      }
    });

    const complaint2 = await prisma.complaint.create({
      data: {
        title: 'Discrimination Concern',
        description: 'I feel I was not promoted due to my background.',
        isAnonymous: true,
        reportedById: employee.id,
        confidenceScore: Math.random(),
        status: 'RECEIVED',
        currentStep: 1
      }
    });

    const complaint3 = await prisma.complaint.create({
      data: {
        title: 'Hostile Work Environment',
        description: 'Ongoing exclusion from team activities and projects.',
        isAnonymous: false,
        reportedById: employee.id,
        confidenceScore: Math.random(),
        status: 'INVESTIGATION',
        currentStep: 3
      }
    });

    // Add workflow steps for complaint 1
    await prisma.workflowStep.create({
      data: {
        complaintId: complaint1.id,
        step: 'RECEIVED',
        notes: 'Complaint received and logged'
      }
    });

    await prisma.workflowStep.create({
      data: {
        complaintId: complaint1.id,
        step: 'REVIEW',
        notes: 'Initial review completed'
      }
    });

    // Add workflow steps for complaint 3
    await prisma.workflowStep.create({
      data: {
        complaintId: complaint3.id,
        step: 'RECEIVED',
        notes: 'Complaint received'
      }
    });

    await prisma.workflowStep.create({
      data: {
        complaintId: complaint3.id,
        step: 'REVIEW',
        notes: 'Review started'
      }
    });

    await prisma.workflowStep.create({
      data: {
        complaintId: complaint3.id,
        step: 'INVESTIGATION',
        notes: 'Investigation in progress'
      }
    });

    // Add internal HR comments
    await prisma.comment.create({
      data: {
        content: 'Manager interviewed, incident confirmed.',
        authorId: hr.id,
        complaintId: complaint1.id
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Recommended training for team.',
        authorId: hr.id,
        complaintId: complaint1.id
      }
    });

    console.log('✅ Database seeded successfully');
    console.log(`📊 Created ${3} demo complaints`);
    console.log(`👥 Created ${2} demo users`);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
