import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACTIVITY_TYPES = ['note', 'task', 'call', 'meeting'] as const;

const ACTIVITY_SUBJECTS = [
  'Initial consultation call',
  'Follow-up meeting scheduled',
  'Product demo completed',
  'Contract review discussion',
  'Technical requirements gathering',
  'Proposal presentation',
  'Negotiation session',
  'Implementation planning',
  'Status update call',
  'Quarterly review meeting',
];

const ACTIVITY_BODIES = [
  'Discussed initial requirements and expectations. Client showed strong interest in our solution.',
  'Scheduled follow-up meeting for next week to discuss pricing and implementation timeline.',
  'Completed comprehensive product demonstration. Team was impressed with features.',
  'Reviewed contract terms and conditions. Addressed several clarification questions.',
  'Gathered detailed technical requirements. Identified key integration points.',
  'Presented proposal with custom pricing. Waiting for decision timeline.',
  'Had productive negotiation session. Discussed payment terms and delivery schedule.',
  'Planned implementation roadmap. Set milestones and delivery dates.',
  'Provided status update on current progress. All milestones on track.',
  'Conducted quarterly review. Discussed performance metrics and future opportunities.',
];

const STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];

async function main() {
  console.log('Seeding activities for Future Industries account...');

  // Find the Future Industries account
  const account = await prisma.account.findFirst({
    where: {
      name: 'Future Industries',
      deletedAt: null,
    },
  });

  if (!account) {
    console.error('Future Industries account not found. Please create it first.');
    process.exit(1);
  }

  console.log(`Found account: ${account.name} (${account.id})`);

  const activitiesToCreate = 10;
  let activitiesCreated = 0;

  for (let i = 0; i < activitiesToCreate; i++) {
    const randomType = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
    const subject = ACTIVITY_SUBJECTS[i % ACTIVITY_SUBJECTS.length];
    const body = ACTIVITY_BODIES[i % ACTIVITY_BODIES.length];
    const status = i % 3 === 0 ? STATUSES[i % STATUSES.length] : null;
    
    // Create due dates in the future (within next 30 days)
    const daysFromNow = Math.floor(Math.random() * 30) + 1;
    const dueDate = i % 2 === 0 ? new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000) : null;

    await prisma.activity.create({
      data: {
        accountId: account.id,
        type: randomType,
        subject: subject,
        body: body,
        status: status,
        dueDate: dueDate,
      },
    });
    activitiesCreated++;
    console.log(`Created activity ${i + 1}: ${randomType} - ${subject}`);
  }

  console.log('\nSeeding completed!');
  console.log(`Created ${activitiesCreated} activities for account: ${account.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
