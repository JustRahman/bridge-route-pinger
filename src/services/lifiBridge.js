import axios from 'axios';
import { getLifiChainName } from '../config/chains.js';
import { getTokenAddress, getTokenDecimals } from '../config/tokens.js';
import { formatBridgeName, getBridgeUrl, getConfidence, getRequirements } from '../config/bridges.js';

const LIFI_API_BASE = 'https://li.quest/v1';
const VALID_USER_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

/**
 * Fetch bridge routes from LI.FI API
 * @param {string} token - Token symbol (USDC, USDT, ETH, WETH)
 * @param {number} amount - Amount to bridge
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {Promise<Array>} Array of parsed route objects
 */
export async function getLifiRoutes(token, amount, fromChain, toChain) {
  try {
    const fromChainName = getLifiChainName(fromChain);
    const toChainName = getLifiChainName(toChain);

    // Get token addresses
    const fromTokenAddress = getTokenAddress(token, fromChain);
    const toTokenAddress = getTokenAddress(token, toChain);

    // Convert amount to token decimals
    const decimals = getTokenDecimals(token);
    const fromAmount = (amount * Math.pow(10, decimals)).toString();

    const params = {
      fromChain: fromChainName,
      toChain: toChainName,
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      fromAmount: fromAmount,
      fromAddress: VALID_USER_ADDRESS,
      slippage: 0.01
    };

    console.log('Fetching LI.FI routes with params:', params);

    const response = await axios.get(`${LIFI_API_BASE}/quote`, {
      params,
      timeout: 8000
    });

    return parseLifiResponse(response.data, token, amount, fromChain, toChain);
  } catch (error) {
    console.error('LI.FI API error:', error.message);
    if (error.response) {
      console.error('LI.FI API response error:', error.response.status, error.response.data);
    }
    return [];
  }
}

/**
 * Parse LI.FI API response into standardized route format
 * @param {Object} data - LI.FI API response data
 * @param {string} token - Token symbol
 * @param {number} amount - Original amount
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {Array} Parsed route objects
 */
function parseLifiResponse(data, token, amount, fromChain, toChain) {
  // LI.FI returns a single route per request
  if (!data || !data.estimate) {
    console.log('No routes found in LI.FI response');
    return [];
  }

  try {
    const route = data;
    const bridgeName = route.toolDetails?.name || route.tool || 'Unknown';

    // Parse fee amount (LI.FI includes fees in the estimate)
    const decimals = getTokenDecimals(token);
    const outputAmount = parseFloat(route.estimate.toAmount || 0) / Math.pow(10, decimals);
    const feeAmount = amount - outputAmount;

    // Parse gas cost
    const gasCosts = route.estimate.gasCosts || [];
    const gasUsd = gasCosts.reduce((sum, cost) => sum + parseFloat(cost.amountUSD || 0), 0);

    // Calculate total cost
    const totalCostUsd = feeAmount + gasUsd;

    // Calculate fee percentage
    const feePercentage = amount > 0 ? (feeAmount / amount) * 100 : 0;

    // Execution time in minutes
    const etaMinutes = route.estimate.executionDuration
      ? Math.ceil(route.estimate.executionDuration / 60)
      : 15;

    console.log(`Found 1 route from LI.FI: ${bridgeName}`);

    return [{
      bridge_name: formatBridgeName(bridgeName),
      bridge_url: getBridgeUrl(bridgeName),
      eta_minutes: etaMinutes,
      fee_usd: parseFloat(feeAmount.toFixed(4)),
      fee_percentage: parseFloat(feePercentage.toFixed(2)),
      gas_estimate_usd: parseFloat(gasUsd.toFixed(2)),
      total_cost_usd: parseFloat(totalCostUsd.toFixed(2)),
      output_amount: parseFloat(outputAmount.toFixed(6)),
      requirements: getRequirements(route, token, fromChain, toChain),
      confidence: getConfidence(bridgeName),
      bridge_contract: route.transactionRequest?.to || 'N/A'
    }];
  } catch (err) {
    console.error('Error parsing LI.FI route:', err.message);
    return [];
  }
}
