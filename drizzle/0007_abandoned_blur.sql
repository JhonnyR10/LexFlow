CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`practice_id` integer NOT NULL,
	`transition_record_id` integer,
	`kind` text NOT NULL,
	`file_path` text NOT NULL,
	`original_name` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transition_record_id`) REFERENCES `transition_records`(`id`) ON UPDATE no action ON DELETE no action
);
