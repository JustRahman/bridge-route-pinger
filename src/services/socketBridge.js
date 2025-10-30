import axios from 'axios';
import { getChainId } from '../config/chains.js';
import { getTokenAddress, getTokenDecimals } from '../config/tokens.js';
import { formatBridgeName, getBridgeUrl, getConfidence, getRequirements } from '../config/bridges.js';

const SOCKET_API_BASE = 'https://api.socket.tech/v2';
const VALID_USER_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

/**
 * Fetch bridge routes from Socket.tech API
 * @param {string} token - Token symbol (USDC, USDT, ETH, WETH)
 * @param {number} amount - Amount to bridge
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {Promise<Array>} Array of parsed route objects
 */
export async function getSocketRoutes(token, amount, fromChain, toChain) {
  try {
    const fromChainId = getChainId(fromChain);
    const toChainId = getChainId(toChain);

    // Get token addresses
    const fromTokenAddress = getTokenAddress(token, fromChain);
    const toTokenAddress = getTokenAddress(token, toChain);

    // Convert amount to token decimals
    const decimals = getTokenDecimals(token);
    const fromAmount = (amount * Math.pow(10, decimals)).toString();

    const params = {
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      userAddress: VALID_USER_ADDRESS,
      singleTxOnly: true,
      sort: 'output',
      defaultSwapSlippage: 1
    };

    console.log('Fetching Socket routes with params:', params);

    const response = await axios.get(`${SOCKET_API_BASE}/quote`, {
      params,
      timeout: 8000
    });

    return parseSocketResponse(response.data, token, amount, fromChain, toChain);
  } catch (error) {
    console.error('Socket API error:', error.message);
    if (error.response) {
      console.error('Socket API response error:', error.response.status, error.response.data);
    }
    return [];
  }
}

/**
 * Parse Socket.tech API response into standardized route format
 * @param {Object} data - Socket API response data
 * @param {string} token - Token symbol
 * @param {number} amount - Original amount
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {Array} Parsed route objects
 */
function parseSocketResponse(data, token, amount, fromChain, toChain) {
  if (!data.result?.routes || data.result.routes.length === 0) {
    console.log('No routes found in Socket response');
    return [];
  }

  console.log(`Found ${data.result.routes.length} routes from Socket.tech`);

  return data.result.routes.map(route => {
    try {
      const bridgeName = route.usedBridgeNames?.[0] || 'Unknown';

      // Parse fee amount
      const feeAmount = route.integratorFee?.amount
        ? parseFloat(route.integratorFee.amount) / Math.pow(10, getTokenDecimals(token))
        : 0;

      // Parse gas cost
      const gasUsd = parseFloat(route.totalGasFeesInUsd || 0);

      // Parse output amount
      const decimals = getTokenDecimals(token);
      const outputAmount = parseFloat(route.toAmount || 0) / Math.pow(10, decimals);

      // Calculate total cost
      const totalCostUsd = feeAmount + gasUsd;

      // Calculate fee percentage
      const feePercentage = amount > 0 ? (feeAmount / amount) * 100 : 0;

      // Service time in minutes
      const etaMinutes = route.serviceTime ? Math.ceil(route.serviceTime / 60) : 10;

      return {
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
        bridge_contract: route.approvalData?.allowanceTarget || route.userTxs?.[0]?.to || 'N/A'
      };
    } catch (err) {
      console.error('Error parsing route:', err.message);
      return null;
    }
  }).filter(route => route !== null);
}
