ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_refresh_token_unique` UNIQUE(`admin_refresh_token`);--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_refresh_token_unique` UNIQUE(`student_refresh_token`);--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_refresh_token_unique` UNIQUE(`teacher_refresh_token`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_refresh_token_unique` UNIQUE(`refresh_token`);