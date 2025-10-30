import { getSocketRoutes } from './socketBridge.js';
import { getLifiRoutes } from './lifiBridge.js';

/**
 * Fetch routes from multiple bridge aggregators in parallel
 * @param {string} token - Token symbol
 * @param {number} amount - Amount to bridge
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {Promise<Array>} Combined array of routes from all sources
 */
export async function aggregateRoutes(token, amount, fromChain, toChain) {
  console.log(`Aggregating routes for ${amount} ${token} from ${fromChain} to ${toChain}`);

  // Fetch from both APIs in parallel
  const [socketRoutes, lifiRoutes] = await Promise.allSettled([
    getSocketRoutes(token, amount, fromChain, toChain),
    getLifiRoutes(token, amount, fromChain, toChain)
  ]);

  let allRoutes = [];

  // Add Socket routes
  if (socketRoutes.status === 'fulfilled' && socketRoutes.value.length > 0) {
    allRoutes = allRoutes.concat(socketRoutes.value);
    console.log(`Added ${socketRoutes.value.length} routes from Socket.tech`);
  } else {
    console.log('No routes from Socket.tech or request failed');
  }

  // Add LI.FI routes
  if (lifiRoutes.status === 'fulfilled' && lifiRoutes.value.length > 0) {
    allRoutes = allRoutes.concat(lifiRoutes.value);
    console.log(`Added ${lifiRoutes.value.length} routes from LI.FI`);
  } else {
    console.log('No routes from LI.FI or request failed');
  }

  // Remove duplicate routes (same bridge name)
  const uniqueRoutes = removeDuplicateRoutes(allRoutes);

  console.log(`Total unique routes aggregated: ${uniqueRoutes.length}`);

  return uniqueRoutes;
}

/**
 * Remove duplicate routes based on bridge name
 * Keep the route with the lowest total cost if duplicates exist
 * @param {Array} routes - Array of route objects
 * @returns {Array} Deduplicated array of routes
 */
function removeDuplicateRoutes(routes) {
  const routeMap = new Map();

  for (const route of routes) {
    const bridgeName = route.bridge_name;

    if (!routeMap.has(bridgeName)) {
      routeMap.set(bridgeName, route);
    } else {
      // Keep the route with lower total cost
      const existing = routeMap.get(bridgeName);
      if (route.total_cost_usd < existing.total_cost_usd) {
        routeMap.set(bridgeName, route);
      }
    }
  }

  return Array.from(routeMap.values());
}
