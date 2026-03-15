-- Seed script for Accommodation Rental Management
-- Run: sqlite3 prisma/dev.db < seed-data.sql

-- Mock Properties
INSERT OR IGNORE INTO Property (propertyId, name, address, occupancyLimit, rentAmount, depositAmount, status) VALUES
('APT101', 'Studio Apartment 1A', '123 Main St, Cityville', 2, 1200.00, 1200.00, 'AVAILABLE'),
('ROOM205', 'Deluxe Room 205', '456 Oak Ave, Cityville', 1, 850.00, 850.00, 'AVAILABLE'),
('HOUSE301', '3BR House 301', '789 Elm St, Cityville', 4, 2500.00, 2500.00, 'AVAILABLE');

-- Mock Tenants
INSERT OR IGNORE INTO Tenant (name, phone, email, idNumber, requiresSecurityDeposit, securityDepositCollected, emergencyContact, isBlacklisted, blacklistReason, blacklistUntil) VALUES
('John Doe', '+1 (555) 123-4567', 'john@example.com', 'ID123456', 1, 0, 'Jane Doe - +1 (555) 987-6543', 0, NULL, NULL),
('Jane Smith', '+1 (555) 987-6543', 'jane@example.com', 'ID789012', 1, 1, 'Bob Smith - +1 (555) 111-2222', 1, 'Previous bad experience - property damage', NULL),
('Bob Johnson', '+1 (555) 444-5555', 'bob@example.com', 'ID345678', 1, 0, 'Alice Johnson - +1 (555) 666-7777', 1, 'Non-payment of rent', '2026-06-01T00:00:00.000Z');

SELECT 'Seeded 3 properties, 3 tenants (2 blacklisted). Refresh app!';
