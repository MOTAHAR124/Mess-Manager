import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const managerEmail = process.env.NEXT_PUBLIC_MANAGER_EMAIL || process.env.MANAGER_EMAIL || 'xyz@gmail.com';
const managerPassword = process.env.MANAGER_PASSWORD || '12345678';

/**
 * Database Seed Script
 * 
 * Creates test data for development:
 * - 2 test users (Manager + Member)
 * - 1 mess with 2 members
 * - 1 active month
 * - Sample meals, costs, deposits
 * 
 * Run: npm run prisma:seed
 */

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.meal.deleteMany();
  await prisma.cost.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.activeMonth.deleteMany();
  await prisma.month.deleteMany();
  await prisma.messMembers.deleteMany();
  await prisma.mess.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('Creating test users...');
  const managerUser = await prisma.user.create({
    data: {
      email: managerEmail,
      firstName: 'Manager',
      lastName: 'Test',
      passwordHash: await bcrypt.hash(managerPassword, 10),
      isVerified: true,
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@test.com',
      firstName: 'Member',
      lastName: 'Test',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
    },
  });

  const member2User = await prisma.user.create({
    data: {
      email: 'member2@test.com',
      firstName: 'Member',
      lastName: 'Two',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
    },
  });

  console.log(`✓ Created 3 users`);

  // Create Mess
  console.log('Creating test mess...');
  const mess = await prisma.mess.create({
    data: {
      name: 'Bachelor Mess',
      createdBy: managerUser.id,
      balance: 0,
    },
  });

  console.log(`✓ Created mess: ${mess.name}`);

  // Add Members to Mess
  console.log('Adding members to mess...');
  await prisma.messMembers.create({
    data: {
      messId: mess.id,
      userId: managerUser.id,
      role: 'MANAGER',
    },
  });

  await prisma.messMembers.create({
    data: {
      messId: mess.id,
      userId: memberUser.id,
      role: 'MEMBER',
    },
  });

  await prisma.messMembers.create({
    data: {
      messId: mess.id,
      userId: member2User.id,
      role: 'MEMBER',
    },
  });

  console.log(`✓ Added 3 members to mess`);

  // Create Month
  console.log('Creating test month...');
  const currentDate = new Date();
  const month = await prisma.month.create({
    data: {
      messId: mess.id,
      name: `April 2026`,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      status: 'ACTIVE',
    },
  });

  // Set as Active Month
  await prisma.activeMonth.create({
    data: {
      messId: mess.id,
      monthId: month.id,
    },
  });

  console.log(`✓ Created month: ${month.name}`);

  // Create Sample Meals
  console.log('Creating sample meals...');
  const meals = [];

  for (let day = 1; day <= 5; day++) {
    const mealDate = new Date(2026, 3, day);

    // Manager meal
    meals.push(
      await prisma.meal.create({
        data: {
          monthId: month.id,
          memberId: managerUser.id,
          date: mealDate,
          breakfast: 1,
          lunch: 1,
          dinner: 1,
          cost: 100,
          details: `Day ${day} meals`,
        },
      }),
    );

    // Member 1 meal
    meals.push(
      await prisma.meal.create({
        data: {
          monthId: month.id,
          memberId: memberUser.id,
          date: mealDate,
          breakfast: 1,
          lunch: 1,
          dinner: 1,
          cost: 100,
          details: `Day ${day} meals`,
        },
      }),
    );

    // Member 2 meal
    meals.push(
      await prisma.meal.create({
        data: {
          monthId: month.id,
          memberId: member2User.id,
          date: mealDate,
          breakfast: 1,
          lunch: 0,
          dinner: 1,
          cost: 80,
          details: `Day ${day} meals`,
        },
      }),
    );
  }

  console.log(`✓ Created ${meals.length} meals`);

  // Create Sample Costs (Shared)
  console.log('Creating sample costs...');
  const costs = [];

  // Shared utilities cost
  costs.push(
    await prisma.cost.create({
      data: {
        monthId: month.id,
        name: 'WiFi Bill',
        type: 'SHARED',
        amount: 1500,
        date: new Date('2026-04-05'),
        paidBy: managerUser.id,
        description: 'Monthly WiFi subscription',
      },
    }),
  );

  // Shared cooking gas
  costs.push(
    await prisma.cost.create({
      data: {
        monthId: month.id,
        name: 'Cooking Gas',
        type: 'SHARED',
        amount: 500,
        date: new Date('2026-04-10'),
        paidBy: managerUser.id,
        description: 'LPG cylinder refill',
      },
    }),
  );

  // Individual cost
  costs.push(
    await prisma.cost.create({
      data: {
        monthId: month.id,
        name: 'Extra Groceries',
        type: 'INDIVIDUAL',
        amount: 800,
        date: new Date('2026-04-15'),
        paidBy: memberUser.id,
        description: 'Personal groceries purchase',
      },
    }),
  );

  console.log(`✓ Created ${costs.length} costs`);

  // Create Sample Deposits
  console.log('Creating sample deposits...');
  const deposits = [];

  deposits.push(
    await prisma.deposit.create({
      data: {
        monthId: month.id,
        memberId: managerUser.id,
        amount: 3000,
        date: new Date('2026-04-01'),
        description: 'Initial deposit for month',
      },
    }),
  );

  deposits.push(
    await prisma.deposit.create({
      data: {
        monthId: month.id,
        memberId: memberUser.id,
        amount: 2500,
        date: new Date('2026-04-01'),
        description: 'Initial deposit for month',
      },
    }),
  );

  deposits.push(
    await prisma.deposit.create({
      data: {
        monthId: month.id,
        memberId: member2User.id,
        amount: 2000,
        date: new Date('2026-04-01'),
        description: 'Initial deposit for month',
      },
    }),
  );

  console.log(`✓ Created ${deposits.length} deposits`);

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Manager:');
  console.log(`  Email: ${managerEmail}`);
  console.log(`  Password: ${managerPassword}`);
  console.log('');
  console.log('Member:');
  console.log('  Email: member@test.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Member 2:');
  console.log('  Email: member2@test.com');
  console.log('  Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
