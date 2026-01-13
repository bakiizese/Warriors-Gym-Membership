-- Create the user (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'postname') THEN
    CREATE USER postname WITH ENCRYPTED PASSWORD 'password';
  END IF;
END $$;

-- Create the database
-- Note: You can't run CREATE DATABASE inside a transaction block, 
-- so if this fails, run it manually once in psql.
CREATE DATABASE postdb;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE postdb TO postname;