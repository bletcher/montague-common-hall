import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`tasks\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`done\` integer DEFAULT false,
  	\`owner\` text,
  	\`due\` text,
  	\`notes\` text,
  	\`completed_on\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`tasks_updated_at_idx\` ON \`tasks\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tasks_created_at_idx\` ON \`tasks\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`tasks_id\` integer REFERENCES tasks(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tasks_id_idx\` ON \`payload_locked_documents_rels\` (\`tasks_id\`);`)

  // Starting list: the open items for the move off WebWorks as of Nov 16, 2026. Plain SQL, so
  // later changes to the Tasks collection can't break this migration on a fresh database.
  const start: [string, string | null, string | null, string | null][] = [
    ['Confirm the domain moved to the hall’s Namecheap account', 'Lydia', null, null],
    ['Turn on auto-renew and add a payment method in the hall’s Namecheap account', null, '2027-02-01', 'The domain expires Feb 21, 2027.'],
    ['Get the full list of DNS records from Mik', 'Mik', null, null],
    ['Get the info@ password and IMAP server details from Mik', 'Mik', null, 'Needed to copy the old mail into Google Workspace.'],
    ['Get the mailing list (CSV) from the old site’s contacts', 'Mik', null, null],
    ['Ask Mik to keep the old site and info@ running for 30 days after the switch', 'Mik', null, null],
    ['Turn on 2-step verification for admin@', null, null, null],
    ['Make a second board member a Workspace super admin', null, null, null],
    ['Create info@ as a user in Google Workspace', null, null, 'Mail keeps going to WebWorks until the switch.'],
    ['Copy recent bookings from the old calendar into Google Calendar', null, null, 'Nov 20 birthday party; Dec 5 party now 9 am–10 pm; Dec 14 Bruce Molsky workshop and concert; delete the Nov 30 hold; Sawmill Run 2027 now 9 am–1 pm.'],
    ['Ask Montague Morris which weeks they practice', null, null, 'The old calendar lists every week; their note says September–March.'],
    ['Decide whether holds and private bookings show on the public calendar', null, null, null],
    ['Add montaguecommonhall.org to the hall’s Cloudflare account (Free plan)', null, null, null],
    ['Publish the Givebutter campaign, or add a donation link in Site settings', null, null, null],
    ['Review the wording on every page of the new site', null, null, null],
    ['Switch email to Google Workspace', null, '2027-01-05', null],
    ['Switch montaguecommonhall.org to the new site', null, '2027-01-05', null],
  ]
  for (const [title, owner, due, notes] of start) {
    await db.run(
      sql`INSERT INTO \`tasks\` (\`title\`, \`owner\`, \`due\`, \`notes\`, \`done\`) VALUES (${title}, ${owner}, ${due ? `${due}T17:00:00.000Z` : null}, ${notes}, 0);`,
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`tasks\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`news_id\` integer,
  	\`media_id\` integer,
  	\`rental_inquiries_id\` integer,
  	\`messages_id\` integer,
  	\`subscribers_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rental_inquiries_id\`) REFERENCES \`rental_inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`messages_id\`) REFERENCES \`messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`subscribers_id\`) REFERENCES \`subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "news_id", "media_id", "rental_inquiries_id", "messages_id", "subscribers_id", "users_id") SELECT "id", "order", "parent_id", "path", "pages_id", "news_id", "media_id", "rental_inquiries_id", "messages_id", "subscribers_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rental_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`rental_inquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}
