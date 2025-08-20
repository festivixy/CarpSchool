import { WebApp } from "meteor/webapp";
import { Images } from "../../api/images/Images";

// Set Content Security Policy headers for OneSignal support
WebApp.connectHandlers.use("/", (req, res, next) => {
  // Only set CSP for HTML responses to avoid breaking API responses
  if (req.url === '/' || req.url.endsWith('.html') || !req.url.includes('.')) {

    // In development, use a more permissive CSP for easier testing
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment && process.env.DISABLE_CSP === 'true') {
      // Completely disable CSP for development testing
    } else {
      const cspHeader = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://api.onesignal.com",
        "connect-src 'self' https://onesignal.com https://*.onesignal.com https://api.onesignal.com https://cdn.onesignal.com wss: ws: https://nominatim.carp.school https://tileserver.carp.school https://osrm.carp.school",
        "img-src 'self' data: https: http: https://onesignal.com https://*.onesignal.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https: https://fonts.gstatic.com",
        "worker-src 'self' blob:",
        "frame-src https://onesignal.com https://*.onesignal.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ');

      res.setHeader('Content-Security-Policy', cspHeader);
    }
  }
  next();
});

// Create endpoint to serve images directly: /image/<uuid>
WebApp.connectHandlers.use("/image", async (req, res, _next) => {
  try {
    // Extract UUID from URL path (remove leading slash)
    const uuid = req.url.substring(1);

    if (!uuid) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: UUID required");
      return;
    }

    // Find image in database
    const image = await Images.findOneAsync({ uuid: uuid });

    if (!image) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Image not found");
      return;
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

// Health check endpoint
WebApp.connectHandlers.use("/health", (req, res, _next) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});
