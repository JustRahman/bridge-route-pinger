# Bridge Route Pinger 🌉

X402-compatible API that aggregates bridge routes across multiple providers and returns live fee/time quotes for cross-chain token transfers.

## Features

- 🔄 Aggregates routes from Socket.tech and LI.FI APIs
- 💰 Real-time fee and gas estimates
- ⚡ Smart route recommendations (cost vs speed optimization)
- 🔒 X402 payment integration
- ⚡ 30-second response caching
- 🌐 Supports 5 chains and 4 tokens
- 📊 Comprehensive route comparison

## Supported Chains

- Ethereum (mainnet)
- Polygon
- Arbitrum
- Optimism
- Base

## Supported Tokens

- USDC
- USDT
- ETH
- WETH

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode (with auto-reload)
npm run dev
```

The server will start on port 3000 by default (or `PORT` environment variable if set).

**No API keys required!** The bridge aggregator APIs (Socket.tech and LI.FI) are free and public.

## Payment Integration (X402)

This API requires payment via the X402 protocol for each request.

### Payment Details
- **Amount:** 0.02 USDC
- **Network:** Base
- **Recipient:** EdTWN4SLpnBMnrwsmuD6nrbnDua5YDMJ1We3g8nmCZvS
- **Facilitator:** https://facilitator.daydreams.systems

### Testing Payment Flow

1. **Set up environment:**
```bash
cp .env.example .env
# Add your PRIVATE_KEY for testing (optional)
```

2. **Run payment test:**
```bash
npm run test:payment
```

This script:
1. Calls API without payment (receives 402)
2. Creates payment via facilitator
3. Retries with payment token
4. Shows successful response

### Manual Payment Flow

**Step 1: Get 402 response**
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -d '{"token":"USDC","amount":"100","from_chain":"ethereum","to_chain":"polygon"}'
```

Response includes payment mandate with instructions.

**Step 2: Create payment**
```bash
curl -X POST https://facilitator.daydreams.systems/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "0.02",
    "currency": "USDC",
    "recipient": "EdTWN4SLpnBMnrwsmuD6nrbnDua5YDMJ1We3g8nmCZvS",
    "network": "base"
  }'
```

**Step 3: Retry with payment token**
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: <transaction_hash>" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{"token":"USDC","amount":"100","from_chain":"ethereum","to_chain":"polygon"}'
```

### Environment Variables for Payment

Required in `.env` or deployment environment:

```bash
FACILITATOR_URL=https://facilitator.daydreams.systems
PAY_TO_WALLET=EdTWN4SLpnBMnrwsmuD6nrbnDua5YDMJ1We3g8nmCZvS
PAYMENT_NETWORK=base
PAYMENT_AMOUNT=0.02
PAYMENT_CURRENCY=USDC

# Optional: For testing payment flow
PRIVATE_KEY=your_private_key
```

## API Endpoints

### POST /api/v1/bridge/routes

Get bridge routes for cross-chain token transfers.

**Headers:**
```
Content-Type: application/json
X-Payment-Token: <payment_token>
X-Payment-Amount: 0.02
X-Payment-Currency: USDC
```

**Request Body:**
```json
{
  "token": "USDC",
  "amount": "100",
  "from_chain": "ethereum",
  "to_chain": "polygon"
}
```

**Response:**
```json
{
  "token": "USDC",
  "amount": "100",
  "from_chain": "ethereum",
  "to_chain": "polygon",
  "timestamp": "2024-10-30T23:45:00Z",
  "routes": [
    {
      "bridge_name": "Across Protocol",
      "bridge_url": "https://across.to",
      "eta_minutes": 3,
      "fee_usd": 0.85,
      "fee_percentage": 0.85,
      "gas_estimate_usd": 2.50,
      "total_cost_usd": 3.35,
      "output_amount": 96.65,
      "requirements": [
        "ETH for gas on Ethereum",
        "Will receive USDC on Polygon"
      ],
      "confidence": "HIGH",
      "bridge_contract": "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5"
    }
  ],
  "recommended_route": {
    "bridge_name": "Across Protocol",
    "reason": "Lowest total cost with acceptable speed"
  },
  "warnings": [
    "Always verify bridge contracts before approving tokens",
    "Bridge times are estimates and may vary with network congestion"
  ],
  "response_time_ms": 1250
}
```

### GET /.well-known/agent.json

X402 manifest file describing the API.

### GET /health

Health check endpoint with cache statistics.

## Test Commands

### Test 1: USDC Ethereum → Polygon
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: test_token_123" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{
    "token": "USDC",
    "amount": "100",
    "from_chain": "ethereum",
    "to_chain": "polygon"
  }'
```

