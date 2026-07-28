import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    // get any user
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user");

    // get any project
    const project = await prisma.project.findFirst();
    if (!project) throw new Error("No project");

    console.log("Trying to create canvas...");
    const canvas = await prisma.canvas.create({
      data: {
        projectId: project.id,
        name: 'Test Canvas',
        type: 'TOPOLOGY',
        createdBy: user.id,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });
    console.log("Canvas created successfully:", canvas.id);
  } catch (e: any) {
    console.error("Error creating canvas:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
