import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Melissa', 'Daniel', 'Nicole',
  'Matthew', 'Stephanie', 'Anthony', 'Elizabeth', 'Mark', 'Michelle', 'Donald', 'Kimberly',
  'Steven', 'Amy', 'Paul', 'Angela', 'Andrew', 'Lisa', 'Joshua', 'Nancy',
  'Kenneth', 'Karen', 'Kevin', 'Betty', 'Brian', 'Helen', 'George', 'Sandra'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
  'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams'
];

const TITLES = [
  'CEO', 'CTO', 'CFO', 'VP Sales', 'VP Marketing', 'VP Engineering', 'VP Operations',
  'Director of Sales', 'Director of Marketing', 'Director of Engineering',
  'Sales Manager', 'Marketing Manager', 'Engineering Manager', 'Product Manager',
  'Account Executive', 'Sales Representative', 'Marketing Specialist', 'Software Engineer',
  'Business Development', 'Operations Manager', 'Customer Success Manager', 'HR Manager',
  'Finance Manager', 'Legal Counsel', 'Consultant', 'Advisor'
];

const EMAIL_DOMAINS = [
  'futureindustries.com',
  'futureind.com',
  'fi.com'
];

async function main() {
  console.log('Seeding contacts for Future Industries account...');

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

  // Create 10 contacts
  const contacts = [];
  for (let i = 0; i < 10; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const emailDomain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const phone = `+1-555-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const contact = await prisma.contact.create({
      data: {
        accountId: account.id,
        firstName,
        lastName,
        email,
        phone,
        title,
      },
    });

    contacts.push(contact);
    console.log(`Created contact: ${firstName} ${lastName} (${title})`);
  }

  console.log(`\nSeeding completed!`);
  console.log(`Created ${contacts.length} contacts for ${account.name}`);
}

main()
  .catch((e) => {
    console.error('Error seeding contacts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
