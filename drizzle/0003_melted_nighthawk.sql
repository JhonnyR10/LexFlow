CREATE TABLE `practices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codice_istanza` text NOT NULL,
	`nome_istanza` text NOT NULL,
	`collaboratore_id` integer,
	`professionista_id` integer,
	`tipologia_attivita` text,
	`data_udienza` text,
	`competenza` text,
	`autorita_giudiziaria` text,
	`data_deposito` text,
	`modalita_deposito` text,
	`importo_richiesto` real,
	`note` text,
	`current_phase_id` integer NOT NULL,
	`previous_phase_id` integer,
	`custom_values` text DEFAULT '{}' NOT NULL,
	`is_trashed` integer DEFAULT false NOT NULL,
	`trashed_at` text,
	`trash_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`collaboratore_id`) REFERENCES `collaboratori`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`professionista_id`) REFERENCES `professionisti`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`previous_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `practices_codice_istanza_unique` ON `practices` (`codice_istanza`);--> statement-breakpoint
ALTER TABLE `app_settings` ADD `sigla_codice` text DEFAULT 'NP' NOT NULL;