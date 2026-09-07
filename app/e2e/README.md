# E2E scaffold

Playwright tests for the two-user ride flows: join, last-seat race, cancel,
leave, and a chat-send race. This is a scaffold -- the specs are written out
step by step but `test.skip` until the environment below is provided, since
sign-in goes through Clerk and there is no seeded test account yet.

## Running

```
npm run test:e2e
```

Requires a Meteor dev server already running on `http://localhost:3001`
(`npm run dev` from `app/`, in another terminal -- this config does not start
one itself). Mongo runs on :3002 in that setup; Playwright does not touch
either directly, only the app's HTTP/websocket surface.

## Clerk test-mode login

The app authenticates through Clerk (`@clerk/clerk-react`), so a Playwright
run needs two real (or Clerk "test mode") accounts -- one per project in
`playwright.config.js` (`driver`, `rider`) -- and their storage state saved to
`e2e/.auth/driver.json` / `e2e/.auth/rider.json` so each project's tests start
already signed in.

Required env vars (not currently set anywhere in this repo):

- `E2E_DRIVER_EMAIL` / `E2E_DRIVER_PASSWORD`
- `E2E_RIDER_EMAIL` / `E2E_RIDER_PASSWORD`

Both accounts need an approved Profile (`verified: true`, `UserType: "Both"`)
at the same school, and that school needs at least one Place to build a route
from -- none of this is seeded by the scaffold; provision it against a real
or staging database before running.

A one-time setup project (not yet written) would sign in through Clerk's
hosted UI or test-mode API for each account and call
`page.context().storageState({ path: ... })` to produce the two JSON files
above. Until that exists and the env vars are set, every spec in
`ride-flow.spec.js` is skipped via `test.skip(!process.env.E2E_DRIVER_EMAIL, ...)`.

## Scenarios scaffolded in ride-flow.spec.js

- **E1** -- rider joins a ride the driver posted.
- **E2** -- last-seat race: two rider browser contexts hit "Join" on a
  1-seat ride at the same time; exactly one succeeds.
- **E3** -- driver cancels; rider sees a cancellation notification.
- **E4** -- rider leaves a ride; driver sees the seat freed.
- **E10** -- two riders in the same ride chat send a message at the same
  time; both messages land, in some order, with no lost write.
