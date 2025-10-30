import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyX402Payment } from './middleware/x402.js';
import { validateBridgeRequest, createErrorResponse } from './utils/validation.js';
import { aggregateRoutes } from './services/routeAggregator.js';
import { optimizeRoutes, getWarnings } from './services/routeOptimizer.js';
import { getCacheKey, getCache, setCache, getCacheStats } from './utils/cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve .well-known directory for X402 manifest
app.use('/.well-known', express.static('.well-known'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Bridge Route Pinger',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      routes: 'POST /api/v1/bridge/routes',
      manifest: 'GET /.well-known/agent.json',
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: getCacheStats()
  });
});

// Main bridge routes endpoint
app.post('/api/v1/bridge/routes', verifyX402Payment, async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate request
    const validatedParams = validateBridgeRequest(req.body);
    const { token, amount, from_chain, to_chain } = validatedParams;

    console.log(`\n=== Bridge Route Request ===`);
    console.log(`Token: ${token}, Amount: ${amount}`);
    console.log(`Route: ${from_chain} → ${to_chain}`);

    // Check cache
    const cacheKey = getCacheKey(token, amount, from_chain, to_chain);
    const cachedResult = getCache(cacheKey);

    if (cachedResult) {
      console.log('Returning cached result');
      return res.json(cachedResult);
    }

    // Fetch routes from aggregators
    const routes = await aggregateRoutes(token, amount, from_chain, to_chain);

    // Check if routes were found
    if (routes.length === 0) {
      return res.status(404).json(
        createErrorResponse(
          'NO_ROUTES',
          'No bridge routes found for this combination',
          {
            suggestion: 'Try a different token or chain pair',
            supported_tokens: ['USDC', 'USDT', 'ETH', 'WETH'],
            supported_chains: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']
          }
        )
      );
    }

    // Optimize routes and get recommendation
    const optimized = optimizeRoutes(routes, token, amount);

    // Build response
    const response = {
      token,
      amount: amount.toString(),
      from_chain,
      to_chain,
      timestamp: new Date().toISOString(),
      routes: optimized.routes,
      recommended_route: optimized.recommended_route,
      warnings: getWarnings(token, amount),
      response_time_ms: Date.now() - startTime
    };

    // Cache the result
    setCache(cacheKey, response);

    console.log(`Found ${routes.length} routes in ${response.response_time_ms}ms`);
    console.log(`Recommended: ${optimized.recommended_route?.bridge_name}`);
    console.log('===========================\n');

    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error.message);

    // Handle validation errors
    if (error.message.includes('not supported') ||
        error.message.includes('required') ||
        error.message.includes('cannot be the same') ||
        error.message.includes('must be')) {
      return res.status(400).json(
        createErrorResponse('INVALID_REQUEST', error.message)
      );
    }

    // Handle other errors
    res.status(500).json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'An error occurred while fetching bridge routes',
        {
          suggestion: 'Please try again in a moment'
        }
      )
    );
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(
    createErrorResponse(
      'NOT_FOUND',
      `Endpoint ${req.method} ${req.path} not found`,
      {
        available_endpoints: {
          routes: 'POST /api/v1/bridge/routes',
          manifest: 'GET /.well-known/agent.json',
          health: 'GET /health'
        }
      }
    )
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌉 Bridge Route Pinger API`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📋 Manifest: http://localhost:${PORT}/.well-known/agent.json`);
  console.log(`\n✅ Ready to aggregate bridge routes!\n`);
});

export default app;
