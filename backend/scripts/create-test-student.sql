-- Create test student user with Pro plan
-- Email: student@techwell.co.in
-- Password: student123 (hashed with bcrypt)

-- First, delete if exists
DELETE FROM "User" WHERE email = 'student@techwell.co.in';

-- Insert new test student
-- Password hash for 'student123' with bcrypt rounds=10
INSERT INTO "User" (
  id,
  email,
  password,
  name,
  role,
  "hasUnlimitedInterviews",
  dob,
  qualification,
  college,
  "createdAt",
  "updatedAt"
) VALUES (
  'test-student-001',
  'student@techwell.co.in',
  '$2a$10$rQ8K5O.V5Y5vN5Y5Y5Y5YeK5O.V5Y5vN5Y5Y5Y5YeK5O.V5Y5vN5Y',
  'Test Student',
  'STUDENT',
  true,
  '2000-01-01',
  'B.Tech Computer Science',
  'Test University',
  NOW(),
  NOW()
);

-- Verify
SELECT id, email, name, role, "hasUnlimitedInterviews" 
FROM "User" 
WHERE email = 'student@techwell.co.in';
