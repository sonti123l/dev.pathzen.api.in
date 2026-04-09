CREATE TABLE `domains` (
	`domain_id` int AUTO_INCREMENT NOT NULL,
	`domain_name` varchar(255) NOT NULL,
	CONSTRAINT `domains_domain_id` PRIMARY KEY(`domain_id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `field_id` int;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_field_id_domains_domain_id_fk` FOREIGN KEY (`field_id`) REFERENCES `domains`(`domain_id`) ON DELETE no action ON UPDATE no action;