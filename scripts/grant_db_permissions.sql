-- Jalankan script ini di PostgreSQL server sebagai superuser (postgres)
-- untuk memberikan permission ke user admin_archflow

-- Grant semua permission di schema public
GRANT ALL ON SCHEMA public TO admin_archflow;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_archflow;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_archflow;
GRANT CREATE ON SCHEMA public TO admin_archflow;

-- Untuk tabel yang akan dibuat di masa depan
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin_archflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin_archflow;

-- Verifikasi
SELECT has_schema_privilege('admin_archflow', 'public', 'CREATE');
