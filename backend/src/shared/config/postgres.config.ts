import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); // Load .env

const prisma = new PrismaClient();

export const connectPostgres = async (): Promise<void> => {
  try {
    console.log('Connecting to:', process.env.DATABASE_URL); // debug
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};
