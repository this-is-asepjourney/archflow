const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://admin_archflow:PasswordKuat123@34.50.98.189:5432/archflow_db',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Try to create tables using raw SQL as a workaround
    // Check current search_path and schema permissions
    const result = await client.query(`
      SELECT current_user, 
             has_schema_privilege(current_user, 'public', 'CREATE') as can_create,
             has_schema_privilege(current_user, 'public', 'USAGE') as can_use
    `);
    console.log('Permissions check:', result.rows[0]);

    // Check existing tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
