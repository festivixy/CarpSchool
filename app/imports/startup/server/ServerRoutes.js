import crypto from "crypto";
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { Accounts } from "meteor/accounts-base";
import { Images } from "../../api/images/Images";

// Set Content Security Policy headers for OneSignal support
WebApp.connectHandlers.use("/", (req, res, next) => {
  // Only set CSP for HTML responses to avoid breaking API responses
  if (req.url === "/" || req.url.endsWith(".html") || !req.url.includes(".")) {

    // In development, use a more permissive CSP for easier testing
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (isDevelopment && process.env.DISABLE_CSP === "true") {
      // Completely disable CSP for development testing
    } else {
      const cspHeader = [
        "default-src 'self'",
        // challenges.cloudflare.com is required by Clerk's bot protection
        // (Cloudflare Turnstile). Without it the CAPTCHA script is blocked and
        // sign-up fails with a 400. See https://clerk.com/docs/security/clerk-csp
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
        "https://cdn.onesignal.com https://onesignal.com https://api.onesignal.com " +
        "https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com " +
        "https://challenges.cloudflare.com",
        "connect-src 'self' https://onesignal.com https://*.onesignal.com " +
        "https://api.onesignal.com https://cdn.onesignal.com wss: ws: " +
        "https://nominatim.carp.school https://tileserver.carp.school https://osrm.carp.school " +
        // Public OSM stack, used when the carp.school map services are
        // unreachable (see settings.public.map / ui/utils/mapConfig).
        "https://nominatim.openstreetmap.org https://router.project-osrm.org " +
        "https://tile.openstreetmap.org " +
        "https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com",
        "img-src 'self' data: blob: https: http: https://onesignal.com https://*.onesignal.com https://*.carp.school",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https: https://fonts.gstatic.com",
        "worker-src 'self' blob: https://cdn.onesignal.com",
        "frame-src https://onesignal.com https://*.onesignal.com " +
        "https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
      ].join("; ");

      res.setHeader("Content-Security-Policy", cspHeader);
    }
  }
  next();
});

// Rate limiting for image endpoint (V014 fix)
const imageRateLimiter = new Map(); // IP -> { count, timestamp }
const IMAGE_RATE_LIMIT = 100; // Max requests per window
const IMAGE_RATE_WINDOW = 60000; // 1 minute window

function checkImageRateLimit(ip) {
  const now = Date.now();
  const record = imageRateLimiter.get(ip);

  if (!record || now - record.timestamp > IMAGE_RATE_WINDOW) {
    imageRateLimiter.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= IMAGE_RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of imageRateLimiter.entries()) {
    if (now - record.timestamp > IMAGE_RATE_WINDOW * 2) {
      imageRateLimiter.delete(ip);
    }
  }
}, IMAGE_RATE_WINDOW);

// UUID format validation regex (V014 fix)
const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const SHA256_REGEX = /^[a-f0-9]{64}$/i;

