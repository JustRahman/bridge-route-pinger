import { z } from "zod";
import { createAgentApp } from "@lucid-dreams/agent-kit";
import { getLifiRoutes } from './services/lifiBridge.js';

// Create agent app with payment configuration
const { app, addEntrypoint } = createAgentApp(
  {
    name: "bridge-route-pinger",
    version: "1.0.0",
    description: "List viable bridge routes and live fee/time quotes for cross-chain token transfers"
  },
  {
    config: {
      payments: {
        facilitatorUrl: process.env.FACILITATOR_URL || "https://facilitator.daydreams.systems",
        payTo: process.env.PAY_TO_WALLET || "0x992920386E3D950BC260f99C81FDA12419eD4594",
        network: process.env.PAYMENT_NETWORK || "base",
        defaultPrice: process.env.PAYMENT_AMOUNT || "0.02"
      }
    },
    useConfigPayments: true  // ✅ ENABLED - Testing with funded wallet
  }
);

// Define input schema
const BridgeRouteInputSchema = z.object({
  token: z.enum(["USDC", "USDT", "ETH", "WETH"])
    .describe("Token to bridge (USDC, USDT, ETH, or WETH)"),
  amount: z.string()
    .describe("Amount to bridge (e.g., '100')"),
  from_chain: z.enum(["ethereum", "polygon", "arbitrum", "optimism", "base"])
    .describe("Source chain"),
  to_chain: z.enum(["ethereum", "polygon", "arbitrum", "optimism", "base"])
    .describe("Destination chain"),
});

// Add bridge routes endpoint
addEntrypoint({
  key: "get_bridge_routes",
  description: "Get optimal bridge routes with fees and time estimates for cross-chain token transfers",
  input: BridgeRouteInputSchema,

  async handler({ input }) {
    const { token, amount, from_chain, to_chain } = input;

    try {
      // Validate inputs
      if (from_chain === to_chain) {
        return {
          output: {
            error: "Source and destination chains must be different",
            token,
            amount,
            from_chain,
            to_chain
          },
          usage: { total_tokens: 0 }
        };
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return {
          output: {
            error: "Invalid amount. Must be a positive number.",
            token,
            amount,
            from_chain,
            to_chain
          },
          usage: { total_tokens: 0 }
        };
      }

      // Fetch routes from LI.FI
      console.log(`Fetching routes for ${amount} ${token} from ${from_chain} to ${to_chain}`);
      const routes = await getLifiRoutes(token, amountNum, from_chain, to_chain);

      if (routes.length === 0) {
        return {
          output: {
            message: "No viable bridge routes found for this transfer",
            token,
            amount,
            from_chain,
            to_chain,
            routes: [],
            timestamp: new Date().toISOString()
          },
          usage: { total_tokens: 0 }
        };
      }

      // Sort routes by total cost (ascending)
      routes.sort((a, b) => a.total_cost_usd - b.total_cost_usd);

      // Select recommended route (lowest cost)
      const recommended = routes[0];

      // Return formatted response
      return {
        output: {
          request: {
            token,
            amount,
            from_chain,
            to_chain
          },
          routes: routes.map((route, index) => ({
            rank: index + 1,
            ...route
          })),
          recommended_route: {
            ...recommended,
            reason: "Lowest total cost (fees + gas)"
          },
          summary: {
            total_routes_found: routes.length,
            best_fee: `$${recommended.total_cost_usd}`,
            fastest_eta: `${Math.min(...routes.map(r => r.eta_minutes))} minutes`,
            cheapest_bridge: recommended.bridge_name
          },
          timestamp: new Date().toISOString()
        },
        usage: {
          total_tokens: routes.length
        }
      };

    } catch (error) {
      console.error('Bridge route error:', error.message);

      return {
        output: {
          error: `Failed to fetch bridge routes: ${error.message}`,
          token,
          amount,
          from_chain,
          to_chain,
          routes: [],
          timestamp: new Date().toISOString()
        },
        usage: {
          total_tokens: 0
        }
      };
    }
  }
});

// Start the server
export async function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log('🌉 Bridge Route Pinger Agent');
      console.log(`📡 Server running on port ${port}`);
      console.log(`🔗 http://localhost:${port}`);
      console.log(`📋 Manifest: http://localhost:${port}/.well-known/agent.json`);
      console.log('');
      console.log('✅ X402 payments handled automatically by @lucid-dreams/agent-kit');
      console.log('💰 Payment: 0.02 USDC on Base network');
      console.log(`💳 Recipient: ${process.env.PAY_TO_WALLET || '0x992920386E3D950BC260f99C81FDA12419eD4594'}`);
      console.log('');
      console.log('Ready to process bridge route requests!');
      resolve(server);
    });

    server.on('error', reject);
  });
}

export default app;
