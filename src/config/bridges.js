// Known bridge metadata

export const BRIDGE_METADATA = {
  'across': {
    name: 'Across Protocol',
    url: 'https://across.to',
    confidence: 'HIGH'
  },
  'across-protocol': {
    name: 'Across Protocol',
    url: 'https://across.to',
    confidence: 'HIGH'
  },
  'stargate': {
    name: 'Stargate',
    url: 'https://stargate.finance',
    confidence: 'HIGH'
  },
  'connext': {
    name: 'Connext',
    url: 'https://bridge.connext.network',
    confidence: 'HIGH'
  },
  'hop': {
    name: 'Hop Protocol',
    url: 'https://hop.exchange',
    confidence: 'HIGH'
  },
  'celer': {
    name: 'Celer cBridge',
    url: 'https://cbridge.celer.network',
    confidence: 'HIGH'
  },
  'hyphen': {
    name: 'Hyphen',
    url: 'https://hyphen.biconomy.io',
    confidence: 'MEDIUM'
  },
  'polygon-bridge': {
    name: 'Polygon Bridge',
    url: 'https://wallet.polygon.technology/bridge',
    confidence: 'HIGH'
  },
  'arbitrum-bridge': {
    name: 'Arbitrum Bridge',
    url: 'https://bridge.arbitrum.io',
    confidence: 'HIGH'
  },
  'optimism-bridge': {
    name: 'Optimism Bridge',
    url: 'https://app.optimism.io/bridge',
    confidence: 'HIGH'
  },
  'base-bridge': {
    name: 'Base Bridge',
    url: 'https://bridge.base.org',
    confidence: 'HIGH'
  },
  'synapse': {
    name: 'Synapse',
    url: 'https://synapseprotocol.com',
    confidence: 'MEDIUM'
  },
  'multichain': {
    name: 'Multichain',
    url: 'https://multichain.org',
    confidence: 'LOW'
  },
  'allbridge': {
    name: 'Allbridge',
    url: 'https://allbridge.io',
    confidence: 'MEDIUM'
  },
  'wormhole': {
    name: 'Wormhole',
    url: 'https://wormhole.com',
    confidence: 'HIGH'
  }
};

// Format bridge name for display
export function formatBridgeName(bridgeName) {
  const normalized = bridgeName.toLowerCase().replace(/\s+/g, '-');
  const metadata = BRIDGE_METADATA[normalized];
  return metadata ? metadata.name : bridgeName;
}

// Get bridge URL
export function getBridgeUrl(bridgeName) {
  const normalized = bridgeName.toLowerCase().replace(/\s+/g, '-');
  const metadata = BRIDGE_METADATA[normalized];
  return metadata ? metadata.url : 'https://unknown-bridge.com';
}

// Get bridge confidence level
export function getConfidence(bridgeName) {
  const normalized = bridgeName.toLowerCase().replace(/\s+/g, '-');
  const metadata = BRIDGE_METADATA[normalized];
  return metadata ? metadata.confidence : 'MEDIUM';
}

// Get requirements based on route
export function getRequirements(route, token, fromChain, toChain) {
  const requirements = [];

  // Gas requirement
  if (fromChain === 'ethereum') {
    requirements.push('ETH for gas on Ethereum');
  } else if (fromChain === 'polygon') {
    requirements.push('MATIC for gas on Polygon');
  } else if (fromChain === 'arbitrum') {
    requirements.push('ETH for gas on Arbitrum');
  } else if (fromChain === 'optimism') {
    requirements.push('ETH for gas on Optimism');
  } else if (fromChain === 'base') {
    requirements.push('ETH for gas on Base');
  }

  // Output requirement
  requirements.push(`Will receive ${token} on ${toChain.charAt(0).toUpperCase() + toChain.slice(1)}`);

  // Bridge-specific requirements
  const bridgeName = route.usedBridgeNames ? route.usedBridgeNames[0] : '';
  if (bridgeName && bridgeName.toLowerCase().includes('stargate')) {
    requirements.push('STG tokens recommended for lower fees');
  }

  return requirements;
}
