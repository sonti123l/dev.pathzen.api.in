ALTER TABLE `admin` ADD `admin_refresh_token` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `student_refresh_token` varchar(400) NOT NULL;--> statement-breakpoint
ALTER TABLE `teachers` ADD `teacher_refresh_token` varchar(400) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `refresh_token` varchar(400) NOT NULL;--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_refresh_token_users_refresh_token_fk` FOREIGN KEY (`admin_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_refresh_token_users_refresh_token_fk` FOREIGN KEY (`student_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_refresh_token_users_refresh_token_fk` FOREIGN KEY (`teacher_refresh_token`) REFERENCES `users`(`refresh_token`) ON DELETE no action ON UPDATE no action;