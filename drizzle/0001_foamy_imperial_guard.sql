CREATE TABLE `modules` (
	`module_id` int AUTO_INCREMENT NOT NULL,
	`module_name` varchar(255) NOT NULL,
	`course_id_for_module` int,
	`is_module_complete` boolean DEFAULT false,
	CONSTRAINT `modules_module_id` PRIMARY KEY(`module_id`)
);
--> statement-breakpoint
CREATE TABLE `subModules` (
	`sub_module_id` int AUTO_INCREMENT NOT NULL,
	`sub_module_title` varchar(255) NOT NULL,
	`is_sub_module_completed` boolean DEFAULT false,
	`sub_module_in_module_id` int,
	CONSTRAINT `subModules_sub_module_id` PRIMARY KEY(`sub_module_id`)
);
--> statement-breakpoint
ALTER TABLE `modules` ADD CONSTRAINT `modules_course_id_for_module_courses_course_id_fk` FOREIGN KEY (`course_id_for_module`) REFERENCES `courses`(`course_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `subModules` ADD CONSTRAINT `subModules_sub_module_in_module_id_modules_module_id_fk` FOREIGN KEY (`sub_module_in_module_id`) REFERENCES `modules`(`module_id`) ON DELETE cascade ON UPDATE cascade;