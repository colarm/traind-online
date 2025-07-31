import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import routes from './routes';
import { connectMongo } from './shared/config/mongo.config';
import { connectPostgres } from './shared/config/postgres.config';
import { errorHandler } from './shared/middlewares/error.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    await connectMongo();
    await connectPostgres();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
