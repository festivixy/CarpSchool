import { Meteor } from "meteor/meteor";
import { Rides } from "../../api/ride/Rides";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Captcha } from "../../api/captcha/Captcha";

/* eslint-disable no-console */

async function createUser(email, firstName, lastName, password, role) {
    const captchaSessionId = await Captcha.insertAsync({
        text: "dummy-captcha-text",
        timestamp: Date.now(),
        solved: true,
        used: false,
    });
    console.log(`  Created dummy captcha session ID: ${captchaSessionId}`);
    console.log(`  Creating user ${email}.`);
    const userID = Accounts.createUser({
        username: email,
        profile: {
            firstName: firstName,
            lastName: lastName,
            captchaSessionId: captchaSessionId,
        },
        email: email,
        password: password,
        captchaSessionId: captchaSessionId,
    });
    if (role === "admin") {
        console.log(`  Assigning admin role to user ${email} with ID ${userID}`);
        // Add admin role directly to user document
        await Meteor.users.updateAsync(userID, {
            $addToSet: { roles: ["admin"] },
        });
        console.log(`  Admin role assignment completed for user ${email}`);
    }
}

async function addRide(data) {
    console.log(`  Adding: Ride from ${data.driver} `);
    await Rides.insertAsync(data);
}

/** When running app for first time, pass a settings file to set up a default user account. */
Meteor.startup(async () => {
    if ((await Meteor.users.find().countAsync()) === 0) {
        if (Meteor.settings.defaultAccounts) {
            console.log("Creating the default user(s)");
            for (const { email, firstName, lastName, password, role } of Meteor  // eslint-disable-line
                .settings.defaultAccounts) {
                await createUser(email, firstName, lastName, password, role);
            }
        } else {
            console.log(
                "Cannot initialize the database!  Please invoke meteor with a settings file.",
            );
        }
    }
    if (await Rides.find().countAsync() === 0) {
        if (Meteor.settings.defaultRides) {
            console.log("Creating default rides.");
            // eslint-disable-next-line no-restricted-syntax
            for (const data of Meteor.settings.defaultRides) {
                // eslint-disable-next-line no-await-in-loop
                await addRide(data);
            }
        }
    }
});
