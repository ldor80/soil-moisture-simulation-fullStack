CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user if it doesn't exist
INSERT INTO users (id, username)
VALUES (1, 'default_user')
ON CONFLICT (id) DO NOTHING;
