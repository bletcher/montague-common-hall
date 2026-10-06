# montaguecommonhall.org

Website for the [Montague Common Hall](https://montaguecommonhall.org), a volunteer-run community
center and performing arts space in a historic 1834 meetinghouse in Montague Center, Massachusetts,
maintained by the Friends of the Montague Common Hall, a 501(c)(3) nonprofit.

Built with [Payload CMS](https://payloadcms.com) and Next.js, running on Cloudflare Workers with
D1 and R2. Events come from the hall's Google Calendar; donations go through Givebutter.

```sh
npm ci
cp .env.example .env   # set PAYLOAD_SECRET
npx payload migrate
npm run seed
npm run dev            # http://localhost:3000 — admin at /admin
```

Everything else — deploys, secrets, backups, the content model, and the DNS cutover — is in
[RUNBOOK.md](RUNBOOK.md).
