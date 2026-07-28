const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Attempting to create tables...');
    
    // Try creating ENUMs first
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "WorkspaceRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER')`).catch(e => console.log('WorkspaceRole:', e.message));
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "CanvasType" AS ENUM ('TOPOLOGY', 'FLOW', 'ERD', 'UML', 'INFRASTRUCTURE', 'CICD', 'SEQUENCE')`).catch(e => console.log('CanvasType:', e.message));
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "RequirementType" AS ENUM ('BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL')`).catch(e => console.log('RequirementType:', e.message));
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "RequirementStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'DONE')`).catch(e => console.log('RequirementStatus:', e.message));
    await prisma.$executeRawUnsafe(`CREATE TYPE IF NOT EXISTS "RequirementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`).catch(e => console.log('RequirementPriority:', e.message));

    // Try creating users table
    const r = await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "avatar" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('users table created:', r);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
  } finally {
    await prisma.$disconnect();
  }
}

run();
