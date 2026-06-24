CREATE TABLE `professionisti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`cognome` text NOT NULL,
	`denominazione` text NOT NULL,
	`codice_fiscale` text,
	`email` text,
	`pec` text,
	`telefono` text,
	`ruolo` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL
);
