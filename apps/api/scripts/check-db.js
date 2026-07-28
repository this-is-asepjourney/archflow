const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        current_user,
        has_schema_privilege(current_user, 'public', 'CREATE') as can_create,
        has_schema_privilege(current_user, 'public', 'USAGE') as can_use
    `;
    console.log('DB permissions:', result);

    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Existing tables:', tables);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
