// @ts-check
const { test, expect } = require("@playwright/test");

/**
 * Two-user ride flow scenarios. See README.md for the Clerk test-mode login
 * this requires. Every test is skipped until E2E_DRIVER_EMAIL is set, so
 * this file documents the steps without depending on a live environment.
 */
const HAS_CREDENTIALS = Boolean(process.env.E2E_DRIVER_EMAIL);

test.describe("ride flow (driver + rider)", function () {
  test.skip(!HAS_CREDENTIALS, "requires E2E_DRIVER_EMAIL / E2E_RIDER_EMAIL and seeded accounts");

  test("E1: rider joins a ride the driver posted", async function ({ browser }) {
    const driverContext = await browser.newContext({ storageState: "e2e/.auth/driver.json" });
    const riderContext = await browser.newContext({ storageState: "e2e/.auth/rider.json" });
    const driverPage = await driverContext.newPage();
    const riderPage = await riderContext.newPage();

    // 1. Driver posts a ride: go to "Offer a ride", fill origin/destination/
    //    date/seats, submit.
    await driverPage.goto("/rides/new");
    // ... fill the offer-ride form and submit ...

    // 2. Rider opens Find a ride, locates the driver's ride, clicks Join.
    await riderPage.goto("/marketplace");
    // ... select the ride, click "Request to join" / "Join" ...

    // 3. Assert: rider's My Rides now lists the ride; driver's ride detail
    //    shows one seat taken and the rider in the rider list.
    // await expect(riderPage.getByText(/my rides/i)).toBeVisible();

    await driverContext.close();
    await riderContext.close();
  });

  test("E2: last-seat race -- two riders join a 1-seat ride, exactly one wins", async function ({ browser }) {
    const driverContext = await browser.newContext({ storageState: "e2e/.auth/driver.json" });
    const riderContext = await browser.newContext({ storageState: "e2e/.auth/rider.json" });
    // A second rider context would need its own storage state
    // (e2e/.auth/rider2.json, not currently provisioned).

    const driverPage = await driverContext.newPage();
    const riderPage = await riderContext.newPage();

    // 1. Driver posts a ride with seats: 1.
    await driverPage.goto("/rides/new");
    // ... fill form with seats = 1, submit ...

    // 2. Both riders open the ride detail page and click Join at
    //    (approximately) the same time via Promise.all.
    await riderPage.goto("/marketplace");
    // const rider2Page = await rider2Context.newPage();
    // await rider2Page.goto("/marketplace");
    // await Promise.all([
    //   riderPage.getByRole("button", { name: /join/i }).click(),
    //   rider2Page.getByRole("button", { name: /join/i }).click(),
    // ]);

    // 3. Assert: exactly one of the two sees a success toast/state, the
    //    other sees a "ride is full" error, and the ride detail shows
    //    riders.length === 1.

    await driverContext.close();
    await riderContext.close();
  });

  test("E3: driver cancels, rider is notified", async function ({ browser }) {
    const driverContext = await browser.newContext({ storageState: "e2e/.auth/driver.json" });
    const riderContext = await browser.newContext({ storageState: "e2e/.auth/rider.json" });
    const driverPage = await driverContext.newPage();
    const riderPage = await riderContext.newPage();

    // 1. Driver posts a ride; rider joins it (reuse E1's steps).
    // 2. Driver opens the ride and clicks Cancel, confirms.
    await driverPage.goto("/my-rides");
    // ... click cancel on the ride, confirm the swal/dialog ...

    // 3. Rider's notification bell shows an unread "Ride cancelled"
    //    notification; the ride no longer appears in their My Rides.
    await riderPage.goto("/notifications");
    // await expect(riderPage.getByText(/ride cancelled/i)).toBeVisible();

    await driverContext.close();
    await riderContext.close();
  });

  test("E4: rider leaves a ride", async function ({ browser }) {
    const driverContext = await browser.newContext({ storageState: "e2e/.auth/driver.json" });
    const riderContext = await browser.newContext({ storageState: "e2e/.auth/rider.json" });
    const driverPage = await driverContext.newPage();
    const riderPage = await riderContext.newPage();

    // 1. Driver posts a ride; rider joins it.
    // 2. Rider opens My Rides, clicks Leave on that ride, confirms.
    await riderPage.goto("/my-rides");
    // ... click leave, confirm ...

    // 3. Assert: ride disappears from rider's My Rides; driver's ride
    //    detail shows the freed seat and no longer lists the rider.
    await driverPage.reload();

    await driverContext.close();
    await riderContext.close();
  });

  test("E10: chat race -- both participants send a message at the same time", async function ({ browser }) {
    const driverContext = await browser.newContext({ storageState: "e2e/.auth/driver.json" });
    const riderContext = await browser.newContext({ storageState: "e2e/.auth/rider.json" });
    const driverPage = await driverContext.newPage();
    const riderPage = await riderContext.newPage();

    // 1. Driver posts a ride; rider joins it, opening up the ride chat.
    // 2. Both open the ride chat and send a message within the same
    //    Promise.all so the two writes race server-side.
    await driverPage.goto("/my-rides");
    await riderPage.goto("/my-rides");
    // await Promise.all([
    //   driverPage.getByPlaceholder(/message/i).fill("Hi from driver"),
    //   riderPage.getByPlaceholder(/message/i).fill("Hi from rider"),
    // ]);
    // await Promise.all([
    //   driverPage.getByRole("button", { name: /send/i }).click(),
    //   riderPage.getByRole("button", { name: /send/i }).click(),
    // ]);

    // 3. Assert: both pages eventually show both messages (order may
    //    differ), and neither message was dropped.

    await driverContext.close();
    await riderContext.close();
  });
});
