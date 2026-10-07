import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`street_address\` text DEFAULT '34 Main Street, Montague Center, MA 01351' NOT NULL,
  	\`mailing_address\` text DEFAULT 'PO Box 223, Montague, MA 01351' NOT NULL,
  	\`email\` text DEFAULT 'info@montaguecommonhall.org' NOT NULL,
  	\`notification_email\` text DEFAULT 'info@montaguecommonhall.org' NOT NULL,
  	\`facebook_url\` text DEFAULT 'https://www.facebook.com/MontagueCommonHall/',
  	\`map_url\` text DEFAULT 'https://maps.app.goo.gl/1Y94fMWp59Ld51Ez7',
  	\`google_calendar_id\` text,
  	\`donate_url\` text,
  	\`givebutter_account_id\` text,
  	\`givebutter_campaign_code\` text,
  	\`announcement_on\` integer,
  	\`announcement_text\` text,
  	\`announcement_link\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "street_address", "mailing_address", "email", "notification_email", "facebook_url", "map_url", "google_calendar_id", "donate_url", "givebutter_account_id", "givebutter_campaign_code", "announcement_on", "announcement_text", "announcement_link", "updated_at", "created_at") SELECT "id", "street_address", "mailing_address", "email", "notification_email", "facebook_url", "map_url", "google_calendar_id", "donate_url", "givebutter_account_id", "givebutter_campaign_code", "announcement_on", "announcement_text", "announcement_link", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`street_address\` text DEFAULT '34 Main Street, Montague Center, MA 01351' NOT NULL,
  	\`mailing_address\` text DEFAULT 'PO Box 223, Montague, MA 01351' NOT NULL,
  	\`email\` text DEFAULT 'info@montaguecommonhall.org' NOT NULL,
  	\`notification_email\` text DEFAULT 'info@montaguecommonhall.org' NOT NULL,
  	\`facebook_url\` text DEFAULT 'https://www.facebook.com/MontagueCommonHall/',
  	\`map_url\` text DEFAULT 'https://goo.gl/maps/eC3YADHxsNxE6qqb7',
  	\`google_calendar_id\` text,
  	\`donate_url\` text,
  	\`givebutter_account_id\` text,
  	\`givebutter_campaign_code\` text,
  	\`announcement_on\` integer,
  	\`announcement_text\` text,
  	\`announcement_link\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "street_address", "mailing_address", "email", "notification_email", "facebook_url", "map_url", "google_calendar_id", "donate_url", "givebutter_account_id", "givebutter_campaign_code", "announcement_on", "announcement_text", "announcement_link", "updated_at", "created_at") SELECT "id", "street_address", "mailing_address", "email", "notification_email", "facebook_url", "map_url", "google_calendar_id", "donate_url", "givebutter_account_id", "givebutter_campaign_code", "announcement_on", "announcement_text", "announcement_link", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
