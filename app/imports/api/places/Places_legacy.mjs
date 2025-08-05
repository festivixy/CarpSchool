const places = [
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

const placesOptions = [];

for (let index = 0; index < places.length; index++) {
  const element = places[index];
  placesOptions.push({ key: element, text: element, value: element });
}

// Export for both CommonJS and ES6 compatibility
const exports_ = { places, placesOptions };
export { places, placesOptions };
export default exports_;
