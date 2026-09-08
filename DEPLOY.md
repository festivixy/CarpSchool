# Deploying CarpSchool

Target stack for a fresh start (no data to migrate):

- **MongoDB Atlas** (free M0) — the database
- **Railway** — runs the app container (Render or Fly.io work the same way)
- **Cloudflare** — DNS and TLS for `carpschool.com`
- **Clerk** — authentication (your own application)
- **OneSignal** — push notifications (optional at launch)
- **Persona** — ID verification (optional at launch)

Everything is configured through environment variables, so there is no
settings file to mount. Where this guide says "set X", it means add an
environment variable in Railway's dashboard.

---

## 1. Database — MongoDB Atlas

1. Create an account at mongodb.com/atlas and a free **M0** cluster.
2. **Database Access** → add a database user with a strong password. Note the
   username and password.
3. **Network Access** → add `0.0.0.0/0` (Railway's egress IPs are not fixed).
   Atlas still requires the user credentials, so this is not open access.
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/carpool?retryWrites=true&w=majority
   ```
   Put `carpool` (or any name) as the database in the path. This is `MONGO_URL`.

## 2. Authentication — Clerk

1. Create an application at clerk.com. Choose Email + Google/Microsoft to match
   the current sign-in options.
2. From **API Keys**, copy:
   - Publishable key (`pk_live_...` for production) → goes in settings `public.clerk.publishableKey`
   - Secret key (`sk_live_...`) → `CLERK_SECRET_KEY`
3. In Clerk **Paths / Redirects**, set the app domain to `https://carpschool.com`.

## 3. Push and ID verification (optional at launch)

- **OneSignal**: create a Web Push app, note the App ID and REST API key.
- **Persona**: create an inquiry template, note the template/environment ids and
  a webhook secret. Point the webhook at `https://carpschool.com/webhooks/persona`.

You can launch without these; sign-in and rides work. Add them later.

## 4. Build the settings JSON

The app reads its config from the `METEOR_SETTINGS` environment variable (a JSON
string). Start from `config/settings.production.json.example`, fill in your keys,
and paste the whole thing as one environment variable. Minimum to launch:

```json
{
  "public": {
    "clerk": { "publishableKey": "pk_live_..." },
    "map": {
      "tileServerUrl": "https://tile.openstreetmap.org",
      "tileStylePath": "",
      "nominatimUrl": "https://nominatim.openstreetmap.org",
      "osrmUrl": "https://router.project-osrm.org"
    }
  },
  "private": {
    "clerk": { "secretKey": "sk_live_..." },
    "adminEmails": ["iscurt.w@gmail.com"],
    "persona": { "webhookSecret": "whsec_..." }
  }
}
```

Note: the OpenStreetMap map endpoints above are for **bring-it-up-quickly only**.
Their usage policy forbids production traffic and will block your server's IP
under load. Before real users, move to a keyed tile/geocode/route provider
(MapTiler, Stadia, Thunderforest) or self-host the stack — the endpoints are a
config change in `public.map`, no code change.

## 5. Deploy on Railway

1. Push this repo to GitHub (done: `festivixy/CarpSchool`).
2. railway.app → **New Project** → **Deploy from GitHub repo** → pick
   `CarpSchool`, branch `redesign/paper-ink-rollout` (or merge it to `main`
   first and deploy `main`).
3. Railway detects the root `Dockerfile` and builds it. No build config needed.
4. **Variables** — add:
   | Variable | Value |
   |---|---|
   | `MONGO_URL` | the Atlas connection string from step 1 |
   | `ROOT_URL` | `https://carpschool.com` |
   | `METEOR_SETTINGS` | the JSON from step 4, as one line |
   | `NODE_ENV` | `production` |
   | `CLERK_SECRET_KEY` | `sk_live_...` (also in settings; env is the fallback) |
   | `PERSONA_WEBHOOK_SECRET` | `whsec_...` (if using Persona) |
   | `PORT` | leave unset — Railway injects it |
   | `MAIL_URL` | your SMTP URL, if you want the app to send email |
5. Deploy. Watch the logs for `Starting meteor app on port` and the health check
   passing. Railway gives you a `*.up.railway.app` URL — open it to confirm.

The app seeds nothing in production (seeding is gated to development), so the
first real account you create through sign-up becomes a normal user. Your
`adminEmails` entry is granted system admin and an approved profile on first
login automatically.

## 6. Point carpschool.com at it (Cloudflare)

1. Add `carpschool.com` to Cloudflare (Add a Site), update the nameservers at
   your registrar to the two Cloudflare gives you.
2. In Railway → **Settings** → **Domains** → add `carpschool.com`; Railway shows
   a `CNAME` target.
3. In Cloudflare **DNS**, add a `CNAME` record: name `@` (or `www`) →
   the Railway target, **Proxied** (orange cloud). Cloudflare handles TLS.
4. Set Cloudflare **SSL/TLS** mode to **Full (strict)**.
5. Update `ROOT_URL` in Railway to `https://carpschool.com` and redeploy, and
   set the same domain in Clerk.

## 7. First-run checklist

- Sign in with `iscurt.w@gmail.com` → you are system admin with an approved
  profile. Open `/admin/overview`.
- Create a school in the admin schools screen (or seed one) so new users can be
  assigned by email domain.
- Verify a test sign-up: register `iscurt.w+test1@gmail.com`, walk onboarding,
  approve it from `/admin/pending-users`.

## Notes

- **Backups**: Atlas M0 has limited backup; enable snapshots when you move to a
  paid tier before real users.
- **Map provider**: replace the OSM endpoints (section 4) before launch.
- **Rotate** the old Clerk secret that was in the previous repo's history — it is
  not used by this deploy, but should be revoked in the old owner's Clerk account
  if you ever gain access, or simply left dead since you use your own Clerk app.
- **Email**: without `MAIL_URL`, password-reset and school-email verification
  emails will not send; Clerk handles the primary auth emails itself.
