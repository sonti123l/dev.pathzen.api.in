CREATE TABLE `admin` (
	`admin_id` int AUTO_INCREMENT NOT NULL,
	`admin_name` varchar(100) NOT NULL,
	`admin_mail` varchar(255) NOT NULL,
	`admin_password` varchar(255) NOT NULL,
	`admin_user_id` int,
	CONSTRAINT `admin_admin_id` PRIMARY KEY(`admin_id`),
	CONSTRAINT `admin_admin_mail_unique` UNIQUE(`admin_mail`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`college_name` varchar(255) NOT NULL,
	`college_address` varchar(255) NOT NULL,
	CONSTRAINT `colleges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`course_id` int AUTO_INCREMENT NOT NULL,
	`course_name` varchar(255) NOT NULL,
	`course_meta_data` json,
	`course_created_at` timestamp NOT NULL DEFAULT (now()),
	`course_progress` int NOT NULL DEFAULT 0,
	`field_id` int,
	CONSTRAINT `courses_course_id` PRIMARY KEY(`course_id`)
);
--> statement-breakpoint
CREATE TABLE `domains` (
	`domain_id` int AUTO_INCREMENT NOT NULL,
	`domain_name` varchar(255) NOT NULL,
	CONSTRAINT `domains_domain_id` PRIMARY KEY(`domain_id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`module_id` int AUTO_INCREMENT NOT NULL,
	`module_name` varchar(255) NOT NULL,
	`course_id_for_module` int,
	`is_module_complete` boolean DEFAULT false,
	CONSTRAINT `modules_module_id` PRIMARY KEY(`module_id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`room_id` int AUTO_INCREMENT NOT NULL,
	CONSTRAINT `rooms_room_id` PRIMARY KEY(`room_id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_name` varchar(50) NOT NULL,
	`student_email_id` varchar(255) NOT NULL,
	`student_password` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`branch_name` varchar(255) NOT NULL,
	`student_roll_no` int NOT NULL,
	`student_college_id` int,
	`student_id` int,
	`student_course_id` int,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_student_email_id_unique` UNIQUE(`student_email_id`)
);
--> statement-breakpoint
CREATE TABLE `subModules` (
	`sub_module_id` int AUTO_INCREMENT NOT NULL,
	`sub_module_title` varchar(255) NOT NULL,
	`is_sub_module_completed` boolean DEFAULT false,
	`live_time` varchar(30),
	`live_date` date,
	`sub_module_in_module_id` int,
	CONSTRAINT `subModules_sub_module_id` PRIMARY KEY(`sub_module_id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`teacher_id` int AUTO_INCREMENT NOT NULL,
	`teacher_name` varchar(100) NOT NULL,
	`teacher_email_id` varchar(255) NOT NULL,
	`teacher_password` varchar(255) NOT NULL,
	`teacher_course_id` int,
	`teacher_experience` varchar(30) NOT NULL,
	`teacher_technicalities` json NOT NULL,
	`teacher_user_id` int,
	CONSTRAINT `teachers_teacher_id` PRIMARY KEY(`teacher_id`),
	CONSTRAINT `teachers_teacher_email_id_unique` UNIQUE(`teacher_email_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`refresh_token` varchar(400),
	`user_email` varchar(255) NOT NULL,
	`user_password` varchar(255) NOT NULL,
	`role` enum('STUDENT','TEACHER','ADMIN') DEFAULT null,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_refresh_token_unique` UNIQUE(`refresh_token`),
	CONSTRAINT `users_user_email_unique` UNIQUE(`user_email`)
);
--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_admin_user_id_users_user_id_fk` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_field_id_domains_domain_id_fk` FOREIGN KEY (`field_id`) REFERENCES `domains`(`domain_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modules` ADD CONSTRAINT `modules_course_id_for_module_courses_course_id_fk` FOREIGN KEY (`course_id_for_module`) REFERENCES `courses`(`course_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_college_id_colleges_id_fk` FOREIGN KEY (`student_college_id`) REFERENCES `colleges`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_id_users_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_student_course_id_courses_course_id_fk` FOREIGN KEY (`student_course_id`) REFERENCES `courses`(`course_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `subModules` ADD CONSTRAINT `subModules_sub_module_in_module_id_modules_module_id_fk` FOREIGN KEY (`sub_module_in_module_id`) REFERENCES `modules`(`module_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_course_id_courses_course_id_fk` FOREIGN KEY (`teacher_course_id`) REFERENCES `courses`(`course_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacher_user_id_users_user_id_fk` FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;