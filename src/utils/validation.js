import { SUPPORTED_TOKENS } from '../config/tokens.js';
import { SUPPORTED_CHAINS } from '../config/chains.js';

/**
 * Validate bridge route request
 * @param {Object} body - Request body
 * @returns {Object} Validated and normalized parameters
 * @throws {Error} If validation fails
 */
export function validateBridgeRequest(body) {
  const { token, amount, from_chain, to_chain } = body;

  // Validate token
  if (!token) {
    throw new Error('Token is required');
  }

  const normalizedToken = token.toUpperCase();
  if (!SUPPORTED_TOKENS.includes(normalizedToken)) {
    throw new Error(
      `Token ${token} not supported. Supported tokens: ${SUPPORTED_TOKENS.join(', ')}`
    );
  }

  // Validate chains
  if (!from_chain) {
    throw new Error('from_chain is required');
  }

  if (!to_chain) {
    throw new Error('to_chain is required');
  }

  const normalizedFromChain = from_chain.toLowerCase();
  const normalizedToChain = to_chain.toLowerCase();

  if (!SUPPORTED_CHAINS.includes(normalizedFromChain)) {
    throw new Error(
      `Chain ${from_chain} not supported. Supported chains: ${SUPPORTED_CHAINS.join(', ')}`
    );
  }

  if (!SUPPORTED_CHAINS.includes(normalizedToChain)) {
    throw new Error(
      `Chain ${to_chain} not supported. Supported chains: ${SUPPORTED_CHAINS.join(', ')}`
    );
  }

  // Same chain check
  if (normalizedFromChain === normalizedToChain) {
    throw new Error('Source and destination chains cannot be the same');
  }

  // Validate amount
  if (!amount) {
    throw new Error('Amount is required');
  }

  const amountNum = parseFloat(amount);

  if (isNaN(amountNum)) {
    throw new Error('Amount must be a valid number');
  }

  if (amountNum <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Minimum amount check (allow smaller amounts for expensive tokens like ETH)
  const minAmount = ['ETH', 'WETH'].includes(normalizedToken) ? 0.001 : 1;
  if (amountNum < minAmount) {
    throw new Error(`Minimum bridge amount is ${minAmount} ${normalizedToken}`);
  }

  // Maximum amount check (reasonable limit)
  if (amountNum > 1000000) {
    throw new Error('Maximum bridge amount is 1,000,000 tokens');
  }

  return {
    token: normalizedToken,
    amount: amountNum,
    from_chain: normalizedFromChain,
    to_chain: normalizedToChain
  };
}

/**
 * Create standardized error response
 * @param {string} errorCode - Error code
 * @param {string} message - Error message
 * @param {Object} additional - Additional error data
 * @returns {Object} Error response object
 */
export function createErrorResponse(errorCode, message, additional = {}) {
  return {
    error: errorCode,
    message,
    ...additional
  };
}
