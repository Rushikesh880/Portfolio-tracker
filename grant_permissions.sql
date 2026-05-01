-- Grant usage on the public schema (usually already granted, but safe to include)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions for holdings table
GRANT ALL PRIVILEGES ON TABLE holdings TO anon, authenticated, service_role;

-- Grant permissions for price_cache table
GRANT ALL PRIVILEGES ON TABLE price_cache TO anon, authenticated, service_role;
