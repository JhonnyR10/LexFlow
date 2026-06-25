CREATE TABLE `transition_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`practice_id` integer NOT NULL,
	`transition_id` integer NOT NULL,
	`from_phase_id` integer NOT NULL,
	`to_phase_id` integer,
	`recorded_at` text NOT NULL,
	`values` text DEFAULT '{}' NOT NULL,
	`note` text,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transition_id`) REFERENCES `transitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action
);
