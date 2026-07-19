ALTER TABLE `sectors`
  ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD INDEX `sectors_parent_id_idx` (`parent_id`),
  ADD CONSTRAINT `sectors_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `sectors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `industry_chains`
  ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE `announcements`
  ADD COLUMN `source_name` VARCHAR(100) NULL,
  ADD COLUMN `category` VARCHAR(50) NULL,
  ADD COLUMN `content` LONGTEXT NULL,
  ADD COLUMN `parse_status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `last_parsed_at` DATETIME(3) NULL;

ALTER TABLE `quiz_questions`
  ADD COLUMN `difficulty` VARCHAR(20) NOT NULL DEFAULT 'medium',
  ADD COLUMN `score` INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN `weight` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `company_id` INTEGER NULL,
  ADD COLUMN `chain_id` INTEGER NULL,
  ADD INDEX `quiz_questions_company_id_idx` (`company_id`),
  ADD INDEX `quiz_questions_chain_id_idx` (`chain_id`),
  ADD CONSTRAINT `quiz_questions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_questions_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `industry_chains`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `sync_tasks`
  ADD COLUMN `last_result` JSON NULL,
  ADD COLUMN `run_count` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `industry_chain_nodes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `chain_id` INTEGER NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'stage',
  `stage` VARCHAR(30) NOT NULL DEFAULT 'midstream',
  `description` TEXT NULL,
  `position_x` DOUBLE NOT NULL DEFAULT 0,
  `position_y` DOUBLE NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `industry_chain_nodes_chain_id_idx` (`chain_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `industry_chain_nodes_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `industry_chains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `industry_chain_edges` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `chain_id` INTEGER NOT NULL,
  `source_node_id` INTEGER NOT NULL,
  `target_node_id` INTEGER NOT NULL,
  `label` VARCHAR(100) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `industry_chain_edges_chain_id_idx` (`chain_id`),
  INDEX `industry_chain_edges_source_node_id_idx` (`source_node_id`),
  INDEX `industry_chain_edges_target_node_id_idx` (`target_node_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `industry_chain_edges_chain_id_fkey` FOREIGN KEY (`chain_id`) REFERENCES `industry_chains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `industry_chain_edges_source_node_id_fkey` FOREIGN KEY (`source_node_id`) REFERENCES `industry_chain_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `industry_chain_edges_target_node_id_fkey` FOREIGN KEY (`target_node_id`) REFERENCES `industry_chain_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `industry_chain_node_companies` (
  `node_id` INTEGER NOT NULL,
  `company_id` INTEGER NOT NULL,
  PRIMARY KEY (`node_id`, `company_id`),
  CONSTRAINT `industry_chain_node_companies_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `industry_chain_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `industry_chain_node_companies_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_parse_results` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `announcement_id` INTEGER NOT NULL,
  `raw_result` JSON NOT NULL,
  `edited_result` JSON NULL,
  `model_name` VARCHAR(80) NOT NULL DEFAULT 'mock-provider',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `reviewer_id` INTEGER NULL,
  `reviewed_at` DATETIME(3) NULL,
  `failure_reason` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `ai_parse_results_announcement_id_idx` (`announcement_id`),
  INDEX `ai_parse_results_status_idx` (`status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ai_parse_results_announcement_id_fkey` FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ai_parse_results_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `admin_id` INTEGER NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `target_type` VARCHAR(50) NULL,
  `target_id` VARCHAR(50) NULL,
  `summary` VARCHAR(500) NOT NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `audit_logs_admin_id_idx` (`admin_id`),
  INDEX `audit_logs_module_created_at_idx` (`module`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `audit_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
