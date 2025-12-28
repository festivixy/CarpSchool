import { WebApp } from "meteor/webapp";
import { Meteor } from "meteor/meteor";
import { ApiKeys } from "../../api/api-keys/ApiKeys";
import { Rides } from "../../api/ride/Rides";
import { validateUserCanJoinRide } from "../../api/ride/RideValidation";

// Helper to send JSON response
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

// Helper to send Error response
const sendError = (res, statusCode, message) => {
  sendJson(res, statusCode, { status: "error", message });
};

WebApp.connectHandlers.use("/api/v1", async (req, res, next) => {
  // Middleware: Parse JSON Body
  if (req.method === "POST" || req.method === "PUT") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    await new Promise((resolve) => req.on("end", resolve));

    try {
      if (body) {
        req.body = JSON.parse(body);
      }
    } catch (e) {
      return sendError(res, 400, "Invalid JSON");
    }
  }

  // Middleware: Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Missing or invalid Authorization header");
  }

  const apiKey = authHeader.split(" ")[1];
  const keyDoc = await ApiKeys.findOneAsync({ key: apiKey });

  if (!keyDoc) {
    return sendError(res, 403, "Invalid API Key");
  }

  // Attach user to request
  const user = await Meteor.users.findOneAsync(keyDoc.userId);
  if (!user) {
    return sendError(res, 401, "User not found");
  }
  req.user = user;
  
  // router function
  const url = req.url.split('?')[0]; // Remove query params

  // --- ROUTE: GET /me ---
  if (req.method === "GET" && url === "/me") {
    return sendJson(res, 200, {
      status: "success",
      data: {
        _id: user._id,
        username: user.username,
        profile: user.profile,
        emails: user.emails,
      }
    });
  }

  // --- ROUTE: GET /rides ---
  if (req.method === "GET" && url === "/rides") {
    try {
      // Basic Filtering
      const query = {};
      
      // Since ApiRoutes is server-side, we can use `rides.getUserRides` logic directly or query DB
      // Expose public rides or user rides? Let's assume list accessible rides.
      // For simplicity matching the plan: "List rides"
      
      const rides = await Rides.find(query, { limit: 50, sort: { date: -1 } }).fetchAsync();
      return sendJson(res, 200, { status: "success", data: rides });
    } catch (e) {
      return sendError(res, 500, e.message);
    }
  }

  // --- ROUTE: POST /rides ---
  if (req.method === "POST" && url === "/rides") {
    try {
      const { origin, destination, date, seats, notes } = req.body || {};

      if (!origin || !destination || !date || !seats) {
        return sendError(res, 400, "Missing required fields: origin, destination, date, seats");
      }

      const rideId = await Rides.insertAsync({
        driver: user._id,
        riders: [],
        origin,
        destination,
        date: new Date(date),
        seats: parseInt(seats, 10),
        notes: notes || "",
        createdAt: new Date(),
      });

      return sendJson(res, 201, {
        status: "success",
        data: { rideId, message: "Ride created successfully" }
      });
    } catch (e) {
      return sendError(res, 500, e.message);
    }
  }

  // 404 for unknown /api/v1 routes
  return sendError(res, 404, "Endpoint not found");
});
