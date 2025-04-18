const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
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

  // Hash mật khẩu admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('✅ Admin user seeded (username: admin, password: admin123)');
  console.log('✅ Matchups seeded!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
