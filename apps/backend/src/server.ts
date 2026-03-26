import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`FitCheck API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
