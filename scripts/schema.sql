BEGIN;
CREATE TABLE IF NOT EXISTS tour_ballots(email TEXT PRIMARY KEY, tour TEXT NOT NULL CHECK(tour IN ('higo','nlg','zhang','taiwan','beijing','korea')), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS tour_codes(email TEXT PRIMARY KEY, code_hash TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS tour_mail_requests(id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS tour_mail_requests_email_time ON tour_mail_requests(email,created_at);
CREATE INDEX IF NOT EXISTS tour_mail_requests_ip_time ON tour_mail_requests(ip_hash,created_at);
CREATE TABLE IF NOT EXISTS tour_sessions(token_hash TEXT PRIMARY KEY,email TEXT NOT NULL,expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS tour_sessions_expiry ON tour_sessions(expires_at);
COMMIT;