// Create endpoint to serve images directly: /image/<uuid>
WebApp.connectHandlers.use("/image", async (req, res, _next) => {
  try {
    // Rate limiting check (V014 fix)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.connection?.remoteAddress ||
                     'unknown';

    if (!checkImageRateLimit(clientIp)) {
      res.writeHead(429, { "Content-Type": "text/plain" });
      res.end("Too Many Requests: Rate limit exceeded");
      return;
    }

    // Extract UUID from URL path (remove leading slash)
    const uuid = req.url.substring(1);

    if (!uuid) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: UUID required");
      return;
    }

    // Validate UUID format to prevent enumeration attacks (V014 fix)
    if (!UUID_REGEX.test(uuid) && !SHA256_REGEX.test(uuid)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: Invalid UUID format");
      return;
    }

    // Find image in database
    const image = await Images.findOneAsync({ uuid: uuid });

    if (!image) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Image not found");
      return;
    }

    // Check permissions for private images
    if (image.private) {
      // Get user from request (check for DDP connection first, then session)
      let userId = null;

      // Try to get user from DDP connection header
      const loginToken = req.headers['meteor-login-token'] || req.headers.authorization?.replace('Bearer ', '');

      if (loginToken) {
        // Look up the user by login token
        const hashedToken = Accounts._hashLoginToken(loginToken);
        const user = await Meteor.users.findOneAsync({
          "services.resume.loginTokens.hashedToken": hashedToken
        });
        if (user) {
          userId = user._id;
        }
      }

      // If no user found and image is private, deny access
      if (!userId) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied: Authentication required for private images");
        return;
      }

      // Check if user can view this private image
      const { isSystemAdmin } = await import("../../api/accounts/RoleUtils");
      const { isSchoolAdmin } = await import("../../api/accounts/RoleUtils");

      let canView = false;

      // System admin can view all images
      if (await isSystemAdmin(userId)) {
        canView = true;
      }
      // Image uploader can view their own images
      else if (image.user === userId) {
        canView = true;
      }
      // School admin can view images in their school
      else if (image.school && await isSchoolAdmin(userId, image.school)) {
        canView = true;
      }

      if (!canView) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied: You do not have permission to view this image");
        return;
      }
    }

    // Convert base64 to buffer
    let imageBuffer;
    try {
      if (Buffer.isBuffer(image.imageData)) {
        // Already a buffer
        imageBuffer = image.imageData;
      } else {
        // Convert base64 string to buffer
        imageBuffer = Buffer.from(image.imageData, "base64");
      }
    } catch (bufferError) {
      console.error("Error converting image data:", bufferError);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error: Invalid image data");
      return;
    }

    // Set proper headers
    res.writeHead(200, {
      "Content-Type": image.mimeType || "image/jpeg",
      "Content-Length": imageBuffer.length,
      "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      "Content-Disposition": `inline; filename="${image.fileName || "image"}"`,
    });

    // Send image data
    res.end(imageBuffer);
  } catch (error) {
    console.error("Error serving image:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

/*
 * Persona signs webhooks as "t=<unix ts>,v1=<hex hmac>" over "<t>.<raw body>"
 * with the webhook secret. Reject anything older than five minutes so a
 * captured request cannot be replayed.
 */
const PERSONA_MAX_AGE_SECONDS = 300;

const verifyPersonaSignature = (header, rawBody, secret) => {
  if (typeof header !== "string") return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.trim().split("=")).filter((kv) => kv.length === 2),
  );
  const ts = Number(parts.t);
  const given = parts.v1;
  if (!Number.isFinite(ts) || !given) return false;
  if (Math.abs(Date.now() / 1000 - ts) > PERSONA_MAX_AGE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(given), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Persona Webhook Endpoint
WebApp.connectHandlers.use("/webhooks/persona", async (req, res, _next) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Fail closed: without a verified signature anyone who can reach this
      // URL could mark any profile identity-verified.
      const secret = Meteor.settings?.private?.persona?.webhookSecret
        || process.env.PERSONA_WEBHOOK_SECRET;
      if (!secret) {
        console.error("Persona webhook rejected: PERSONA_WEBHOOK_SECRET is not configured");
        res.writeHead(503);
        res.end("Webhook not configured");
        return;
      }
      if (!verifyPersonaSignature(req.headers["persona-signature"], body, secret)) {
        res.writeHead(401);
        res.end("Invalid signature");
        return;
      }

      const payload = JSON.parse(body);
      const { data } = payload;

      // Basic validation
      if (!data || !data.attributes) {
        res.writeHead(400);
        res.end("Invalid Payload");
        return;
      }

      const { status, referenceId, inquiryId } = data.attributes;

      // Only process completed inquiries
      if (status === "completed" && referenceId) {
        // Update user profile
        // Import Profiles here to avoid circular dependency issues if any
        const { Profiles } = await import("../../api/profile/Profile");

        // Find profile belonging to the user (referenceId should be userId)
        const profile = await Profiles.findOneAsync({ Owner: referenceId });

        if (profile) {
          await Profiles.updateAsync(profile._id, {
            $set: {
              identityVerified: true,
              personaInquiryId: inquiryId,
              verifiedAt: new Date(),
            }
          });
          console.log(`Verified identity for user ${referenceId}`);
        } else {
          console.warn(`Profile not found for user ${referenceId}`);
        }
      }

      res.writeHead(200);
      res.end("OK");
    } catch (e) {
      console.error("Error processing Persona webhook:", e);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });
});

// Health check endpoint
WebApp.connectHandlers.use("/health", (req, res, _next) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});

// Client-side routing fallback for BrowserRouter
// Serve index.html for all client-side routes that don't match API endpoints or static files
WebApp.connectHandlers.use((req, res, next) => {
  // Skip if this is an API endpoint, static file, or already handled
  if (req.url.startsWith("/api") ||
      req.url.startsWith("/sockjs") ||
      req.url.startsWith("/packages") ||
      req.url.startsWith("/image") ||
      req.url.startsWith("/health") ||
      req.url.includes(".") || // Skip requests for files with extensions
      req.method !== "GET") {
    return next();
  }

  // For client-side routes, let Meteor handle serving the main HTML
  // This ensures BrowserRouter routes work properly
  next();
});
