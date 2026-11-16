import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`image_size\` text DEFAULT 'side';`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_image_size\` text DEFAULT 'side';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`image_size\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_image_size\`;`)
}
