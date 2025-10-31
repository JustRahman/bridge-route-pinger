# Fix X402 Payment Verification

## Problem
Agent-kit X402 payment verification isn't working. Handler runs and fetches data, but still returns 402.

## Working Reference Implementation
Another bounty submission uses these packages successfully:
- `@lucid-dreams/agent-kit@0.2.22`
- `x402@0.7.1`
- `x402-fetch@0.7.0`

Their test script pattern:
```javascript
import { createSigner } from 'x402-fetch';
import { createPaymentHeader, selectPaymentRequirements } from 'x402/client';
import { PaymentRequirementsSchema } from 'x402/types';

const signer = await createSigner(NETWORK, PRIVATE_KEY);
const paymentHeader = await createPaymentHeader(signer, x402Version, selected);

// Then use X-PAYMENT header in request
```

## Current Issue
When running test-real-payment.js:
- Signer address shows as `undefined`
- Payment header is created but doesn't verify
- Handler runs (logs show it fetches routes)
- Still returns 402 instead of routes

## Files
- `agent.js` - Has `useConfigPayments: true` on line 19
- `test-real-payment.js` - Uses x402 packages but payment doesn't verify
- Test wallet: Has 0.1 USDC + ETH on Base

## Task
Fix the x402 payment verification so:
1. `createSigner` properly creates signer with address
2. Payment header verifies with agent-kit
3. Request with X-PAYMENT header returns bridge routes (not 402)

Compare our implementation with working submissions from:
- https://github.com/ShivanshKandpal/bounty5-auditor

Debug why signer.address is undefined and payment doesn't verify.