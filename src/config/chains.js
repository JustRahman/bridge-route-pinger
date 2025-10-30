// Chain ID mappings

export const CHAIN_IDS = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  avalanche: 43114,
  bsc: 56,
  fantom: 250
};

export const CHAIN_NAMES = {
  1: 'ethereum',
  137: 'polygon',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
  43114: 'avalanche',
  56: 'bsc',
  250: 'fantom'
};

// LI.FI uses different chain identifiers
export const LIFI_CHAIN_NAMES = {
  ethereum: 'ETH',
  polygon: 'POL',
  arbitrum: 'ARB',
  optimism: 'OPT',
  base: 'BAS',
  avalanche: 'AVA',
  bsc: 'BSC',
  fantom: 'FTM'
};

// Get chain ID from name
export function getChainId(chainName) {
  const normalized = chainName.toLowerCase();
  const chainId = CHAIN_IDS[normalized];
  if (!chainId) {
    throw new Error(`Chain ${chainName} not supported`);
  }
  return chainId;
}

// Get chain name from ID
export function getChainName(chainId) {
  return CHAIN_NAMES[chainId] || 'unknown';
}

// Get LI.FI chain identifier
export function getLifiChainName(chainName) {
  const normalized = chainName.toLowerCase();
  return LIFI_CHAIN_NAMES[normalized] || chainName.toUpperCase();
}

// Supported chains list
export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'];
