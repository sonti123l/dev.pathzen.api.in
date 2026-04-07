CREATE TABLE `admin` (
	`admin_id` int NOT NULL,
	`admin_name` varchar(100) NOT NULL,
	`admin_mail` varchar(255) NOT NULL,
	`admin_password` varchar(255) NOT NULL,
	`is_user` varchar(50) DEFAULT 'ADMIN',
	`admin_user_id` int,
	CONSTRAINT `admin_admin_id` PRIMARY KEY(`admin_id`),
	CONSTRAINT `admin_admin_mail_unique` UNIQUE(`admin_mail`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` int NOT NULL,
	`college_name` varchar(255) NOT NULL,
	`college_address` varchar(255) NOT NULL,
	CONSTRAINT `colleges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`course_id` int NOT NULL,
	`course_name` varchar(255) NOT NULL,
	`course_meta_data` json NOT NULL,
	`course_created_at` timestamp,
	CONSTRAINT `courses_course_id` PRIMARY KEY(`course_id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_name` varchar(50) NOT NULL,
	`student_email_id` varchar(255) NOT NULL,
	`student_password` varchar(30) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`branch_name` varchar(255) NOT NULL,
	`student_college_id` int,
	`is_user` varchar(30) DEFAULT 'STUDENT',
	`student_id` int,
	`student_course_id` int,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_student_email_id_unique` UNIQUE(`student_email_id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`teacher_id` int NOT NULL,
	`teacher_name` varchar(100) NOT NULL,
	`teacher_email_id` varchar(255) NOT NULL,
	`teacher_password` varchar(255) NOT NULL,
	`teacher_course_id` int,
	`teacher_experience` varchar(30) NOT NULL,
	`teacher_technicalities` varchar(255) NOT NULL,
	`is_user` varchar(50) DEFAULT 'TEACHER',
	`teacher_user_id` int,
	CONSTRAINT `teachers_teacher_id` PRIMARY KEY(`teacher_id`),
	CONSTRAINT `teachers_teacher_email_id_unique` UNIQUE(`teacher_email_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`role` enum('ADMIN','TEACHER','STUDENT') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_is_user_users_role_fk` FOREIGN KEY (`is_user`) REFERENCES `users`(`role`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_user_id_users_user_id_fk` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_college_id_colleges_id_fk` FOREIGN KEY (`student_college_id`) REFERENCES `colleges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_is_user_users_role_fk` FOREIGN KEY (`is_user`) REFERENCES `users`(`role`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_id_users_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_course_id_courses_course_id_fk` FOREIGN KEY (`student_course_id`) REFERENCES `courses`(`course_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_course_id_courses_course_id_fk` FOREIGN KEY (`teacher_course_id`) REFERENCES `courses`(`course_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_is_user_users_role_fk` FOREIGN KEY (`is_user`) REFERENCES `users`(`role`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_user_id_users_user_id_fk` FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;