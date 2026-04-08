CREATE TABLE `roles` (
	`role_id` int AUTO_INCREMENT NOT NULL,
	`role_name` varchar(20) NOT NULL,
	CONSTRAINT `roles_role_id` PRIMARY KEY(`role_id`)
);
--> statement-breakpoint
ALTER TABLE `admin` DROP FOREIGN KEY `admin_is_user_users_role_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_is_user_users_role_fk`;
--> statement-breakpoint
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_is_user_users_role_fk`;
--> statement-breakpoint
ALTER TABLE `admin` MODIFY COLUMN `is_user` int;--> statement-breakpoint
ALTER TABLE `students` MODIFY COLUMN `is_user` int;--> statement-breakpoint
ALTER TABLE `teachers` MODIFY COLUMN `is_user` int;--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_is_user_roles_role_id_fk` FOREIGN KEY (`is_user`) REFERENCES `roles`(`role_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_is_user_roles_role_id_fk` FOREIGN KEY (`is_user`) REFERENCES `roles`(`role_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_is_user_roles_role_id_fk` FOREIGN KEY (`is_user`) REFERENCES `roles`(`role_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;