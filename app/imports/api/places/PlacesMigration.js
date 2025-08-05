import { Meteor } from "meteor/meteor";
import { Places } from "./Places";

// Static places data for migration
const staticPlaces = [
  "Aiea",
  "Ewa Beach",
  "Hale`iwa",
  "Hau`ula",
  "Hawaii Kai",
  "Honolulu",
  "Ka`a`awa",
  "Kahala",
  "Kahuku",
  "Kailua",
  "Kane`ohe",
  "Kapolei",
  "La`ie",
  "Lanikai",
  "Ma`ili",
  "Makaha",
  "Manoa",
  "Mililani",
  "Nanakuli",
  "Pearl City",
  "University of Hawaii Manoa",
  "Wahiawa",
  "Waialua",
  "Wai`anae",
  "Waikiki",
  "Waimanalo",
  "Waipahu",
];

// Approximate coordinates for Hawaii locations (for demo purposes)
const placeCoordinates = {
  Aiea: "21.3891,-157.9297",
  "Ewa Beach": "21.3156,-158.0072",
  "Hale`iwa": "21.5933,-158.1044",
  "Hau`ula": "21.6122,-157.9058",
  "Hawaii Kai": "21.2891,-157.7056",
  Honolulu: "21.3099,-157.8581",
  "Ka`a`awa": "21.5558,-157.8514",
  Kahala: "21.2772,-157.7419",
  Kahuku: "21.6797,-157.9522",
  Kailua: "21.4022,-157.7394",
  "Kane`ohe": "21.4178,-157.8014",
  Kapolei: "21.3358,-158.0583",
  "La`ie": "21.6486,-157.9236",
  Lanikai: "21.3928,-157.7281",
  "Ma`ili": "21.4164,-158.1794",
  Makaha: "21.4697,-158.2272",
  Manoa: "21.3158,-157.8053",
  Mililani: "21.4511,-158.0147",
  Nanakuli: "21.3897,-158.1539",
  "Pearl City": "21.3972,-157.9692",
  "University of Hawaii Manoa": "21.2969,-157.8158",
  Wahiawa: "21.5036,-158.0244",
  Waialua: "21.5769,-158.1344",
  "Wai`anae": "21.4394,-158.1786",
  Waikiki: "21.2793,-157.8294",
  Waimanalo: "21.3356,-157.7147",
  Waipahu: "21.3861,-158.0094",
};

/**
 * Migration function to convert static places to dynamic collection
 * This creates a system admin user and assigns all places to them
 */
export async function migratePlacesToCollection() {
  if (Meteor.isServer) {
    // Check if migration has already been run
    const existingPlaces = await Places.find().countAsync();
    if (existingPlaces > 0) {
      console.log("Places migration already completed. Skipping...");
      return;
    }

    console.log("Starting places migration...");

    // Find or create a system admin user for default places
    let systemAdmin = await Meteor.users.findOneAsync({ username: "system" });

    if (!systemAdmin) {
      console.log("Creating system admin user for default places...");
      const systemUserId = await Meteor.users.insertAsync({
        username: "system",
        emails: [{ address: "system@rideshare.com", verified: true }],
        roles: ["admin"],
        createdAt: new Date(),
        profile: {
          firstName: "System",
          lastName: "Admin",
        },
      });
      systemAdmin = { _id: systemUserId };
    }

    // Insert all static places as system admin places
    const migratedPlaces = [];
    await Promise.all(staticPlaces.map(async (placeName) => {
      const coordinates = placeCoordinates[placeName] || "21.3099,-157.8581"; // Default to Honolulu

      const placeData = {
        text: placeName,
        value: coordinates,
        createdBy: systemAdmin._id,
        createdAt: new Date(),
      };

      try {
        const placeId = await Places.insertAsync(placeData);
        migratedPlaces.push(placeId);
        console.log(`Migrated place: ${placeName}`);
      } catch (error) {
        console.error(`Failed to migrate place ${placeName}:`, error.message);
      }
    }));

    console.log(`Places migration completed. Migrated ${migratedPlaces.length} places.`);
  }
}
