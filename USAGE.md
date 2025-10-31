# Bridge Route Pinger - Usage Guide

## ✅ X402 Payment Verification WORKING!

Your bridge route pinger agent now successfully accepts X402 payments using your funded wallet.

## Quick Start

### 1. Start the Server
```bash
npm start
```

Server will start on port 3000 with X402 payment enforcement enabled:
```
🌉 Bridge Route Pinger Agent
📡 Server running on port 3000
✅ X402 payments handled automatically by @lucid-dreams/agent-kit
💰 Payment: 0.02 USDC on Base network
💳 Recipient: 0x992920386E3D950BC260f99C81FDA12419eD4594
```

### 2. Test Payment Flow

**Unpaid Request (Returns 402):**
```bash
curl -X POST http://localhost:3000/entrypoints/get_bridge_routes/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "token": "USDC",
      "amount": "100",
      "from_chain": "ethereum",
      "to_chain": "polygon"
    }
  }'
```

**Response:**
```json
{
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "20000",
    "payTo": "0x992920386E3D950BC260f99C81FDA12419eD4594",
    ...
  }]
}
```
Status: **402 Payment Required**

**Paid Request (Returns 200):**
```bash
node test-x402-wrapped.js
```

**Response:**
```
✅ SUCCESS! Payment verified and bridge routes returned!

📊 BRIDGE ROUTES:
{
  "status": "succeeded",
  "output": {
    "routes": [...],
    "recommended_route": {...},
    "summary": {
      "total_routes_found": 1,
      "best_fee": "$0.34",
      "fastest_eta": "20 minutes"
    }
  }
}
```
Status: **200 OK**

## Using Your Funded Wallet

### Wallet Details
- Address: `0x9615336fA264E6bA7dC7BA892Bb5e99e58B83746`
- Network: Base Mainnet
- Balance: 0.09 USDC + 0.7 ETH (for gas)

### Private Key (Already in test files)
Your private key is configured in:
- `test-x402-wrapped.js`
- `test-real-payment.js`
- `test-debug.js`

```javascript
const PRIVATE_KEY = "0xd659e6909998095de0c61466eaa9296a8f4f036b61eaa47104af013e5b601089";
```

### Test Scripts

**1. Correct Approach - wrapFetchWithPayment:**
```bash
node test-x402-wrapped.js
```
This automatically handles:
- Initial 402 response
- Payment header creation
- Signature generation
- Retry with payment proof

**2. Manual Approach - createPaymentHeader:**
```bash
node test-real-payment.js
```
Manual step-by-step:
- Get 402 response
- Parse payment requirements
- Create payment header
- Retry with X-PAYMENT header

**3. Debug Mode:**
```bash
node test-debug.js
```
Shows detailed payment flow inspection.

## Client Integration Example

```javascript
import { createSigner } from 'x402-fetch';
import { wrapFetchWithPayment } from 'x402-fetch';
import fetch from 'node-fetch';

// Your wallet private key (KEEP SECRET!)
const PRIVATE_KEY = "0xd659e6909998095de0c61466eaa9296a8f4f036b61eaa47104af013e5b601089";

// Create signer for Base network
const signer = await createSigner("base", PRIVATE_KEY);

// Wrap fetch with automatic payment handling
const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  signer,
  BigInt(100000)  // Max payment: 0.1 USDC
);

// Make request - payment happens automatically!
const response = await fetchWithPayment(
  'http://localhost:3000/entrypoints/get_bridge_routes/invoke',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
        token: "USDC",
        amount: "100",
        from_chain: "ethereum",
        to_chain: "polygon"
      }
    })
  }
);

const data = await response.json();
console.log('Bridge routes:', data);
```

## Payment Details

- **Cost per request:** 0.02 USDC
- **Network:** Base Mainnet
- **Payment token:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Recipient:** 0x992920386E3D950BC260f99C81FDA12419eD4594
- **Facilitator:** https://facilitator.daydreams.systems

## Configuration

Payment settings are in `.env`:
```env
PORT=3000
FACILITATOR_URL=https://facilitator.daydreams.systems
PAY_TO_WALLET=0x992920386E3D950BC260f99C81FDA12419eD4594
PAYMENT_NETWORK=base
PAYMENT_AMOUNT=0.02
PAYMENT_CURRENCY=USDC
```

And in `src/agent.js`:
```javascript
const { app, addEntrypoint } = createAgentApp(
  { name, version, description },
  {
    config: {
      payments: {
        facilitatorUrl: process.env.FACILITATOR_URL,
        payTo: process.env.PAY_TO_WALLET,
        network: process.env.PAYMENT_NETWORK,
        defaultPrice: process.env.PAYMENT_AMOUNT
      }
    },
    useConfigPayments: true  // ✅ Must be true!
  }
);
```

## Troubleshooting

### Payment Not Accepted (Still 402)
1. Check wallet has USDC balance on Base
2. Check wallet has ETH for gas fees
3. Verify `useConfigPayments: true` in `src/agent.js`
4. Verify private key is correct

### Insufficient Balance
Check balance with:
```bash
# ETH balance
cast balance 0x9615336fA264E6bA7dC7BA892Bb5e99e58B83746 \
  --rpc-url https://mainnet.base.org

# USDC balance
cast call 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
  "balanceOf(address)(uint256)" \
  0x9615336fA264E6bA7dC7BA892Bb5e99e58B83746 \
  --rpc-url https://mainnet.base.org
```

## Next Steps

1. Test with different bridge routes
2. Integrate into your application
3. Monitor payment transactions on Base
4. Consider using Base Sepolia testnet for development

## Support

For X402 protocol questions: https://docs.x402.org
For agent-kit questions: https://github.com/lucid-dreams-ai/agent-kit
