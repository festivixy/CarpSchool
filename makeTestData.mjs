// Vancouver coordinates for realistic place generation
const vancouverCoordinates = [
  { name: "Downtown Vancouver", lat: 49.2827, lng: -123.1207 },
  { name: "West End", lat: 49.2911, lng: -123.1399 },
  { name: "Gastown", lat: 49.2844, lng: -123.1089 },
  { name: "Chinatown", lat: 49.2791, lng: -123.1020 },
  { name: "Yaletown", lat: 49.2747, lng: -123.1207 },
  { name: "Coal Harbour", lat: 49.2931, lng: -123.1280 },
  { name: "Kitsilano", lat: 49.2659, lng: -123.1562 },
  { name: "UBC Campus", lat: 49.2606, lng: -123.2460 },
  { name: "Richmond Centre", lat: 49.1739, lng: -123.1365 },
  { name: "Burnaby Central", lat: 49.2488, lng: -123.0036 },
  { name: "Surrey Central", lat: 49.1897, lng: -122.8489 },
  { name: "Coquitlam Centre", lat: 49.2776, lng: -122.8000 },
  { name: "North Vancouver", lat: 49.3163, lng: -123.0686 },
  { name: "West Vancouver", lat: 49.3287, lng: -123.1565 },
  { name: "New Westminster", lat: 49.2069, lng: -122.9108 },
  { name: "Langley Centre", lat: 49.1044, lng: -122.6604 },
  { name: "White Rock", lat: 49.0258, lng: -122.8037 },
  { name: "Delta Centre", lat: 49.1440, lng: -123.0583 },
  { name: "Metrotown", lat: 49.2258, lng: -123.0038 },
  { name: "Brentwood", lat: 49.2667, lng: -123.0017 },
  { name: "Lougheed Mall", lat: 49.2486, lng: -122.8970 },
  { name: "Commercial Drive", lat: 49.2659, lng: -123.0694 },
  { name: "Main Street", lat: 49.2526, lng: -123.1007 },
  { name: "Olympic Village", lat: 49.2660, lng: -123.1139 },
  { name: "Science World", lat: 49.2733, lng: -123.1033 },
  { name: "Queen Elizabeth Park", lat: 49.2404, lng: -123.1147 },
  { name: "VGH Hospital", lat: 49.2628, lng: -123.1207 },
];

// Read existing settings.json and preserve variables
import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "config", "settings.json");
let existingSettings = {};

try {
  const settingsContent = fs.readFileSync(settingsPath, "utf8");
  existingSettings = JSON.parse(settingsContent);
  console.log("✅ Loaded existing settings.json");
} catch (error) {
  console.log("⚠️ Could not read existing settings.json, creating new one");
  console.log("Error:", error.message);
}

// Create template by merging existing settings with test data
var template = {
  public: {
    ...existingSettings.public, // Preserve all existing public settings
    enableDebugMode: true, // Override to enable debug mode
  },
  private: {
    ...existingSettings.private, // Preserve all existing private settings
  },
  defaultSchools: [
    {
      name: "Default Test School",
      shortName: "Test School",
      code: "TEST",
      domain: "foo.com",
      location: {
        coordinates: {
          lat: 49.2827,
          lng: -123.1207
        }
      },
      settings: {
        allowPublicRegistration: true,
        requireEmailVerification: true,
        requireDomainMatch: false,
        maxRideDistance: 50
      }
    },
    {
      name: "Example University",
      shortName: "Example Uni",
      code: "UNI",
      domain: "uni.edu",
      location: {
        coordinates: {
          lat: 49.2606,
          lng: -123.2460
        }
      },
      settings: {
        allowPublicRegistration: true,
        requireEmailVerification: true,
        requireDomainMatch: true,
        maxRideDistance: 30
      }
    }
  ],
  defaultAccounts: [
    {
      email: "admin@foo.com",
      firstName: "System",
      lastName: "Administrator",
      password: "changeme",
      role: "system",
      schoolCode: "TEST",
    },
    {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      password: "password123",
      schoolCode: "TEST",
    },
    {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Smith",
      password: "password123",
      schoolCode: "TEST",
    },
    {
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Brown",
      password: "password123",
      schoolCode: "TEST",
    },
    {
      email: "student1@uni.edu",
      firstName: "Emma",
      lastName: "Davis",
      password: "password123",
      schoolCode: "UNI",
    },
    {
      email: "student2@uni.edu",
      firstName: "David",
      lastName: "Wilson",
      password: "password123",
      schoolCode: "UNI",
    },
    {
      email: "student3@uni.edu",
      firstName: "Sarah",
      lastName: "Taylor",
      password: "password123",
      schoolCode: "UNI",
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
  const availablePlaces = vancouverCoordinates.filter(
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

// Write the updated settings to settings.development.json
const outputPath = path.join(process.cwd(), "config", "settings.development.json");
fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), "utf8");
console.log(`\n✅ Test data generation complete!`);
console.log(`📊 Summary:`);
console.log(`   • ${template.defaultSchools.length} schools`);
console.log(`   • ${template.defaultAccounts.length} user accounts`);
console.log(`   • ${template.defaultPlaces.length} places with UUIDs`);
console.log(
  `   • ${template.defaultRides.length} rides with place ID references`,
);
console.log(`   • enableDebugMode set to: ${template.public.enableDebugMode}`);
console.log(`   • Preserved existing settings (oneSignal, vapid, clerk)`);
console.log(`📁 Written to: ${outputPath}`);
