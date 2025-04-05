-- Insert dummy users
INSERT INTO users (username, password, full_name, email, mobile_number, pincode, role, is_business_owner, created_at, updated_at)
VALUES 
('john_doe', '$2a$10$x6ABDsrwxGvtpcOYKwMwIummEnw5c0tcKqrIoc9G7lZxjtMxUh/9G', 'John Doe', 'john@example.com', '1234567890', '123456', 'CUSTOMER', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('jane_smith', '$2a$10$x6ABDsrwxGvtpcOYKwMwIummEnw5c0tcKqrIoc9G7lZxjtMxUh/9G', 'Jane Smith', 'jane@example.com', '9876543210', '654321', 'BUSINESS_OWNER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert dummy posts
INSERT INTO posts (title, content, post_type, status, category, pincode, user_id, created_at, updated_at)
VALUES 
('Looking for a plumber', 'Need a reliable plumber for bathroom renovation', 'REQUEST', 'ACTIVE', 'PLUMBING', '123456', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Car wash service available', 'Professional car wash service at your doorstep', 'OFFER', 'ACTIVE', 'AUTOMOTIVE', '123456', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Grocery delivery service', 'Fresh groceries delivered to your home', 'OFFER', 'ACTIVE', 'GROCERIES', '654321', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Need electrician', 'Looking for an electrician for house wiring', 'REQUEST', 'ACTIVE', 'ELECTRICAL', '654321', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('House cleaning service', 'Professional house cleaning service available', 'OFFER', 'ACTIVE', 'CLEANING', '123456', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 