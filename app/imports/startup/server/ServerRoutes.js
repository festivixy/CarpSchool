import { WebApp } from "meteor/webapp";
import { Images } from "../../api/images/Images";
import http from "http";

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

// Create proxy endpoint to forward requests to tileserver: /tileserver/*
WebApp.connectHandlers.use("/tileserver", (req, res, _next) => {
  try {
    // Remove /tileserver from the path and forward to tileserver-gl:8080
    const targetPath = req.url;

    const options = {
      // hostname: "tileserver-gl",
      hostname: "localhost", // Use localhost for local development
      port: 8080,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: "tileserver-gl:8080", // Update host header for the target
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward status code and headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // Pipe the response data
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (error) => {
      console.error("Tileserver proxy error:", error);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway: Tileserver unavailable");
      }
    });

    // Forward request body if present
    req.pipe(proxyReq);
  } catch (error) {
    console.error("Tileserver proxy setup error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

// Create proxy endpoint to forward requests to nominatim: /nominatim/*
WebApp.connectHandlers.use("/nominatim", (req, res, _next) => {
  try {
    // Remove /nominatim from the path and forward to nominatim:8080
    const targetPath = req.url;

    const options = {
      // hostname: "nominatim",
      hostname: "localhost", // Use localhost for local development
      port: 8082, // Nominatim runs on port 8082 according to docker-compose.yml
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: "nominatim:8080", // Update host header for the target
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward status code and headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // Pipe the response data
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (error) => {
      console.error("Nominatim proxy error:", error);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway: Nominatim unavailable");
      }
    });

    // Forward request body if present
    req.pipe(proxyReq);
  } catch (error) {
    console.error("Nominatim proxy setup error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});
