import { PrismaClient, CanvasType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Categories
  const catMicroservices = await prisma.templateCategory.upsert({
    where: { slug: 'microservices' },
    update: {},
    create: {
      name: 'Microservices',
      slug: 'microservices',
    },
  });

  const catMonolith = await prisma.templateCategory.upsert({
    where: { slug: 'monolith' },
    update: {},
    create: {
      name: 'Monolith',
      slug: 'monolith',
    },
  });

  const catDatabase = await prisma.templateCategory.upsert({
    where: { slug: 'database' },
    update: {},
    create: {
      name: 'Database (ERD)',
      slug: 'database',
    },
  });

  // 2. Create Official Templates (idempotent)
  const existingEcommerce = await prisma.template.findFirst({
    where: { name: 'E-Commerce Microservices', isOfficial: true },
  });
  if (!existingEcommerce) {
    console.log('Creating E-Commerce Microservices template...');
    await prisma.template.create({
      data: {
        name: 'E-Commerce Microservices',
        description:
          'Standard e-commerce backend topology with API Gateway, Auth, Product, and Order services.',
        type: CanvasType.TOPOLOGY,
        isOfficial: true,
        categoryId: catMicroservices.id,
        nodes: [
          {
            id: 'node-gateway',
            type: 'component',
            position: { x: 300, y: 100 },
            data: { label: 'API Gateway', type: 'Load Balancer' },
          },
          {
            id: 'node-auth',
            type: 'component',
            position: { x: 100, y: 300 },
            data: { label: 'Auth Service', type: 'Service' },
          },
          {
            id: 'node-product',
            type: 'component',
            position: { x: 300, y: 300 },
            data: { label: 'Product Service', type: 'Service' },
          },
          {
            id: 'node-order',
            type: 'component',
            position: { x: 500, y: 300 },
            data: { label: 'Order Service', type: 'Service' },
          },
          {
            id: 'node-db-product',
            type: 'component',
            position: { x: 300, y: 500 },
            data: { label: 'Product DB', type: 'Database' },
          },
          {
            id: 'node-db-order',
            type: 'component',
            position: { x: 500, y: 500 },
            data: { label: 'Order DB', type: 'Database' },
          },
        ],
        edges: [
          { id: 'e-gw-auth', source: 'node-gateway', target: 'node-auth' },
          { id: 'e-gw-product', source: 'node-gateway', target: 'node-product' },
          { id: 'e-gw-order', source: 'node-gateway', target: 'node-order' },
          { id: 'e-prod-db', source: 'node-product', target: 'node-db-product' },
          { id: 'e-ord-db', source: 'node-order', target: 'node-db-order' },
        ],
      },
    });
  }

  const existingMonolith = await prisma.template.findFirst({
    where: { name: 'SaaS Monolith', isOfficial: true },
  });
  if (!existingMonolith) {
    console.log('Creating SaaS Monolith template...');
    await prisma.template.create({
      data: {
        name: 'SaaS Monolith',
        description:
          'A traditional monolith architecture with a single backend service, PostgreSQL DB, and Redis cache.',
        type: CanvasType.TOPOLOGY,
        isOfficial: true,
        categoryId: catMonolith.id,
        nodes: [
          {
            id: 'node-lb',
            type: 'component',
            position: { x: 300, y: 100 },
            data: { label: 'Load Balancer', type: 'Load Balancer' },
          },
          {
            id: 'node-app',
            type: 'component',
            position: { x: 300, y: 300 },
            data: { label: 'Monolith App', type: 'Service' },
          },
          {
            id: 'node-pg',
            type: 'component',
            position: { x: 200, y: 500 },
            data: { label: 'PostgreSQL', type: 'Database' },
          },
          {
            id: 'node-redis',
            type: 'component',
            position: { x: 400, y: 500 },
            data: { label: 'Redis Cache', type: 'Database' },
          },
        ],
        edges: [
          { id: 'e-lb-app', source: 'node-lb', target: 'node-app' },
          { id: 'e-app-pg', source: 'node-app', target: 'node-pg' },
          { id: 'e-app-redis', source: 'node-app', target: 'node-redis' },
        ],
      },
    });
  }

  const existingErd = await prisma.template.findFirst({
    where: { name: 'Blog Platform ERD', isOfficial: true },
  });
  if (!existingErd) {
    console.log('Creating Basic ERD template...');
    await prisma.template.create({
      data: {
        name: 'Blog Platform ERD',
        description:
          'Entity Relationship Diagram for a simple blog with Users, Posts, and Comments.',
        type: CanvasType.ERD,
        isOfficial: true,
        categoryId: catDatabase.id,
        nodes: [
          {
            id: 'node-user',
            type: 'erd',
            position: { x: 100, y: 100 },
            data: {
              label: 'Users',
              columns: [
                { id: 'col1', name: 'id', type: 'UUID', isPrimary: true },
                { id: 'col2', name: 'email', type: 'String' },
                { id: 'col3', name: 'password', type: 'String' },
              ],
            },
          },
          {
            id: 'node-post',
            type: 'erd',
            position: { x: 400, y: 100 },
            data: {
              label: 'Posts',
              columns: [
                { id: 'col4', name: 'id', type: 'UUID', isPrimary: true },
                { id: 'col5', name: 'author_id', type: 'UUID', isForeign: true },
                { id: 'col6', name: 'title', type: 'String' },
                { id: 'col7', name: 'content', type: 'Text' },
              ],
            },
          },
          {
            id: 'node-comment',
            type: 'erd',
            position: { x: 400, y: 400 },
            data: {
              label: 'Comments',
              columns: [
                { id: 'col8', name: 'id', type: 'UUID', isPrimary: true },
                { id: 'col9', name: 'post_id', type: 'UUID', isForeign: true },
                { id: 'col10', name: 'author_id', type: 'UUID', isForeign: true },
                { id: 'col11', name: 'body', type: 'Text' },
              ],
            },
          },
        ],
        edges: [
          {
            id: 'e-user-post',
            source: 'node-user',
            target: 'node-post',
            type: 'smoothstep',
          },
          {
            id: 'e-post-comment',
            source: 'node-post',
            target: 'node-comment',
            type: 'smoothstep',
          },
          {
            id: 'e-user-comment',
            source: 'node-user',
            target: 'node-comment',
            type: 'smoothstep',
          },
        ],
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
