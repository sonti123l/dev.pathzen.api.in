ALTER TABLE `admin` DROP FOREIGN KEY `admin_admin_refresh_token_users_refresh_token_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_student_refresh_token_users_refresh_token_fk`;
--> statement-breakpoint
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_teacher_refresh_token_users_refresh_token_fk`;
--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_refresh_token_users_refresh_token_fk` FOREIGN KEY (`admin_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_refresh_token_users_refresh_token_fk` FOREIGN KEY (`student_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_refresh_token_users_refresh_token_fk` FOREIGN KEY (`teacher_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE cascade ON UPDATE cascade;