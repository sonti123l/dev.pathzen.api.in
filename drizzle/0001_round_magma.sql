ALTER TABLE `admin` DROP FOREIGN KEY `admin_is_user_users_role_fk`;
--> statement-breakpoint
ALTER TABLE `admin` DROP FOREIGN KEY `admin_admin_user_id_users_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_student_college_id_colleges_id_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_student_id_users_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `students` DROP FOREIGN KEY `students_student_course_id_courses_course_id_fk`;
--> statement-breakpoint
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_is_user_users_role_fk`;
--> statement-breakpoint
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_teacher_user_id_users_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_is_user_users_role_fk` FOREIGN KEY (`is_user`) REFERENCES `users`(`role`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_user_id_users_user_id_fk` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_college_id_colleges_id_fk` FOREIGN KEY (`student_college_id`) REFERENCES `colleges`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_id_users_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_course_id_courses_course_id_fk` FOREIGN KEY (`student_course_id`) REFERENCES `courses`(`course_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_is_user_users_role_fk` FOREIGN KEY (`is_user`) REFERENCES `users`(`role`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_user_id_users_user_id_fk` FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;