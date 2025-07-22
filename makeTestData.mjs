// Using ES6 named import from .mjs file
import { places } from "./app/imports/api/places/Places.mjs";

console.log("Available places:", places);

var template = {
  defaultAccounts: [
    {
      email: "admin@foo.com",
      firstName: "Admin",
      lastName: "User",
      password: "changeme",
      role: "admin",
    },
    {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      password: "password123",
    },
    {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Smith",
      password: "password123",
    },
    {
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Brown",
      password: "password123",
    },
    {
      email: "student1@uni.edu",
      firstName: "Emma",
      lastName: "Davis",
      password: "password123",
    },
    {
      email: "student2@uni.edu",
      firstName: "David",
      lastName: "Wilson",
      password: "password123",
    },
    {
      email: "student3@uni.edu",
      firstName: "Sarah",
      lastName: "Taylor",
      password: "password123",
    },
  ],
  defaultRides: [],
};

var defaultRidesTemplate = {
  driver: "admin@foo.com",
  riders: [],
  origin: "",
  destination: "",
  date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within next 30 days
  seats: 1,
  notes: "",
  createdAt: new Date(),
};

// Generate sample drivers
const sampleDrivers = [
  "admin@foo.com",
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
];
const sampleNotes = [
  "",
  "Please bring exact change",
  "Meeting at main entrance",
  "Picking up coffee on the way",
  "Space for luggage available",
  "Non-smoking vehicle",
];

for (let index = 0; index < 15; index++) {
  let defaultRides = Object.assign({}, defaultRidesTemplate);

  // Random origin and destination (ensure they're different)
  let originIndex = Math.floor(Math.random() * places.length);
  let destinationIndex;
  do {
    destinationIndex = Math.floor(Math.random() * places.length);
  } while (destinationIndex === originIndex);

  defaultRides.origin = places[originIndex];
  defaultRides.destination = places[destinationIndex];

  // Random driver
  defaultRides.driver =
    sampleDrivers[Math.floor(Math.random() * sampleDrivers.length)];

  // Random number of seats (1-4 most common)
  defaultRides.seats =
    Math.random() < 0.7
      ? Math.random() < 0.6
        ? 1
        : 2 // 70% chance of 1-2 seats
      : Math.floor(Math.random() * 5) + 3; // 30% chance of 3-7 seats

  // Some rides have riders already (20% chance)
  if (Math.random() < 0.2 && defaultRides.seats > 1) {
    const possibleRiders = [
      "student1@uni.edu",
      "student2@uni.edu",
      "student3@uni.edu",
    ];
    const numRiders =
      Math.floor(Math.random() * Math.min(defaultRides.seats, 2)) + 1;
    defaultRides.riders = possibleRiders.slice(0, numRiders);
  }

  // Random notes (40% chance)
  if (Math.random() < 0.4) {
    defaultRides.notes =
      sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
  }

  // Random date within next 30 days
  const futureDate = new Date(
    Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
  );
  defaultRides.date = futureDate.toISOString();

  // Created at random time in past week
  const createdDate = new Date(
    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
  );
  defaultRides.createdAt = createdDate.toISOString();

  template.defaultRides.push(defaultRides);
}

// dump the template to config/settings.prod.json

import fs from "fs";
import path from "path";
const settingsPath = path.join(process.cwd(), "config", "settings.prod.json");
fs.writeFileSync(settingsPath, JSON.stringify(template, null, 2), "utf8");
console.log(`Test data written to ${settingsPath}`);