### Test 2: ETH Ethereum → Arbitrum
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: test_token_123" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{
    "token": "ETH",
    "amount": "0.5",
    "from_chain": "ethereum",
    "to_chain": "arbitrum"
  }'
```

### Test 3: USDT Polygon → Base
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: test_token_123" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{
    "token": "USDT",
    "amount": "50",
    "from_chain": "polygon",
    "to_chain": "base"
  }'
```

### Test 4: Invalid Token (should fail)
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: test_token_123" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{
    "token": "SHIB",
    "amount": "1000",
    "from_chain": "ethereum",
    "to_chain": "polygon"
  }'
```

### Test 5: Missing Payment (should fail with 402)
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -d '{
    "token": "USDC",
    "amount": "100",
    "from_chain": "ethereum",
    "to_chain": "polygon"
  }'
```

### Test 6: Same Chain Error (should fail)
```bash
curl -X POST http://localhost:3000/api/v1/bridge/routes \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: test_token_123" \
  -H "X-Payment-Amount: 0.02" \
  -H "X-Payment-Currency: USDC" \
  -d '{
    "token": "USDC",
    "amount": "100",
    "from_chain": "ethereum",
    "to_chain": "ethereum"
  }'
```

## How It Works

1. **Request Validation** - Validates token, chains, and amount
2. **X402 Payment Verification** - Checks payment headers (0.02 USDC required)
3. **Cache Check** - Returns cached results if available (30-second TTL)
4. **Parallel API Calls** - Fetches routes from Socket.tech and LI.FI simultaneously
5. **Route Aggregation** - Combines and deduplicates routes
6. **Route Optimization** - Sorts by total cost, recommends best option
7. **Response** - Returns sorted routes with recommendation and warnings

## Architecture

```
/
├── src/
│   ├── index.js                  # Express server + routes
│   ├── middleware/
│   │   └── x402.js              # X402 payment verification
│   ├── services/
│   │   ├── socketBridge.js      # Socket.tech API integration
│   │   ├── lifiBridge.js        # LI.FI API integration
│   │   ├── routeAggregator.js   # Combine results
│   │   └── routeOptimizer.js    # Sort and recommend
│   ├── config/
│   │   ├── tokens.js            # Token addresses
│   │   ├── chains.js            # Chain IDs
│   │   └── bridges.js           # Bridge metadata
│   └── utils/
│       ├── cache.js             # 30-second caching
│       └── validation.js        # Input validation
├── .well-known/
│   └── agent.json               # X402 manifest
└── package.json
```

## Bridge Providers

Routes are aggregated from:

- **Socket.tech** - Aggregates 15+ bridges including:
  - Across Protocol
  - Stargate Finance
  - Connext
  - Hop Protocol
  - Celer cBridge
  - And more...

- **LI.FI** - Additional bridge aggregator for redundancy

## Error Handling

The API handles various error cases with appropriate HTTP status codes:

- `400` - Invalid request (bad token, chain, or amount)
- `402` - Payment required (missing or invalid X402 payment)
- `404` - No routes found
- `500` - Internal server error

All errors return JSON with `error`, `message`, and optional `suggestion` fields.

## Performance

- Target response time: < 3 seconds
- Cache TTL: 30 seconds
- Parallel API calls for faster aggregation
- Automatic cache cleanup

## Deployment

### Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect and deploy
4. No environment variables needed (APIs are public)

### Other Platforms

Works on any Node.js hosting platform:
- Vercel
- Render
- Heroku
- DigitalOcean App Platform

## Environment Variables

Optional environment variables:

- `PORT` - Server port (default: 3000)

**No API keys required!** All bridge APIs are free and public.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions:
- Open a GitHub issue
- Check the API documentation at `/.well-known/agent.json`

---

Built for the X402 Agent Bounty Program 🚀
