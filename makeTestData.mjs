// Using ES6 named import from .mjs file
import { places } from "./app/imports/api/places/Places.mjs";

console.log("Available places:", places);

// Hawaii coordinates for realistic place generation
const hawaiiCoordinates = [
  { name: "Aiea", lat: 21.3847, lng: -157.9308 },
  { name: "Ewa Beach", lat: 21.3156, lng: -158.0067 },
  { name: "Hale`iwa", lat: 21.5933, lng: -158.1042 },
  { name: "Hau`ula", lat: 21.6086, lng: -157.9089 },
  { name: "Hawaii Kai", lat: 21.2828, lng: -157.7144 },
  { name: "Honolulu", lat: 21.3099, lng: -157.8581 },
  { name: "Ka`a`awa", lat: 21.5544, lng: -157.8508 },
  { name: "Kahala", lat: 21.2692, lng: -157.7714 },
  { name: "Kahuku", lat: 21.6789, lng: -157.9528 },
  { name: "Kailua", lat: 21.4022, lng: -157.7394 },
  { name: "Kane`ohe", lat: 21.4036, lng: -157.7958 },
  { name: "Kapolei", lat: 21.3361, lng: -158.0581 },
  { name: "La`ie", lat: 21.6469, lng: -157.9261 },
  { name: "Lanikai", lat: 21.3972, lng: -157.7281 },
  { name: "Ma`ili", lat: 21.4411, lng: -158.1783 },
  { name: "Makaha", lat: 21.4656, lng: -158.2169 },
  { name: "Manoa", lat: 21.3167, lng: -157.8025 },
  { name: "Mililani", lat: 21.4514, lng: -158.0153 },
  { name: "Nanakuli", lat: 21.3939, lng: -158.1539 },
  { name: "Pearl City", lat: 21.3972, lng: -157.9736 },
  { name: "University of Hawaii Manoa", lat: 21.2969, lng: -157.8158 },
  { name: "Wahiawa", lat: 21.5033, lng: -158.0242 },
  { name: "Waialua", lat: 21.5769, lng: -158.1308 },
  { name: "Wai`anae", lat: 21.4486, lng: -158.1875 },
  { name: "Waikiki", lat: 21.2793, lng: -157.8294 },
  { name: "Waimanalo", lat: 21.3369, lng: -157.7089 },
  { name: "Waipahu", lat: 21.3869, lng: -158.0097 },
];

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
  defaultPlaces: [],
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

// Generate places for users first
const sampleDrivers = [
  "admin@foo.com",
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
];
const allUsers = [...template.defaultAccounts.map((acc) => acc.email)];

// Distribute places among users (each user gets 3-5 places)
let createdPlaces = [];
let placeIdToName = {}; // Map place IDs to names for logging
allUsers.forEach((userEmail, userIndex) => {
  const numPlaces = Math.floor(Math.random() * 3) + 3; // 3-5 places per user
  const userPlaces = [];

  // Select random places for this user, ensuring no duplicates
  const availablePlaces = hawaiiCoordinates.filter(
    (place) => !createdPlaces.some((created) => created.text === place.name),
  );

  for (let i = 0; i < Math.min(numPlaces, availablePlaces.length); i++) {
    const randomPlace =
      availablePlaces[Math.floor(Math.random() * availablePlaces.length)];
    const placeId = generateObjectId();
    const placeData = {
      _id: placeId,
      text: randomPlace.name,
      value: `${randomPlace.lat},${randomPlace.lng}`,
      createdBy: userEmail,
      createdAt: new Date(
        Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
      ).toISOString(), // Created in past 2 weeks
    };

    template.defaultPlaces.push(placeData);
    createdPlaces.push(placeData);
    userPlaces.push(randomPlace.name);
    placeIdToName[placeId] = randomPlace.name;

    // Remove from available to avoid duplicates
    const index = availablePlaces.indexOf(randomPlace);
    if (index > -1) availablePlaces.splice(index, 1);
  }

  console.log(
    `Generated ${userPlaces.length} places for ${userEmail}: ${userPlaces.join(", ")}`,
  );
});

// Create array of place IDs for ride generation (instead of names)
const availablePlaceIds = createdPlaces.map((place) => place._id);
console.log(`Total places generated: ${availablePlaceIds.length}`);
console.log(`Sample place IDs: ${availablePlaceIds.slice(0, 3).join(", ")}...`);

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

  // Random origin and destination from generated places (ensure they're different)
  let originIndex = Math.floor(Math.random() * availablePlaceIds.length);
  let destinationIndex;
  do {
    destinationIndex = Math.floor(Math.random() * availablePlaceIds.length);
  } while (destinationIndex === originIndex);

  const originId = availablePlaceIds[originIndex];
  const destinationId = availablePlaceIds[destinationIndex];

  defaultRides.origin = originId;
  defaultRides.destination = destinationId;

  // Log readable place names for debugging
  console.log(
    `  Route: ${placeIdToName[originId]} → ${placeIdToName[destinationId]}`,
  );

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

// Function to generate MongoDB-style ObjectIds for consistency
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  )
    .join("")
    .slice(0, 16);
  return timestamp + randomBytes;
}

console.log("Generating test data with UUID-based place references...");

import fs from "fs";
import path from "path";
const settingsPath = path.join(process.cwd(), "config", "settings.development.json");
fs.writeFileSync(settingsPath, JSON.stringify(template, null, 2), "utf8");
console.log(`\n✅ Test data generation complete!`);
console.log(`📊 Summary:`);
console.log(`   • ${template.defaultAccounts.length} user accounts`);
console.log(`   • ${template.defaultPlaces.length} places with UUIDs`);
console.log(
  `   • ${template.defaultRides.length} rides with place ID references`,
);
console.log(`📁 Written to: ${settingsPath}`);
