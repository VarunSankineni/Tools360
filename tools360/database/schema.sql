-- Tools360 database schema (PostgreSQL).
-- Stores NO uploaded files and NO personal data except what people type in the contact form.

CREATE TABLE IF NOT EXISTS tool_usage (
  tool     TEXT    NOT NULL,
  used_on  DATE    NOT NULL DEFAULT CURRENT_DATE,
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tool, used_on)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id         SERIAL PRIMARY KEY,
  tool       VARCHAR(40) NOT NULL,
  helpful    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_tool ON feedback (tool);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages (created_at DESC);
