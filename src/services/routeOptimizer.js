/**
 * Optimize and sort routes, provide recommendations
 * @param {Array} routes - Array of route objects
 * @param {string} token - Token being bridged
 * @param {number} amount - Amount being bridged
 * @returns {Object} Optimized routes with recommendation
 */
export function optimizeRoutes(routes, token, amount) {
  if (!routes || routes.length === 0) {
    return {
      routes: [],
      recommended_route: null
    };
  }

  // Sort routes by total cost (lowest first)
  const sortedRoutes = [...routes].sort((a, b) => {
    return parseFloat(a.total_cost_usd) - parseFloat(b.total_cost_usd);
  });

  // Find the cheapest route
  const cheapest = sortedRoutes[0];

  // Find the fastest route
  const fastest = routes.reduce((prev, curr) =>
    curr.eta_minutes < prev.eta_minutes ? curr : prev
  );

  // Determine recommended route
  let recommended = cheapest;
  let reason = 'Lowest total cost with acceptable speed';

  // If the fastest route costs less than 20% more and is at least 2x faster, recommend it
  const costDiff = (parseFloat(fastest.total_cost_usd) - parseFloat(cheapest.total_cost_usd)) /
    parseFloat(cheapest.total_cost_usd);

  if (costDiff < 0.20 && fastest.eta_minutes < cheapest.eta_minutes / 2) {
    recommended = fastest;
    reason = 'Best balance of speed and cost';
  }

  // If amount is small (< $10 equivalent), prioritize speed over cost
  if (amount < 10 && fastest.bridge_name !== cheapest.bridge_name) {
    recommended = fastest;
    reason = 'Fastest option for small transfer';
  }

  return {
    routes: sortedRoutes,
    recommended_route: {
      bridge_name: recommended.bridge_name,
      reason: reason
    }
  };
}

/**
 * Get standard warnings for bridge operations
 * @param {string} token - Token being bridged
 * @param {number} amount - Amount being bridged
 * @returns {Array} Array of warning strings
 */
export function getWarnings(token, amount) {
  const warnings = [
    'Always verify bridge contracts before approving tokens',
    'Bridge times are estimates and may vary with network congestion'
  ];

  // Add warning for small amounts
  if (amount < 10) {
    warnings.push('For small amounts, bridge fees may be a significant percentage of your transfer');
  }

  // Add warning for large amounts
  if (amount > 50000) {
    warnings.push('For large amounts, consider splitting into multiple transfers or verify bridge liquidity');
  }

  return warnings;
}
