import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ICEM Smart Notice Portal Shared Backend Server`);
  console.log(` Environment : ${env.NODE_ENV}`);
  console.log(` Port        : ${PORT}`);
  console.log(` API Base    : http://localhost:${PORT}/api/v1`);
  console.log(` Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
