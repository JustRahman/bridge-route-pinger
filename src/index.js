import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './agent.js';

const PORT = parseInt(process.env.PORT || '3000');

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log('🌉 Bridge Route Pinger Agent');
  console.log(`📡 Server running on port ${info.port}`);
  console.log(`🔗 http://localhost:${info.port}`);
  console.log(`📋 Manifest: http://localhost:${info.port}/.well-known/agent.json`);
  console.log('');
  console.log('✅ X402 payments handled automatically by @lucid-dreams/agent-kit');
  console.log('💰 Payment: 0.02 USDC on Base network');
  console.log(`💳 Recipient: ${process.env.PAY_TO_WALLET || '0x992920386E3D950BC260f99C81FDA12419eD4594'}`);
  console.log('');
  console.log('Ready to process bridge route requests!');
});
