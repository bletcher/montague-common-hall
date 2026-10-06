# Runbook — montaguecommonhall.org

For the people who maintain the site's code. Board members who only edit content need the
**board guide** (to come), not this file.

## How the pieces fit

| Piece | Where | Who changes it |
| --- | --- | --- |
| Website and admin panel | This repo → Cloudflare Worker `montague-common-hall` | Maintainers, through pull requests |
| Content (pages, news, rates, photos, inquiries) | Cloudflare D1 database `montague-common-hall`, files in R2 bucket `montague-common-hall-media` | Board members, at `/admin` |
| Events | The hall's public Google Calendar | Board members, in Google Calendar |
| Donations and newsletter | Givebutter | Treasurer / board |
| Mailboxes (`info@`) | Google Workspace for Nonprofits | Workspace admin |
| Website email (form notifications) | Resend, sending from `mail.montaguecommonhall.org` | Maintainers |
| Domain registration | Namecheap (board member's account) | Board |
| DNS | Cloudflare (after cutover) | Maintainers |
| Backups | R2 bucket `montague-common-hall-backups`, nightly | Automatic |

Content edits never need a deploy. Code changes deploy automatically when merged to `main`.

## Local development

```sh
npm ci
cp .env.example .env          # then set PAYLOAD_SECRET to a long random string
npx payload migrate           # builds the local database from src/migrations
npm run seed                  # loads the starting content; creates admin@localhost.test / local-dev-only
npm run dev                   # http://localhost:3000, admin at /admin
```

The local database lives in `.wrangler/state/` (not committed). Delete that folder to start over.
Without API keys the site shows sample calendar events, uses Cloudflare's always-pass spam-check
keys, and prints emails to the console.

## Changing the content model (collections, globals, fields)

The database is only ever changed through migration files, locally and in production
(`push: false` in `src/payload.config.ts`).

1. Edit the collection or global in `src/collections/` or `src/globals/`.
2. `npm run payload migrate:create <short_name>` — writes a file to `src/migrations/`.
3. `npx payload migrate` — applies it to your local database.
4. `npm run generate:types:payload` — refreshes `src/payload-types.ts`.
5. Commit all of it. CI fails if a field change has no matching migration.

Production applies pending migrations at the start of every deploy, before the new code goes live.
Prefer additive changes (new optional fields). Renaming or removing a field drops its data —
take a manual backup first (below).

**Read every generated migration before committing it.** If it contains `CREATE TABLE __new_…`
followed by `DROP TABLE`, it is rebuilding a table. On D1, dropping a table that other tables
point at (arrays, blocks, relationships) can cascade and **delete their rows** — e.g. rebuilding
`rentals` would wipe the rates, FAQ, and documents. Changing `required`, `defaultValue`, or
removing a field with a relationship all trigger rebuilds. Instead, leave the old field in place
with `admin: { hidden: true }` (see `src/globals/Rentals.ts`), or write the migration by hand.

Data-only changes (creating starting content) can be hand-written migrations too; see
`src/migrations/20261006_220000_system_pages.ts`. Add them to `src/migrations/index.ts`.

## Pages the board can edit

Every page except Home is a document under **Pages** in the admin panel. On Rent the Hall,
Calendar, Donate, News, and Contact the page text appears first and the code adds the rates,
calendar, donation button, news list, or form below it. The pages listed in
`src/lib/system-pages.ts` can't be deleted or have their web address changed, because the menu
links to them. New pages the board creates appear at `/<slug>` but aren't added to the menu
automatically — the menu is in `src/components/Header.tsx`.

## Checks before merging

CI runs on every pull request: type check, lint, the migration check, and a full Worker build.
To run the same build locally without a Cloudflare account:

```sh
CLOUDFLARE_REMOTE_BINDINGS=false npx opennextjs-cloudflare build
npx wrangler dev --local       # serves the built Worker at http://localhost:8787 on the local database
```

**Always pass `--local` to `wrangler dev`.** The database and media bindings in `wrangler.jsonc`
are marked `"remote": true` so that production builds, migrations, and the seed reach the live
database. Without `--local`, `wrangler dev` would read and write the live database too.
(`npm run dev` is always local.)

### Running something against production from your machine

Needs `npx wrangler login` with access to the hall's account. Example — apply migrations:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID='ce00c647d63be3f4c32067841fa63003'; $env:NODE_ENV='production'; $env:PAYLOAD_SECRET='ignore'
npx payload migrate
Remove-Item Env:NODE_ENV, Env:PAYLOAD_SECRET
```

## One-time Cloudflare setup

Done once, by a maintainer, with the hall's Cloudflare account (log in with an organizational
address, two-factor on, at least two board members as members of the account).

1. **Workers Paid plan** ($5/month): Workers & Pages → Plans. The admin panel exceeds the free
   plan's 10 ms CPU limit.
2. **Create the database and buckets** (after `npx wrangler login`):
   ```sh
   npx wrangler d1 create montague-common-hall          # copy the database_id into wrangler.jsonc
   npx wrangler r2 bucket create montague-common-hall-media
   npx wrangler r2 bucket create montague-common-hall-backups
   ```
3. **Worker secrets** (runtime values, never in the repo):
   ```sh
   npx wrangler secret put PAYLOAD_SECRET           # same value as the GitHub secret
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put GOOGLE_CALENDAR_API_KEY
   npx wrangler secret put RESEND_API_KEY
   ```
   Secrets can be set only after the first deploy has created the Worker; set them, then re-run
   the Deploy workflow.
4. **API token for GitHub**: My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"
   template, then add **D1: Edit** and **Workers R2 Storage: Edit**. Scope it to the hall's account.

## GitHub settings

Settings → Secrets and variables → Actions.

| Name | Kind | Value |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret | Token from step 4 above |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare dashboard → Workers & Pages → Account ID |
| `PAYLOAD_SECRET` | Secret | Long random string; same as the Worker secret. Changing it logs everyone out. |
| `SITE_URL` | Variable | `https://montague-common-hall.<subdomain>.workers.dev` until cutover, then `https://montaguecommonhall.org` |
| `TURNSTILE_SITE_KEY` | Variable | Cloudflare → Turnstile → the site's **site key** (public) |
| `DEPLOY_ENABLED` | Variable | `true` once everything above exists. Until then, Deploy and Backup skip. |

The Deploy job uses the `production` environment; GitHub creates it on first run. Add a
required reviewer there if you want a human to approve each deploy.

## Third-party keys

- **Turnstile** (spam protection): Cloudflare → Turnstile → Add site. Hostnames: the workers.dev
  address now, `montaguecommonhall.org` at cutover. Site key → GitHub variable; secret key →
  Worker secret.
- **Google Calendar**: in the hall's Google account, Google Cloud Console → new project →
  enable "Google Calendar API" → Credentials → API key, restricted to the Calendar API. → Worker
  secret. Then make the hall calendar public and paste its Calendar ID into
  `/admin` → Site settings → Calendar.
- **Givebutter**: Account ID and campaign code go into `/admin` → Site settings → Donations.
- **Resend**: add domain `mail.montaguecommonhall.org`, put its DNS records in Cloudflare, create an
  API key with send-only access → Worker secret. Needs DNS on Cloudflare, so this happens at cutover.

## Patched dependency: Payload password hashing

`patches/payload+3.90.2.patch` lowers Payload's password-hashing work factor (PBKDF2) from 600,000
to 100,000 iterations, because Cloudflare Workers refuse anything higher and every login and signup
fails otherwise ([payload#18274](https://github.com/payloadcms/payload/issues/18274)). Approved by
the board in October 2026. `npm install` / `npm ci` re-apply it automatically (`postinstall`).

When upgrading Payload:

- If the install fails with "patch-package: failed to apply", Payload changed that file. Check
  whether the release includes the Workers fix (PR #18276) before deleting the patch.
- **Never** let the count go back to 600,000 while users exist. Their stored passwords were made at
  100,000, so every board member would be locked out.
- Create users through the admin panel, not `payload run` scripts, so hashing happens the same way.

Use long, unique passwords from a password manager; that matters far more than the iteration count.

## Backups and restore

- **Nightly**: the Backup workflow exports the database to
  `montague-common-hall-backups/db/db-YYYY-MM-DD.sql.gz`. Backups are deliberately not workflow
  artifacts: the repo is public and the database contains personal information.
- **Point in time**: D1 Time Travel can restore the database to any minute in the last 30 days:
  `npx wrangler d1 time-travel restore montague-common-hall --timestamp=<ISO time>`.
- **Manual backup before a risky change**:
  `npx wrangler d1 export montague-common-hall --remote --output backup.sql`
- Uploaded photos and PDFs live in R2 and aren't touched by deploys.

## Rolling back a bad deploy

Cloudflare dashboard → Workers → `montague-common-hall` → Deployments → pick the previous version →
Rollback. Or `npx wrangler rollback`. Then revert the commit on `main`. Rolling back code doesn't undo
a migration; if the migration was the problem, restore the database with Time Travel.

## Cutover checklist (moving montaguecommonhall.org)

Order matters. WebWorks takes down the old site once DNS moves.

1. Add `montaguecommonhall.org` to Cloudflare (don't change nameservers yet). Check the imported
   records against the old ones: `A 38.147.104.123`, `MX 10 mail.montaguewebworks.com`, and the
   SPF `TXT`.
2. Google Workspace approved; mailboxes created; old mail migrated from WebWorks with Workspace's
   data migration tool and checked.
3. In Cloudflare DNS: Workspace MX records, Workspace SPF/DKIM, Resend's records for `mail.`, and
   `_dmarc` set to `v=DMARC1; p=none; rua=mailto:info@montaguecommonhall.org`.
4. Attach the custom domain to the Worker (Workers → montague-common-hall → Settings → Domains).
   Update `SITE_URL` and the Turnstile hostnames.
5. In Namecheap, switch nameservers to the two Cloudflare ones. Quiet weeknight; not between
   Nov 23 and Jan 4.
6. Check: the site loads over HTTPS; old addresses redirect (`/p/53/x` → `/rent`); a test rental
   request arrives in `info@`; mail to and from `info@` works; Givebutter test gift.
7. Submit `https://montaguecommonhall.org/sitemap.xml` in Google Search Console *(sitemap to be added)*.
8. Tell WebWorks they can retire the old site and mail server.

## Where things are in the code

| Path | What |
| --- | --- |
| `src/collections/`, `src/globals/` | Content model (what board members edit) |
| `src/access.ts` | Who can do what: editors vs admins |
| `src/app/(frontend)/` | Public pages; `actions.ts` handles the three forms |
| `src/lib/calendar.ts` | Google Calendar reading and date formatting (America/New_York) |
| `src/lib/email.ts`, `src/lib/turnstile.ts` | Resend and spam check |
| `next.config.ts` | Redirects from old RocketFusion addresses |
| `src/seed/` | Starting content carried over from the old site |
| `archive/old-site/` | Files and photos downloaded from the old site, Oct 2026 |
