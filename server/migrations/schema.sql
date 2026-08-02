-- Sergiu Mind Find - schema PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('client', 'worker', 'admin');
CREATE TYPE request_status AS ENUM ('open', 'assigned', 'completed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE review_direction AS ENUM ('client_to_worker', 'worker_to_client');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE worker_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  photo_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE worker_categories (
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (worker_id, category_id)
);

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'open',
  assigned_worker_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  price NUMERIC(10,2),
  status offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, worker_id)
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction review_direction NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, reviewer_id, reviewee_id)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, worker_id, request_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_worker_categories_category ON worker_categories(category_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_city ON requests(city);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

INSERT INTO categories (name, slug) VALUES
  ('Instalații electrice', 'electrician'),
  ('Instalații sanitare', 'instalator'),
  ('Zugrăveli & Finisaje', 'zugrav'),
  ('Tâmplărie', 'tamplar'),
  ('Construcții & Renovări', 'constructor'),
  ('Curățenie', 'curatenie'),
  ('Grădinărit', 'gradinar'),
  ('Mutări & Transport', 'mutari'),
  ('Climatizare & Încălzire', 'climatizare'),
  ('Reparații electrocasnice', 'electrocasnice');
