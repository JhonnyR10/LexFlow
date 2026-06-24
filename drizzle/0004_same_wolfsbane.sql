CREATE TABLE `history_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`practice_id` integer NOT NULL,
	`timestamp` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`from_phase_id` integer,
	`to_phase_id` integer,
	`note` text,
	`payload` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pec_recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`practice_id` integer NOT NULL,
	`transition_record_id` integer,
	`contesto` text DEFAULT 'deposito' NOT NULL,
	`indirizzo` text NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action
);
