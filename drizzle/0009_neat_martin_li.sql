CREATE TABLE `scadenze` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`practice_id` integer NOT NULL,
	`descrizione` text NOT NULL,
	`data_scadenza` text NOT NULL,
	`completata` integer DEFAULT false NOT NULL,
	`completata_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action
);
