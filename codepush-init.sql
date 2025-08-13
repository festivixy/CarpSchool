-- CodePush MySQL Database Initialization Script
-- This script sets up the initial database structure for CodePush server

CREATE DATABASE IF NOT EXISTS codepush CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codepush;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Apps table
CREATE TABLE IF NOT EXISTS `apps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `platform` enum('ios','android') NOT NULL,
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_app_name_platform` (`name`, `platform`),
  KEY `owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Deployments table
CREATE TABLE IF NOT EXISTS `deployments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `key` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_app_deployment` (`app_id`, `name`),
  KEY `app_id` (`app_id`),
  FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Packages table
CREATE TABLE IF NOT EXISTS `packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deployment_id` int(11) NOT NULL,
  `description` text,
  `package_hash` varchar(64) NOT NULL,
  `blob_url` varchar(500) NOT NULL,
  `size` bigint(20) NOT NULL,
  `manifest_blob_url` varchar(500),
  `released_by` int(11),
  `label` varchar(20) NOT NULL,
  `is_mandatory` boolean DEFAULT false,
  `is_disabled` boolean DEFAULT false,
  `rollout` int(3) DEFAULT 100,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deployment_id` (`deployment_id`),
  KEY `released_by` (`released_by`),
  FOREIGN KEY (`deployment_id`) REFERENCES `deployments` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`released_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Package diff table (for differential updates)
CREATE TABLE IF NOT EXISTS `packages_diff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `diff_against_package_hash` varchar(64) NOT NULL,
  `diff_blob_url` varchar(500) NOT NULL,
  `diff_size` bigint(20) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `package_id` (`package_id`),
  FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Package metrics table
CREATE TABLE IF NOT EXISTS `package_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `app_version` varchar(20),
  `deployment_id` int(11) NOT NULL,
  `client_unique_id` varchar(100),
  `label` varchar(20),
  `status` enum('DeploymentSucceeded','DeploymentFailed','Downloaded') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `package_id` (`package_id`),
  KEY `deployment_id` (`deployment_id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`deployment_id`) REFERENCES `deployments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User sessions table
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` varchar(128) NOT NULL,
  `user_id` int(11),
  `expires` timestamp NULL,
  `data` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `expires` (`expires`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
INSERT IGNORE INTO `users` (`username`, `password`, `email`) VALUES 
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye1234567890abcdefghijklmnopqrstuvwxyz', 'admin@carp.school');

-- Insert default apps for CarpSchool
SET @admin_id = (SELECT id FROM users WHERE username = 'admin');

INSERT IGNORE INTO `apps` (`name`, `description`, `platform`, `owner_id`) VALUES 
('CarpSchool-iOS', 'CarpSchool iOS Application', 'ios', @admin_id),
('CarpSchool-Android', 'CarpSchool Android Application', 'android', @admin_id);

-- Create default deployments
SET @ios_app_id = (SELECT id FROM apps WHERE name = 'CarpSchool-iOS');
SET @android_app_id = (SELECT id FROM apps WHERE name = 'CarpSchool-Android');

INSERT IGNORE INTO `deployments` (`app_id`, `name`, `key`) VALUES 
(@ios_app_id, 'Staging', CONCAT('ios-staging-', SUBSTRING(MD5(RAND()), 1, 20))),
(@ios_app_id, 'Production', CONCAT('ios-production-', SUBSTRING(MD5(RAND()), 1, 20))),
(@android_app_id, 'Staging', CONCAT('android-staging-', SUBSTRING(MD5(RAND()), 1, 20))),
(@android_app_id, 'Production', CONCAT('android-production-', SUBSTRING(MD5(RAND()), 1, 20)));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS `idx_packages_hash` ON `packages` (`package_hash`);
CREATE INDEX IF NOT EXISTS `idx_packages_label` ON `packages` (`label`);
CREATE INDEX IF NOT EXISTS `idx_deployments_key` ON `deployments` (`key`);
CREATE INDEX IF NOT EXISTS `idx_metrics_client` ON `package_metrics` (`client_unique_id`);

-- Show created deployment keys for reference
SELECT 
    a.name as app_name,
    a.platform,
    d.name as deployment_name,
    d.key as deployment_key
FROM apps a 
JOIN deployments d ON a.id = d.app_id 
ORDER BY a.platform, a.name, d.name;
