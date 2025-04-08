import { createMcpServer } from './server.js';

// Handle process events
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.log('Unhandled rejection:', error);
  process.exit(1);
});

createMcpServer().catch(console.error);
