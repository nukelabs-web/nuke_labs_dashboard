-- NukeLabs Dashboard Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (name, role, email, department) VALUES
  ('Ankit Verma', 'Admin', 'ankit@nukelabs.in', 'Operations'),
  ('Meera Joshi', 'Core Team', 'meera@nukelabs.in', 'HR'),
  ('Rohan Gupta', 'BD Executive', 'rohan@nukelabs.in', 'Business Development'),
  ('Sneha Iyer', 'Junior Executive', 'sneha@nukelabs.in', 'Finance'),
  ('Priya Menon', 'Core Team', 'priya@nukelabs.in', 'Content');

-- ============================================
-- COLLEGES
-- ============================================
INSERT INTO colleges (name, city, state, contact_person, contact_email, contact_phone, department, lead_source, lead_status, assigned_to) VALUES
  ('IIT Bombay', 'Mumbai', 'Maharashtra', 'Dr. Suresh Patel', 'suresh@iitb.ac.in', '9876543210', 'IEEE', 'Referral', 'Workshop Confirmed', 'Ankit'),
  ('VIT Vellore', 'Vellore', 'Tamil Nadu', 'Prof. Lakshmi', 'lakshmi@vit.ac.in', '9876543211', 'Robotics Club', 'LinkedIn', 'Interested', 'Meera'),
  ('BITS Pilani', 'Pilani', 'Rajasthan', 'Dr. Sharma', 'sharma@bits.ac.in', '9876543212', 'ECE', 'Cold Call', 'Negotiation', 'Rohan'),
  ('NIT Trichy', 'Trichy', 'Tamil Nadu', 'Dr. Raman', 'raman@nitt.edu', '9876543213', 'IEEE', 'Event', 'Contacted', 'Sneha'),
  ('IIIT Hyderabad', 'Hyderabad', 'Telangana', 'Dr. Rao', 'rao@iiith.ac.in', '9876543214', 'IT Club', 'Website', 'New Lead', 'Ankit'),
  ('SRM Chennai', 'Chennai', 'Tamil Nadu', 'Prof. Kumar', 'kumar@srm.edu', '9876543215', 'CSE', 'Referral', 'New Lead', 'Rohan'),
  ('KIIT Bhubaneswar', 'Bhubaneswar', 'Odisha', 'Ms. Das', 'das@kiit.ac.in', '9876543216', 'Innovation Club', 'Event', 'Contacted', 'Priya'),
  ('DTU Delhi', 'Delhi', 'Delhi', 'Dr. Mehta', 'mehta@dtu.ac.in', '9876543217', 'Robotics', 'LinkedIn', 'Interested', 'Meera');

-- ============================================
-- TRAINERS
-- ============================================
INSERT INTO trainers (name, organization, city, skills, workshops_can_teach, phone, email, workshops_conducted, rating, availability_status) VALUES
  ('Rahul Sharma', 'NukeLabs', 'Mumbai', 'Drones, IoT', 'Drone Workshop, IoT Workshop', '9876543210', 'rahul@nukelabs.in', 24, 4.8, 'Available'),
  ('Priya Patel', 'NukeLabs', 'Delhi', 'IoT, Arduino', 'IoT Workshop', '9876543211', 'priya@nukelabs.in', 18, 4.6, 'Available'),
  ('Arun Kumar', 'Freelance', 'Bangalore', 'Robotics, Arduino', 'Robotics Workshop', '9876543212', 'arun@email.com', 12, 4.5, 'Busy'),
  ('Sneha Reddy', 'NukeLabs', 'Hyderabad', 'IoT, Python', 'IoT Workshop, Python Workshop', '9876543213', 'sneha@nukelabs.in', 15, 4.7, 'Available'),
  ('Vikram Singh', 'Freelance', 'Jaipur', 'Drones', 'Drone Workshop', '9876543214', 'vikram@email.com', 8, 4.3, 'On Leave');

-- ============================================
-- WORKSHOPS
-- ============================================
INSERT INTO workshops (workshop_id, college_name, city, workshop_type, workshop_date, trainer_name, expected_students, actual_students, status, responsible) VALUES
  ('WS-2026-001', 'IIT Bombay', 'Mumbai', 'Drone Workshop', '2026-03-28', 'Rahul Sharma', 60, NULL, 'Confirmed', 'Ankit'),
  ('WS-2026-002', 'VIT Vellore', 'Vellore', 'IoT Workshop', '2026-03-30', 'Priya Patel', 45, NULL, 'Planned', 'Meera'),
  ('WS-2026-003', 'BITS Pilani', 'Pilani', 'Robotics Workshop', '2026-04-02', 'Arun Kumar', 50, NULL, 'Confirmed', 'Rohan'),
  ('WS-2026-004', 'NIT Trichy', 'Trichy', 'IoT Workshop', '2026-04-05', 'Sneha Reddy', 40, NULL, 'Planned', 'Sneha'),
  ('WS-2026-005', 'IIIT Hyderabad', 'Hyderabad', 'Drone Workshop', '2026-03-15', 'Rahul Sharma', 55, 52, 'Completed', 'Ankit'),
  ('WS-2026-006', 'DTU Delhi', 'Delhi', 'Robotics Workshop', '2026-03-10', 'Priya Patel', 50, 48, 'Completed', 'Meera'),
  ('WS-2026-007', 'SRM Chennai', 'Chennai', 'IoT Workshop', '2026-02-20', 'Sneha Reddy', 40, 38, 'Completed', 'Priya'),
  ('WS-2026-008', 'KIIT Bhubaneswar', 'Bhubaneswar', 'Drone Workshop', '2026-02-15', 'Vikram Singh', 35, 33, 'Completed', 'Ankit');

-- ============================================
-- TASKS
-- ============================================
INSERT INTO tasks (title, description, assigned_person, department, priority, deadline, status) VALUES
  ('Prepare IoT kits for VIT workshop', 'Check inventory and prepare 45 IoT kits', 'Ankit', 'Operations', 'High', '2026-03-29', 'In Progress'),
  ('Confirm trainer for BITS Pilani', 'Contact Arun Kumar and confirm availability', 'Meera', 'HR', 'Urgent', '2026-03-27', 'Pending'),
  ('Send follow-up to NIT Trichy', 'Follow up on workshop proposal', 'Rohan', 'BD', 'Medium', '2026-03-30', 'Pending'),
  ('Update workshop content for drones', 'Add new drone flight modules', 'Rahul', 'Content', 'Low', '2026-04-10', 'In Progress'),
  ('Process trainer payments for March', 'Calculate and process payments for completed workshops', 'Sneha', 'Finance', 'High', '2026-04-01', 'Pending');

-- ============================================
-- KITS
-- ============================================
INSERT INTO kits (name, total_quantity, available_quantity, in_use_quantity, damaged_units) VALUES
  ('Drone Kit', 30, 22, 6, 2),
  ('IoT Kit', 50, 38, 10, 2),
  ('Robotics Kit', 25, 18, 5, 2),
  ('Arduino Starter Kit', 40, 35, 4, 1),
  ('Raspberry Pi Kit', 20, 15, 4, 1);
