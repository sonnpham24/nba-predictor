const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const existingPlayoffMatchups = await prisma.matchup.count();
  if (existingPlayoffMatchups === 0) {
    await prisma.matchup.createMany({
      data: [
        // WEST
        { teamA: 'Thunder (1)', teamB: '?? (8)', round: 1, conference: 'west' },
        { teamA: 'Nuggets (4)', teamB: 'Clippers (5)', round: 1, conference: 'west' },
        { teamA: 'Lakers (3)', teamB: 'Timberwolves (6)', round: 1, conference: 'west' },
        { teamA: 'Rockets (2)', teamB: 'Warriors (7)', round: 1, conference: 'west' },

        // EAST
        { teamA: 'Cavaliers (1)', teamB: '?? (8)', round: 1, conference: 'east' },
        { teamA: 'Pacers (4)', teamB: 'Bucks (5)', round: 1, conference: 'east' },
        { teamA: 'Knicks (3)', teamB: 'Pistons (6)', round: 1, conference: 'east' },
        { teamA: 'Celtics (2)', teamB: 'Magic (7)', round: 1, conference: 'east' },
      ],
    });
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminEmail = process.env.ADMIN_EMAIL || undefined;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      email: adminEmail,
      isAdmin: true,
      isEmailVerified: true,
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      isEmailVerified: true,
    },
  });

  console.log(`✅ Admin user seeded (username: ${adminUsername})`);
  console.log('✅ Seed completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
