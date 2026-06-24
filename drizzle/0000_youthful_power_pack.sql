CREATE TABLE `phases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`display_name` text NOT NULL,
	`category` text NOT NULL,
	`is_initial` integer DEFAULT false NOT NULL,
	`is_final` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`order` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `phases_key_unique` ON `phases` (`key`);--> statement-breakpoint
CREATE TABLE `transitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_phase_id` integer NOT NULL,
	`to_phase_id` integer,
	`button_label` text NOT NULL,
	`order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_repeatable` integer DEFAULT false NOT NULL,
	`is_automatic` integer DEFAULT false NOT NULL,
	`is_resume` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`from_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transitions_from_label_idx` ON `transitions` (`from_phase_id`,`button_label`);--> statement-breakpoint
CREATE TABLE `field_defs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`phase_id` integer,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`required` integer DEFAULT false NOT NULL,
	`visible_in_table` integer DEFAULT false NOT NULL,
	`usable_in_filter` integer DEFAULT false NOT NULL,
	`include_in_export` integer DEFAULT false NOT NULL,
	`order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`menu_set_id` integer,
	FOREIGN KEY (`phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`menu_set_id`) REFERENCES `menu_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `menu_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_sets_key_unique` ON `menu_sets` (`key`);--> statement-breakpoint
CREATE TABLE `menu_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_set_id` integer NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`menu_set_id`) REFERENCES `menu_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_options_set_value_idx` ON `menu_options` (`menu_set_id`,`value`);--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`alerts_enabled` text NOT NULL,
	`alert_thresholds` text NOT NULL,
	`assistant` text NOT NULL,
	`data_path` text NOT NULL,
	`app_version` text NOT NULL,
	`backup` text NOT NULL,
	`security` text NOT NULL
);
