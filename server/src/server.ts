import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Yahoo Pulse API running on http://localhost:${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Allowed Client: ${env.CLIENT_URL}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown handling
const shutdown = () => {
  console.log('Shutting down Yahoo Pulse API gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
