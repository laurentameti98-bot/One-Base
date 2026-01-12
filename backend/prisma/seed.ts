import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

const ACCOUNT_NAMES = [
  'Acme Corporation',
  'TechStart Inc',
  'Global Solutions Ltd',
  'Innovation Systems',
  'Digital Dynamics',
  'Enterprise Partners',
  'Strategic Ventures',
  'Premier Technologies',
  'Advanced Solutions',
  'Future Industries',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Education',
  'Energy',
  'Real Estate',
  'Transportation',
];

const DEAL_NAMES = [
  'Q1 Enterprise License',
  'Annual Support Contract',
  'Platform Upgrade',
  'Custom Integration',
  'Professional Services',
  'Training Package',
  'Maintenance Agreement',
  'Expansion Project',
  'Digital Transformation',
  'Cloud Migration',
  'Security Audit',
  'Compliance Package',
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.deal.deleteMany({});
  // await prisma.contact.deleteMany({});
  // await prisma.account.deleteMany({});

  // Create 10 accounts
  const accounts = [];
  for (let i = 0; i < 10; i++) {
    const account = await prisma.account.create({
      data: {
        name: ACCOUNT_NAMES[i],
        industry: INDUSTRIES[i],
        website: `https://www.${ACCOUNT_NAMES[i].toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1-555-${String(Math.floor(1000 + Math.random() * 9000))}`,
      },
    });
    accounts.push(account);
    console.log(`Created account: ${account.name}`);
  }

  // Create 120 deals distributed across accounts (12 deals per account)
  let dealCount = 0;
  for (const account of accounts) {
    for (let i = 0; i < 12; i++) {
      const stage = DEAL_STAGES[Math.floor(Math.random() * DEAL_STAGES.length)];
      const dealName = DEAL_NAMES[Math.floor(Math.random() * DEAL_NAMES.length)];
      const amount = Math.floor(Math.random() * 500000) + 10000; // Random amount between 10k and 510k
      const daysFromNow = Math.floor(Math.random() * 180) - 90; // Random date between 90 days ago and 90 days from now
      const closeDate = new Date();
      closeDate.setDate(closeDate.getDate() + daysFromNow);

      await prisma.deal.create({
        data: {
          accountId: account.id,
          name: `${dealName} - ${account.name}`,
          stage: stage,
          amount: amount,
          closeDate: closeDate,
        },
      });
      dealCount++;
    }
    console.log(`Created 12 deals for account: ${account.name}`);
  }

  console.log(`\nSeeding completed!`);
  console.log(`Created ${accounts.length} accounts`);
  console.log(`Created ${dealCount} deals`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
