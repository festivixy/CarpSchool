// Using ES6 named import from .mjs file
import { places } from "./app/imports/api/places/Places.mjs";

console.log('Available places:', places);

var template = {
    "defaultAccounts": [
        { "email": "admin@foo.com", "firstName": "admin", "lastName": "admin", "password": "changeme", "role": "admin" }
    ],
    "defaultRides": []
}

var defaultRidesTemplate = {
    "driver": "TBD", "rider": "TBD",
    "origin": "", "destination": "",
    "date": ""
}

for (let index = 0; index < 10; index++) {
    let defaultRides = Object.assign({}, defaultRidesTemplate);
    defaultRides.origin = places[Math.floor(Math.random() * places.length)];
    defaultRides.destination = places[Math.floor(Math.random() * places.length)];
    template.defaultRides.push(defaultRides);
}

// dump the template to config/settings.prod.json

import fs from 'fs';
import path from 'path';
const settingsPath = path.join(process.cwd(), 'config', 'settings.prod.json');
fs.writeFileSync(settingsPath, JSON.stringify(template, null, 2), 'utf8');
console.log(`Test data written to ${settingsPath}`);