import { Rides } from "../ride/Rides";
import { getTileServerUrl, getNominatimUrl, getOsrmUrl } from "../../ui/utils/mapConfig";
import { requireAdminScope } from "./adminScope";

/* Latency bands, in milliseconds. */
const HEALTHY_MS = 400;
const DEGRADED_MS = 2000;

const PROBE_TIMEOUT_MS = 4000;

/* Every admin viewing the dashboard polls this card. One shared result for a
 * short window keeps a room full of operators from turning the panel into a
 * load generator against third-party hosts. */
const CACHE_MS = 15000;

let cache = null;

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch (error) {
    return url;
  }
};

const band = (latencyMs) => {
  if (latencyMs < HEALTHY_MS) return "healthy";
  if (latencyMs < DEGRADED_MS) return "degraded";
  return "down";
};

/**
 * Reachability + latency for one endpoint. The URLs come from server settings
 * via mapConfig, never from client input, so there is no request-forgery
 * surface here.
 */
const probeHttp = async (id, url) => {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    const latencyMs = Date.now() - startedAt;
    // A 5xx means the host answered but cannot serve; treat it as degraded
    // rather than healthy, however fast it replied.
    const status = response.status >= 500 ? "degraded" : band(latencyMs);
    return { id, host: hostOf(url), status, latencyMs, httpStatus: response.status };
  } catch (error) {
    return {
      id,
      host: hostOf(url),
      status: "down",
      latencyMs: Date.now() - startedAt,
      error: error?.name === "TimeoutError" ? "timeout" : "unreachable",
    };
  }
};

const probeMongo = async () => {
  const startedAt = Date.now();
  try {
    await Rides.rawDatabase().command({ ping: 1 });
    const latencyMs = Date.now() - startedAt;
    return { id: "mongo", host: "mongo · primary", status: band(latencyMs), latencyMs };
  } catch (error) {
    return {
      id: "mongo",
      host: "mongo · primary",
      status: "down",
      latencyMs: Date.now() - startedAt,
      error: "unreachable",
    };
  }
};

/**
 * Live health of the endpoints the app actually uses — the tile, geocoding and
 * routing services as configured, plus the database. Nothing here is a fixed
 * hostname list: overriding `Meteor.settings.public.map` moves the probes too.
 */
export async function serviceHealth(userId) {
  await requireAdminScope(userId);

  if (cache && Date.now() - cache.at < CACHE_MS) return cache.payload;

  const services = await Promise.all([
    probeHttp("tiles", getTileServerUrl()),
    probeHttp("geocode", getNominatimUrl()),
    probeHttp("routing", getOsrmUrl()),
    probeMongo(),
  ]);

  const payload = {
    services,
    checkedAt: new Date(),
    summary: {
      healthy: services.filter(s => s.status === "healthy").length,
      degraded: services.filter(s => s.status === "degraded").length,
      down: services.filter(s => s.status === "down").length,
    },
  };

  cache = { at: Date.now(), payload };
  return payload;
}

export default serviceHealth;
