// Token address mappings across different chains

export const USDC_ADDRESSES = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};

export const USDT_ADDRESSES = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
};

export const ETH_ADDRESSES = {
  ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
  arbitrum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  optimism: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  base: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
};

export const WETH_ADDRESSES = {
  ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  optimism: '0x4200000000000000000000000000000000000006',
  base: '0x4200000000000000000000000000000000000006'
};

// Token decimals
export const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
  ETH: 18,
  WETH: 18
};

// Get token address for a specific chain
export function getTokenAddress(token, chain) {
  const normalizedToken = token.toUpperCase();
  const normalizedChain = chain.toLowerCase();

  switch (normalizedToken) {
    case 'USDC':
      return USDC_ADDRESSES[normalizedChain];
    case 'USDT':
      return USDT_ADDRESSES[normalizedChain];
    case 'ETH':
      return ETH_ADDRESSES[normalizedChain];
    case 'WETH':
      return WETH_ADDRESSES[normalizedChain];
    default:
      throw new Error(`Token ${token} not supported`);
  }
}

// Get token decimals
export function getTokenDecimals(token) {
  const normalizedToken = token.toUpperCase();
  return TOKEN_DECIMALS[normalizedToken] || 18;
}

// Supported tokens list
export const SUPPORTED_TOKENS = ['USDC', 'USDT', 'ETH', 'WETH'];
