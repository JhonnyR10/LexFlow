CREATE TABLE `collaboratori` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`cognome` text NOT NULL,
	`denominazione` text NOT NULL,
	`codice_interno` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL
);
