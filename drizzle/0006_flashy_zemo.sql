DROP TABLE `roles`;--> statement-breakpoint
ALTER TABLE `admin` DROP FOREIGN KEY `admin_is_user_roles_role_id_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_is_user_roles_role_id_fk`;
--> statement-breakpoint
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_is_user_roles_role_id_fk`;
--> statement-breakpoint
ALTER TABLE `admin` MODIFY COLUMN `is_user` varchar(30) DEFAULT 'ADMIN';--> statement-breakpoint
ALTER TABLE `students` MODIFY COLUMN `is_user` varchar(30) DEFAULT 'STUDENT';--> statement-breakpoint
ALTER TABLE `teachers` MODIFY COLUMN `is_user` varchar(30) DEFAULT 'TEACHER';